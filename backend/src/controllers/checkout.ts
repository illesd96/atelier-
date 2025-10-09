import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../database/connection';
import barionService from '../services/barion';
import config from '../config';
import { CheckoutRequest, CartItem } from '../types';

const checkoutSchema = z.object({
  items: z.array(z.object({
    room_id: z.string(),
    room_name: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    price: z.number().positive(),
  })).min(1),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  invoice: z.object({
    required: z.boolean(),
    company: z.string().optional(),
    tax_number: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  language: z.enum(['hu', 'en']),
  terms_accepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  privacy_accepted: z.boolean().refine(val => val === true, 'Privacy policy must be accepted'),
});

export const createCheckout = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    const checkoutData: CheckoutRequest = checkoutSchema.parse(req.body);
    
    await client.query('BEGIN');
    
    // Calculate total
    const totalAmount = checkoutData.items.reduce((sum, item) => sum + item.price, 0);
    
    // Get user ID if logged in
    const userId = req.user?.userId || null;
    
    // Create order
    const orderResult = await client.query(`
      INSERT INTO orders (
        user_id, status, language, customer_name, email, phone, 
        total_amount, currency, invoice_required, invoice_company, 
        invoice_tax_number, invoice_address, terms_accepted, privacy_accepted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `, [
      userId,
      'pending',
      checkoutData.language,
      checkoutData.customer.name,
      checkoutData.customer.email,
      checkoutData.customer.phone || null,
      totalAmount,
      config.business.currency,
      checkoutData.invoice?.required || false,
      checkoutData.invoice?.company || null,
      checkoutData.invoice?.tax_number || null,
      checkoutData.invoice?.address || null,
      checkoutData.terms_accepted,
      checkoutData.privacy_accepted,
    ]);
    
    const orderId = orderResult.rows[0].id;
    
    // Create order items
    for (const item of checkoutData.items) {
      await client.query(`
        INSERT INTO order_items (
          order_id, room_id, booking_date, start_time, end_time, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        orderId,
        item.room_id,
        item.date,
        item.start_time,
        item.end_time,
        'pending',
      ]);
    }
    
    // Create Barion payment
    const barionItems = checkoutData.items.map(item => ({
      name: `${item.room_name} - ${item.date} ${item.start_time}-${item.end_time}`,
      description: `Photo studio booking`,
      quantity: 1,
      unitPrice: item.price,
    }));
    
    const paymentRequest = barionService.createPaymentRequest(
      orderId,
      barionItems,
      totalAmount,
      config.business.currency,
      checkoutData.language === 'hu' ? 'hu-HU' : 'en-US'
    );
    
    const barionResponse = await barionService.createPayment(paymentRequest);
    
    if (!barionResponse.PaymentId) {
      throw new Error('Failed to create Barion payment');
    }
    
    // Save payment record
    await client.query(`
      INSERT INTO payments (order_id, provider, provider_ref, status, payload_json)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      orderId,
      'barion',
      barionResponse.PaymentId,
      'pending',
      JSON.stringify(barionResponse),
    ]);
    
    await client.query('COMMIT');
    
    res.json({
      orderId,
      paymentId: barionResponse.PaymentId,
      redirectUrl: barionResponse.GatewayUrl,
      total: totalAmount,
      currency: config.business.currency,
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }
    
    console.error('Error in createCheckout:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    client.release();
  }
};


