import { Request, Response } from 'express';
import pool from '../database/connection';
import barionService from '../services/barion';
import bookingService from '../services/booking';
import emailService from '../services/email';
import szamlazzService from '../services/szamlazz';
import config from '../config';

type PostCommitAction = 'finalize' | 'booking-failed' | 'not-found' | 'none';

interface PaymentOutcome {
  orderId: string;
  action: PostCommitAction;
}

/**
 * Generate the invoice and send the confirmation email for a paid order.
 *
 * This deliberately runs AFTER the payment transaction has been committed.
 * Szamlazz.hu and SMTP are slow third-party services; when they were called
 * while the transaction was still open, the order row stayed locked and the
 * 'paid' status stayed invisible until they answered. The customer's payment
 * result page then kept polling a still-'pending' order, ran out of attempts
 * and showed a false "payment failed" screen even though the money arrived.
 *
 * Safe to run more than once. The invoice and the confirmation email are each
 * skipped when they already exist, so a Barion webhook retry cannot
 * double-invoice or double-email a customer.
 */
async function finalizePaidOrder(orderId: string): Promise<void> {
  const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);

  if (orderResult.rows.length === 0) {
    console.error('❌ finalizePaidOrder: order not found:', orderId);
    return;
  }

  const order = orderResult.rows[0];

  // Loaded after the bookings were created, so booking_id and checkin_code are set
  const itemsResult = await pool.query(`
    SELECT oi.*, r.name as room_name, se.name as special_event_name, se.id as special_event_id
    FROM order_items oi
    LEFT JOIN rooms r ON r.id = oi.room_id
    LEFT JOIN special_event_bookings seb ON seb.order_item_id = oi.id
    LEFT JOIN special_events se ON se.id = seb.special_event_id
    WHERE oi.order_id = $1
  `, [orderId]);

  const orderItems = itemsResult.rows;

  // ---- Invoice via Szamlazz.hu ----
  let invoiceId: string | null = null;
  let invoicePdf: Buffer | undefined;

  // A failed lookup must never stop the confirmation email, so it is treated
  // as "no invoice yet" rather than being allowed to abort the whole function.
  let invoiceAlreadyExists = false;
  try {
    const existingInvoice = await pool.query(
      'SELECT id FROM invoices WHERE order_id = $1 LIMIT 1',
      [orderId]
    );
    invoiceAlreadyExists = existingInvoice.rows.length > 0;
  } catch (lookupError) {
    console.error('Could not check for an existing invoice:', lookupError);
  }

  if (invoiceAlreadyExists) {
    console.log('📄 Invoice already exists for order, skipping generation:', orderId);
  } else if (szamlazzService.isEnabled()) {
    console.log('📄 Generating invoice via Szamlazz.hu...');
    try {
      // Prepare invoice items (VAT-free)
      const invoiceItems = orderItems.map((item: any) => {
        const itemPrice = item.price || (order.total_amount / orderItems.length);

        // Format booking date: Convert "2025-11-11" to "2025. Nov 11"
        const bookingDate = new Date(item.booking_date);
        const formattedDate = bookingDate.toLocaleDateString('hu-HU', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        // Bill in the unit the slot was actually sold in: the makeup rooms are
        // sold in half hours, the studios in whole hours.
        const toMinutes = (t: string) => {
          const [h, m] = String(t).split(':').map(Number);
          return h * 60 + (m || 0);
        };
        const slotMinutes = toMinutes(item.end_time) - toMinutes(item.start_time);
        const bookingUnit = slotMinutes > 0 && slotMinutes < 60 ? 'fél óra' : 'óra';

        const eventName = item.special_event_name ? ` - ${item.special_event_name}` : '';
        return {
          name: `${item.room_name || 'Studio'}${eventName} foglalás - ${formattedDate} ${item.start_time}-${item.end_time}${item.booking_id ? ` (${item.booking_id})` : ''}`,
          quantity: 1,
          unit: item.special_event_id ? 'alkalom' : bookingUnit,
          netUnitPrice: Math.round(itemPrice),
          vatRate: 0, // TAM - Tárgyi adó mentes
          netPrice: Math.round(itemPrice),
          vatAmount: 0,
          grossAmount: Math.round(itemPrice),
        };
      });

      // Prepare customer data
      // Note: Address fields are required from checkout form
      const customerData = {
        name: order.invoice_company || order.customer_name, // Use company name if booking as company
        email: order.email,
        phone: order.phone || undefined,
        taxNumber: order.invoice_tax_number || undefined,
        country: order.billing_country || 'HU',
        zip: order.billing_zip || '',
        city: order.billing_city || '',
        address: order.billing_street || '',
      };

      console.log('📍 Customer data for Szamlazz.hu:', {
        name: customerData.name,
        city: customerData.city,
        zip: customerData.zip,
        address: customerData.address,
        country: customerData.country,
      });

      const invoiceResponse = await szamlazzService.createInvoice({
        orderId: order.id,
        customer: customerData,
        items: invoiceItems,
        paymentMethod: config.szamlazz.invoice.paymentMethod,
        currency: config.szamlazz.invoice.currency,
        language: order.language || config.szamlazz.invoice.language,
        comment: undefined, // Booking IDs are now shown in each line item
      });

      if (invoiceResponse.success) {
        console.log('✅ Invoice generated:', invoiceResponse.invoiceNumber);

        invoiceId = await szamlazzService.saveInvoice(
          order.id,
          invoiceResponse,
          customerData,
          invoiceItems
        );

        // Store PDF for email attachment
        invoicePdf = invoiceResponse.pdfData;
      } else {
        console.error('❌ Failed to generate invoice:', invoiceResponse.errorMessage);
      }
    } catch (invoiceError) {
      console.error('Error generating invoice:', invoiceError);
      // Continue with the confirmation email even if invoicing fails
    }
  }

  // ---- Confirmation email ----
  // If the log cannot be read the email is still sent: a duplicate confirmation
  // is a far smaller problem for the customer than no confirmation at all.
  let confirmationAlreadySent = false;
  try {
    const alreadySent = await pool.query(
      `SELECT id FROM email_logs
       WHERE order_id = $1 AND email_type = 'confirmation' AND status = 'sent' LIMIT 1`,
      [orderId]
    );
    confirmationAlreadySent = alreadySent.rows.length > 0;
  } catch (lookupError) {
    console.error('Could not check the email log, sending confirmation anyway:', lookupError);
  }

  if (confirmationAlreadySent) {
    console.log('📧 Confirmation email already sent for order, skipping:', orderId);
    return;
  }

  console.log('📧 Sending confirmation email to:', order.email);
  try {
    const calendarFile = Buffer.from(
      emailService.generateCalendarFile(order, orderItems),
      'utf-8'
    );

    await emailService.sendBookingConfirmation(
      order,
      orderItems,
      calendarFile,
      invoicePdf // Attach invoice PDF if available
    );

  } catch (emailError) {
    console.error('Error sending confirmation email:', emailError);
    // Don't fail the booking process if email fails
    return;
  }

  // Mark invoice as sent now that the email has gone out
  if (invoiceId && invoicePdf) {
    try {
      await pool.query(`
        UPDATE invoices
        SET status = 'sent', sent_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [invoiceId]);
    } catch (updateError) {
      console.error('Could not mark invoice as sent:', updateError);
    }
  }
}

/**
 * Notify the customer that their payment went through but the booking could
 * not be created. Runs after the transaction has been committed.
 */
async function sendBookingFailureNotice(orderId: string): Promise<void> {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderResult.rows.length === 0) return;

    const itemsResult = await pool.query(`
      SELECT oi.*, r.name as room_name
      FROM order_items oi
      LEFT JOIN rooms r ON r.id = oi.room_id
      WHERE oi.order_id = $1
    `, [orderId]);

    await emailService.sendPaymentFailedNotification(orderResult.rows[0], itemsResult.rows);
  } catch (emailError) {
    console.error('Error sending payment failed email:', emailError);
  }
}

/**
 * Record the payment state and move the order to its final status.
 *
 * Everything here is fast and local, so the transaction is short lived and the
 * order row is unlocked almost immediately. Slow external work is reported back
 * to the caller through the returned action and performed after the commit.
 */
async function applyPaymentState(
  PaymentId: string,
  PaymentState: string,
  webhookBody: unknown
): Promise<PaymentOutcome> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update payment status
    const payload = JSON.stringify(webhookBody);
    await client.query(`
      UPDATE payments
      SET status = $1, payload_json = $2, updated_at = CURRENT_TIMESTAMP
      WHERE provider_ref = $3
    `, [PaymentState, payload, PaymentId]);

    console.log('✅ Payment status updated:', { PaymentId, PaymentState });

    // Get the order associated with this payment
    const orderResult = await client.query(`
      SELECT o.*, p.id as payment_id
      FROM orders o
      JOIN payments p ON p.order_id = o.id
      WHERE p.provider_ref = $1
    `, [PaymentId]);

    if (orderResult.rows.length === 0) {
      console.error('❌ Order not found for PaymentId:', PaymentId);
      await client.query('ROLLBACK');
      return { orderId: '', action: 'not-found' };
    }

    const order = orderResult.rows[0];
    console.log('📦 Order found:', { orderId: order.id, currentStatus: order.status });

    // Idempotency guard: the payment itself is already recorded. The order is
    // still handed to finalizePaidOrder, which skips the invoice and the email
    // when they exist, so a retry can finish work an interrupted run left undone.
    if (order.status === 'paid') {
      console.log('⚡ Order already paid, skipping payment processing for:', order.id);
      await client.query('COMMIT');
      return { orderId: order.id, action: 'finalize' };
    }

    if (PaymentState === 'Succeeded') {
      try {
        // Create internal bookings using booking service (runs its own transaction)
        const bookingResult = await bookingService.createBookings(order.id);

        if (!bookingResult.success) {
          throw new Error('Failed to create internal bookings');
        }

        // Update order status to paid
        await client.query(`
          UPDATE orders
          SET status = 'paid', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [order.id]);

        console.log('✅ Successfully created bookings:', bookingResult.bookingIds);

        await client.query('COMMIT');
        return { orderId: order.id, action: 'finalize' };

      } catch (bookingError) {
        console.error('Error creating internal bookings:', bookingError);

        // Mark order as failed
        await client.query(`
          UPDATE orders
          SET status = 'failed', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [order.id]);

        await client.query('COMMIT');
        return { orderId: order.id, action: 'booking-failed' };
      }
    }

    if (PaymentState === 'Failed' || PaymentState === 'Canceled' || PaymentState === 'Expired') {
      const dbStatus =
        PaymentState === 'Canceled' ? 'cancelled' :
        PaymentState === 'Expired' ? 'expired' : 'failed';
      await client.query(`
        UPDATE orders
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [dbStatus, order.id]);
    }

    await client.query('COMMIT');
    return { orderId: order.id, action: 'none' };

  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Connection may already be gone; the original error is what matters
    }
    throw error;
  } finally {
    client.release();
  }
}

