import { Request, Response } from 'express';
import pool from '../database/connection';

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateCouponCode(prefix: string = ''): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? `${prefix}-${code}` : code;
}

interface CouponValidationResult {
  valid: boolean;
  coupon?: any;
  discount_amount?: number;
  error?: string;
  hint?: string;
}

export async function validateCouponInternal(
  code: string,
  cartTotal: number,
  userId: string | null,
  client?: any
): Promise<CouponValidationResult> {
  const db = client || pool;

  const couponResult = await db.query(
    `SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND active = true`,
    [code.trim()]
  );

  if (couponResult.rows.length === 0) {
    return { valid: false, error: 'Érvénytelen kuponkód' };
  }

  const coupon = couponResult.rows[0];
  const now = new Date();

  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return { valid: false, error: 'Ez a kupon még nem érvényes' };
  }

  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return { valid: false, error: 'Ez a kupon lejárt' };
  }

  if (coupon.max_total_uses !== null && coupon.current_uses >= coupon.max_total_uses) {
    return { valid: false, error: 'Ez a kupon elérte a felhasználási limitet' };
  }

  if (coupon.requires_login && !userId) {
    return { valid: false, error: 'Ehhez a kuponhoz be kell jelentkezni' };
  }

  // Per-user usage limit
  if (userId && coupon.max_uses_per_user !== null) {
    const userUsage = await db.query(
      `SELECT COUNT(*) as cnt FROM coupon_usages WHERE coupon_id = $1 AND user_id = $2`,
      [coupon.id, userId]
    );
    if (parseInt(userUsage.rows[0].cnt) >= coupon.max_uses_per_user) {
      return { valid: false, error: 'Már felhasználtad ezt a kupont' };
    }
  }

  // Personal coupon check
  if (coupon.generated_for_user_id && coupon.generated_for_user_id !== userId) {
    return { valid: false, error: 'Ez a kupon egy másik felhasználóhoz tartozik' };
  }

  // First order only
  if (coupon.first_order_only && userId) {
    const priorOrders = await db.query(
      `SELECT COUNT(*) as cnt FROM orders WHERE user_id = $1 AND status = 'paid'`,
      [userId]
    );
    if (parseInt(priorOrders.rows[0].cnt) > 0) {
      return { valid: false, error: 'Ez a kupon csak az első rendeléshez érvényes' };
    }
  }

  // Min order amount
  if (coupon.min_order_amount !== null && cartTotal < parseFloat(coupon.min_order_amount)) {
    const diff = parseFloat(coupon.min_order_amount) - cartTotal;
    return {
      valid: false,
      error: `A minimális rendelési összeg ${parseInt(coupon.min_order_amount).toLocaleString('hu-HU')} Ft`,
      hint: `Még ${Math.ceil(diff).toLocaleString('hu-HU')} Ft szükséges a kupon használatához`,
    };
  }

  // Max order amount
  if (coupon.max_order_amount !== null && cartTotal > parseFloat(coupon.max_order_amount)) {
    return {
      valid: false,
      error: `A maximális rendelési összeg ${parseInt(coupon.max_order_amount).toLocaleString('hu-HU')} Ft ehhez a kuponhoz`,
    };
  }

  // Calculate discount
  let discountAmount: number;
  if (coupon.discount_type === 'percentage') {
    discountAmount = cartTotal * (parseFloat(coupon.discount_value) / 100);
    if (coupon.max_discount_amount !== null) {
      discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount_amount));
    }
  } else {
    discountAmount = parseFloat(coupon.discount_value);
  }

  discountAmount = Math.min(discountAmount, cartTotal);
  discountAmount = Math.round(discountAmount);

  return {
    valid: true,
    coupon,
    discount_amount: discountAmount,
  };
}

// ── Public endpoint: validate coupon ─────────────────────────────────────────

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, cart_total } = req.body;

    if (!code || cart_total === undefined) {
      return res.status(400).json({ error: 'Kuponkód és kosár összeg szükséges' });
    }

    const userId = (req as any).user?.userId || null;
    const result = await validateCouponInternal(code, parseFloat(cart_total), userId);

    if (!result.valid) {
      return res.status(400).json({
        valid: false,
        error: result.error,
        hint: result.hint,
      });
    }

    res.json({
      valid: true,
      discount_amount: result.discount_amount,
      discount_type: result.coupon.discount_type,
      discount_value: parseFloat(result.coupon.discount_value),
      max_discount_amount: result.coupon.max_discount_amount ? parseFloat(result.coupon.max_discount_amount) : null,
      coupon_code: result.coupon.code,
      description: result.coupon.description,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Szerver hiba a kupon ellenőrzésénél' });
  }
};

// ── Admin CRUD ───────────────────────────────────────────────────────────────

export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        u.name as generated_for_user_name,
        u.email as generated_for_user_email,
        (SELECT COUNT(*) FROM coupon_usages WHERE coupon_id = c.id) as usage_count
      FROM coupons c
      LEFT JOIN users u ON u.id = c.generated_for_user_id
      ORDER BY c.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Nem sikerült lekérni a kuponokat' });
  }
};

