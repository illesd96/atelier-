import { Request, Response } from 'express';
import pool from '../database/connection';
import szamlazzService from '../services/szamlazz';

/**
 * Get invoice for a specific order (customer endpoint)
 */
export const getOrderInvoice = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  
  try {
    // If user is authenticated, check they own this order
    if (req.user) {
      const userResult = await pool.query(
        'SELECT email FROM users WHERE id = $1',
        [req.user.userId]
      );
      
      if (userResult.rows.length > 0) {
        const userEmail = userResult.rows[0].email;
        
        // Verify order belongs to user
        const orderCheck = await pool.query(
          `SELECT id FROM orders 
           WHERE id = $1 AND (user_id = $2 OR LOWER(email) = LOWER($3))`,
          [orderId, req.user.userId, userEmail]
        );
        
        if (orderCheck.rows.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'Access denied',
          });
        }
      }
    }
    
    // Get invoice for this order
    const invoiceResult = await pool.query(`
      SELECT 
        id,
        order_id,
        invoice_number,
        invoice_type,
        gross_amount,
        net_amount,
        vat_amount,
        currency,
        customer_name,
        customer_email,
        status,
        created_at,
        sent_at
      FROM invoices
      WHERE order_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [orderId]);
    
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }
    
    res.json({
      success: true,
      invoice: invoiceResult.rows[0],
    });
    
  } catch (error) {
    console.error('Error getting invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Download invoice PDF (customer endpoint)
 */
export const downloadInvoicePdf = async (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  
  try {
    // Get invoice details first
    const invoiceResult = await pool.query(`
      SELECT 
        i.id,
        i.order_id,
        i.invoice_number,
        i.pdf_data,
        o.user_id,
        o.email
      FROM invoices i
      JOIN orders o ON o.id = i.order_id
      WHERE i.id = $1
    `, [invoiceId]);
    
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }
    
    const invoice = invoiceResult.rows[0];
    
    // If user is authenticated, check they own this invoice
    if (req.user) {
      const userResult = await pool.query(
        'SELECT email FROM users WHERE id = $1',
        [req.user.userId]
      );
      
      if (userResult.rows.length > 0) {
        const userEmail = userResult.rows[0].email;
        
        // Verify invoice belongs to user
        if (invoice.user_id !== req.user.userId && 
            invoice.email.toLowerCase() !== userEmail.toLowerCase()) {
          return res.status(403).json({
            success: false,
            error: 'Access denied',
          });
        }
      }
    }
    
    // Get PDF data
    if (!invoice.pdf_data) {
      return res.status(404).json({
        success: false,
        error: 'Invoice PDF not available',
      });
    }
    
    // Send PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);
    res.send(invoice.pdf_data);
    
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get all invoices (admin endpoint)
 */
export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate, search, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        i.id,
        i.order_id,
        i.invoice_number,
        i.invoice_type,
        i.gross_amount,
        i.net_amount,
        i.vat_amount,
        i.currency,
        i.customer_name,
        i.customer_email,
        i.customer_tax_number,
        i.status,
        i.created_at,
        i.sent_at,
        i.cancelled_at,
        o.status as order_status
      FROM invoices i
      JOIN orders o ON o.id = i.order_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 1;
    
    // Filter by status
    if (status && status !== 'all') {
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    // Filter by date range
    if (startDate) {
      query += ` AND i.created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND i.created_at <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }
    
    // Search by customer name, email, or invoice number
    if (search) {
      query += ` AND (
        LOWER(i.customer_name) LIKE LOWER($${paramCount}) OR
        LOWER(i.customer_email) LIKE LOWER($${paramCount}) OR
        LOWER(i.invoice_number) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    query += ` ORDER BY i.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM invoices i
      JOIN orders o ON o.id = i.order_id
      WHERE 1=1
    `;
    const countParams: any[] = [];
    let countParamCount = 1;
    
    if (status && status !== 'all') {
      countQuery += ` AND i.status = $${countParamCount}`;
      countParams.push(status);
      countParamCount++;
    }
    
    if (startDate) {
      countQuery += ` AND i.created_at >= $${countParamCount}`;
      countParams.push(startDate);
      countParamCount++;
    }
    
    if (endDate) {
      countQuery += ` AND i.created_at <= $${countParamCount}`;
      countParams.push(endDate);
      countParamCount++;
    }
    
    if (search) {
      countQuery += ` AND (
        LOWER(i.customer_name) LIKE LOWER($${countParamCount}) OR
        LOWER(i.customer_email) LIKE LOWER($${countParamCount}) OR
        LOWER(i.invoice_number) LIKE LOWER($${countParamCount})
      )`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      success: true,
      invoices: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
    
  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get invoice by ID (admin endpoint)
 */
export const getInvoiceById = async (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        i.*,
        o.customer_name as order_customer_name,
        o.email as order_email,
        o.phone as order_phone,
        o.total_amount as order_total,
        o.status as order_status,
        json_agg(
          json_build_object(
            'id', oi.id,
            'room_id', oi.room_id,
            'room_name', r.name,
            'booking_date', oi.booking_date,
            'start_time', to_char(oi.start_time, 'HH24:MI'),
            'end_time', to_char(oi.end_time, 'HH24:MI'),
            'status', oi.status
          ) ORDER BY oi.booking_date, oi.start_time
        ) as order_items
      FROM invoices i
      JOIN orders o ON o.id = i.order_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN rooms r ON r.id = oi.room_id
      WHERE i.id = $1
      GROUP BY i.id, o.id
    `, [invoiceId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }
    
    res.json({
      success: true,
      invoice: result.rows[0],
    });
    
  } catch (error) {
    console.error('Error getting invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Download invoice PDF (admin endpoint - no access check)
 */
export const adminDownloadInvoicePdf = async (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT invoice_number, pdf_data
      FROM invoices
      WHERE id = $1
    `, [invoiceId]);
    
    if (result.rows.length === 0 || !result.rows[0].pdf_data) {
      return res.status(404).json({
        success: false,
        error: 'Invoice PDF not found',
      });
    }
    
    const invoice = result.rows[0];
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);
    res.send(invoice.pdf_data);
    
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