export const handleBarionWebhook = async (req: Request, res: Response) => {
  const startTime = Date.now();
  console.log('📥 Barion webhook received:', {
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
    },
    timestamp: new Date().toISOString()
  });

  // Quickly validate and respond to Barion to avoid timeout
  let { PaymentId, PaymentState } = req.body;

  if (!PaymentId) {
    console.error('❌ Missing PaymentId in webhook');
    return res.status(400).json({ error: 'Missing PaymentId' });
  }

  console.log('💳 Processing Barion webhook:', { PaymentId, PaymentState });

  // If PaymentState is not provided, fetch it from Barion
  if (!PaymentState) {
    console.log('⚠️  PaymentState not provided in webhook, fetching from Barion API...');
    try {
      const paymentStatus = await barionService.getPaymentState(PaymentId);
      PaymentState = paymentStatus.Status;
      console.log('✅ Fetched PaymentState from Barion:', PaymentState);
    } catch (error) {
      console.error('❌ Failed to fetch PaymentState from Barion:', error);
      // Return 200 to prevent Barion from retrying
      return res.status(200).json({
        success: false,
        error: 'Could not fetch payment state',
        message: 'Webhook acknowledged'
      });
    }
  }

  let outcome: PaymentOutcome;

  try {
    // Phase 1: short transaction. Commits the final order status straight away
    // so the customer's result page stops seeing a 'pending' order.
    outcome = await applyPaymentState(PaymentId, PaymentState, req.body);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error in Barion webhook after ${duration}ms:`, error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    console.error('Request body:', req.body);

    // Still return 200 to Barion to prevent retry loops
    // The payment status will be checked via getPaymentState on user return
    return res.status(200).json({ success: false, error: 'Processing error', message: 'Webhook acknowledged' });
  }

  if (outcome.action === 'not-found') {
    return res.status(404).json({ error: 'Order not found' });
  }

  console.log(`✅ Payment state committed in ${Date.now() - startTime}ms`);

  // Phase 2: slow third-party work, with no transaction open and no row locked
  if (outcome.action === 'finalize') {
    try {
      await finalizePaidOrder(outcome.orderId);
    } catch (error) {
      console.error('Error finalizing paid order:', error);
    }
  } else if (outcome.action === 'booking-failed') {
    await sendBookingFailureNotice(outcome.orderId);
  }

  const duration = Date.now() - startTime;
  console.log(`✅ Webhook processed successfully in ${duration}ms`);

  // Always return success to Barion (even if some operations fail)
  // This prevents the "Hello Rosti!" error
  res.status(200).json({ success: true, message: 'Webhook received' });
};

// Cal.com webhook handler removed - using internal booking system