export const getCouponById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const couponResult = await pool.query(
      `SELECT c.*, u.name as generated_for_user_name, u.email as generated_for_user_email
       FROM coupons c
       LEFT JOIN users u ON u.id = c.generated_for_user_id
       WHERE c.id = $1`,
      [id]
    );

    if (couponResult.rows.length === 0) {
      return res.status(404).json({ error: 'Kupon nem található' });
    }

    const usagesResult = await pool.query(
      `SELECT cu.*, o.customer_name, o.email, o.total_amount, o.created_at as order_date
       FROM coupon_usages cu
       JOIN orders o ON o.id = cu.order_id
       WHERE cu.coupon_id = $1
       ORDER BY cu.created_at DESC`,
      [id]
    );

    res.json({
      ...couponResult.rows[0],
      usages: usagesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ error: 'Nem sikerült lekérni a kupont' });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const {
      code,
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      max_order_amount,
      max_total_uses,
      max_uses_per_user,
      requires_login,
      first_order_only,
      valid_from,
      valid_until,
      active,
    } = req.body;

    if (!discount_type || !discount_value) {
      return res.status(400).json({ error: 'Kedvezmény típusa és értéke szükséges' });
    }

    if (!['percentage', 'fixed'].includes(discount_type)) {
      return res.status(400).json({ error: 'Érvénytelen kedvezmény típus' });
    }

    if (discount_type === 'percentage' && (discount_value <= 0 || discount_value > 100)) {
      return res.status(400).json({ error: 'A százalékos kedvezmény 1 és 100 között kell legyen' });
    }

    const couponCode = code?.trim() || generateCouponCode();

    const existing = await pool.query(
      `SELECT id FROM coupons WHERE UPPER(code) = UPPER($1)`,
      [couponCode]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ez a kuponkód már létezik' });
    }

    const result = await pool.query(
      `INSERT INTO coupons (
        code, description, discount_type, discount_value, max_discount_amount,
        min_order_amount, max_order_amount, max_total_uses, max_uses_per_user,
        requires_login, first_order_only, valid_from, valid_until, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        couponCode,
        description || null,
        discount_type,
        discount_value,
        max_discount_amount || null,
        min_order_amount || null,
        max_order_amount || null,
        max_total_uses || null,
        max_uses_per_user ?? 1,
        requires_login ?? false,
        first_order_only ?? false,
        valid_from || new Date(),
        valid_until || null,
        active ?? true,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Nem sikerült létrehozni a kupont' });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      max_order_amount,
      max_total_uses,
      max_uses_per_user,
      requires_login,
      first_order_only,
      valid_from,
      valid_until,
      active,
    } = req.body;

    if (discount_type === 'percentage' && discount_value && (discount_value <= 0 || discount_value > 100)) {
      return res.status(400).json({ error: 'A százalékos kedvezmény 1 és 100 között kell legyen' });
    }

    if (code) {
      const existing = await pool.query(
        `SELECT id FROM coupons WHERE UPPER(code) = UPPER($1) AND id != $2`,
        [code.trim(), id]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Ez a kuponkód már létezik' });
      }
    }

    const result = await pool.query(
      `UPDATE coupons SET
        code = COALESCE($1, code),
        description = $2,
        discount_type = COALESCE($3, discount_type),
        discount_value = COALESCE($4, discount_value),
        max_discount_amount = $5,
        min_order_amount = $6,
        max_order_amount = $7,
        max_total_uses = $8,
        max_uses_per_user = COALESCE($9, max_uses_per_user),
        requires_login = COALESCE($10, requires_login),
        first_order_only = COALESCE($11, first_order_only),
        valid_from = COALESCE($12, valid_from),
        valid_until = $13,
        active = COALESCE($14, active)
      WHERE id = $15
      RETURNING *`,
      [
        code?.trim() || null,
        description ?? null,
        discount_type || null,
        discount_value || null,
        max_discount_amount ?? null,
        min_order_amount ?? null,
        max_order_amount ?? null,
        max_total_uses ?? null,
        max_uses_per_user ?? null,
        requires_login ?? null,
        first_order_only ?? null,
        valid_from || null,
        valid_until ?? null,
        active ?? null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kupon nem található' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ error: 'Nem sikerült frissíteni a kupont' });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usageCheck = await pool.query(
      `SELECT COUNT(*) as cnt FROM coupon_usages WHERE coupon_id = $1`,
      [id]
    );

    if (parseInt(usageCheck.rows[0].cnt) > 0) {
      await pool.query(`UPDATE coupons SET active = false WHERE id = $1`, [id]);
      return res.json({ message: 'Kupon deaktiválva (már használták)', deactivated: true });
    }

    await pool.query(`DELETE FROM coupons WHERE id = $1`, [id]);
    res.json({ message: 'Kupon törölve' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ error: 'Nem sikerült törölni a kupont' });
  }
};

// ── Registration coupon generator ────────────────────────────────────────────

export async function generateRegistrationCoupon(userId: string, userName: string): Promise<string> {
  const code = generateCouponCode('WELCOME');
  
  await pool.query(
    `INSERT INTO coupons (
      code, description, discount_type, discount_value,
      max_total_uses, max_uses_per_user, requires_login,
      first_order_only, generated_for_user_id,
      valid_until, active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      code,
      `Regisztrációs kupon - ${userName}`,
      'percentage',
      10, // 10% discount
      1,  // Can only be used once total
      1,  // One use per user
      true, // Must be logged in
      true, // First order only
      userId,
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days validity
      true,
    ]
  );

  return code;
}
