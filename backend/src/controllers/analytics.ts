import { Request, Response } from 'express';
import pool from '../database/connection';

interface CheckoutFailureData {
  formData: {
    name?: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    businessInvoice?: boolean;
    company?: string;
    taxNumber?: string;
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
  };
  validationErrors: Record<string, string>;
  cartItems?: Array<{
    room_id: string;
    room_name: string;
    date: string;
    start_time: string;
    end_time: string;
    price: number;
  }>;
  cartTotal?: number;
  deviceInfo?: {
    screenWidth?: number;
    screenHeight?: number;
  };
  sessionId?: string;
  language?: string;
}

/**
 * Simple user agent parser (no external dependencies)
 */
function parseUserAgent(userAgent: string | undefined): {
  deviceType: string;
  browser: string;
  os: string;
} {
  if (!userAgent) {
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  const ua = userAgent.toLowerCase();

  // Detect device type
  let deviceType = 'desktop';
  if (/mobile|android.*mobile|iphone|ipod|blackberry|iemobile|opera mini|opera mobi/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad|android(?!.*mobile)|kindle|silk/i.test(userAgent)) {
    deviceType = 'tablet';
  }

  // Detect browser
  let browser = 'unknown';
  if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('opr/') || ua.includes('opera')) browser = 'Opera';
  else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('msie') || ua.includes('trident')) browser = 'IE';

  // Detect OS
  let os = 'unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os') || ua.includes('macos')) os = 'macOS';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('linux')) os = 'Linux';

  return { deviceType, browser, os };
}

/**
 * Get client IP address from request
 */
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Track a checkout failure for analytics
 * POST /api/analytics/checkout-failure
 */
export const trackCheckoutFailure = async (req: Request, res: Response) => {
  try {
    const data: CheckoutFailureData = req.body;
    const userAgent = req.headers['user-agent'];
    const { deviceType, browser, os } = parseUserAgent(userAgent);
    const ipAddress = getClientIP(req);

    // Get user ID if authenticated (from optional auth middleware)
    const userId = (req as any).user?.id || null;

    // Sanitize form data - remove sensitive info but keep structure
    const sanitizedFormData = {
      ...data.formData,
      // Mask email partially for privacy
      email: data.formData.email 
        ? data.formData.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        : undefined,
      // Keep phone length but mask
      phone: data.formData.phone 
        ? `***${data.formData.phone.slice(-4)}`
        : undefined,
    };

    const query = `
      INSERT INTO checkout_failures (
        form_data,
        validation_errors,
        cart_items,
        cart_total,
        user_agent,
        device_type,
        browser,
        os,
        screen_width,
        screen_height,
        user_id,
        session_id,
        ip_address,
        language
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
      RETURNING id
    `;

    const values = [
      JSON.stringify(sanitizedFormData),
      JSON.stringify(data.validationErrors),
      data.cartItems ? JSON.stringify(data.cartItems) : null,
      data.cartTotal || null,
      userAgent || null,
      deviceType,
      browser,
      os,
      data.deviceInfo?.screenWidth || null,
      data.deviceInfo?.screenHeight || null,
      userId,
      data.sessionId || null,
      ipAddress,
      data.language || null,
    ];

    await pool.query(query, values);

    // Silent success - no feedback to user needed
    res.status(204).send();

  } catch (error) {
    // Log error but don't fail the response - this is non-critical
    console.error('Failed to track checkout failure:', error);
    // Still return success to not affect user experience
    res.status(204).send();
  }
};

/**
 * Get checkout failure statistics (admin only)
 * GET /api/admin/analytics/checkout-failures
 */
export const getCheckoutFailureStats = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    // Get overall stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_failures,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_failures,
        COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) as tablet_failures,
        COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_failures
      FROM checkout_failures
      WHERE created_at >= NOW() - INTERVAL '${parseInt(days as string)} days'
    `;

    const statsResult = await pool.query(statsQuery);

    // Get most common validation errors
    const errorsQuery = `
      SELECT 
        key as error_field,
        COUNT(*) as count
      FROM checkout_failures,
        jsonb_each_text(validation_errors) as e(key, value)
      WHERE created_at >= NOW() - INTERVAL '${parseInt(days as string)} days'
      GROUP BY key
      ORDER BY count DESC
      LIMIT 10
    `;

    const errorsResult = await pool.query(errorsQuery);

    // Get failures by day
    const dailyQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as failures,
        COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile,
        COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop
      FROM checkout_failures
      WHERE created_at >= NOW() - INTERVAL '${parseInt(days as string)} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const dailyResult = await pool.query(dailyQuery);

    // Get browser breakdown
    const browserQuery = `
      SELECT 
        browser,
        COUNT(*) as count
      FROM checkout_failures
      WHERE created_at >= NOW() - INTERVAL '${parseInt(days as string)} days'
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 5
    `;

    const browserResult = await pool.query(browserQuery);

    // Get recent failures with details
    const recentQuery = `
      SELECT 
        id,
        form_data,
        validation_errors,
        device_type,
        browser,
        os,
        screen_width,
        screen_height,
        language,
        created_at
      FROM checkout_failures
      WHERE created_at >= NOW() - INTERVAL '${parseInt(days as string)} days'
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const recentResult = await pool.query(recentQuery);

    res.json({
      success: true,
      stats: {
        ...statsResult.rows[0],
        period_days: parseInt(days as string),
      },
      commonErrors: errorsResult.rows,
      dailyFailures: dailyResult.rows,
      browsers: browserResult.rows,
      recentFailures: recentResult.rows,
    });

  } catch (error) {
    console.error('Failed to get checkout failure stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics',
    });
  }
};

