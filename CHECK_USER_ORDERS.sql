-- Check if your orders have user_id set
SELECT 
    o.id,
    o.user_id,
    o.customer_name,
    o.email,
    o.status,
    o.created_at
FROM orders o
WHERE o.email = 'your-email@example.com'  -- Replace with your email
ORDER BY o.created_at DESC;

-- Check all orders regardless of user_id
SELECT 
    o.id,
    o.user_id,
    o.customer_name,
    o.email,
    o.status,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 10;

