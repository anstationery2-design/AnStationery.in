-- ============================================================
-- CLEANUP: Remove the demo / dummy seed data only
-- ============================================================
-- Run this ONCE after upgrading to the new non-destructive schema
-- (supabase-schema.sql) to purge the leftover demo products,
-- categories, banners, reviews and settings that the OLD version
-- inserted.
--
--   ★ Only rows matching the exact demo seed are deleted. Rows you
--     added from the admin panel are never touched.
--   ★ Run order matters (products before categories because of FK),
--     and it is safe to re-run.
-- ============================================================

-- 1. Order line items pointing at demo products (FK safety, if any)
DELETE FROM order_items
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'aesthetic-floral-journal',
    'pastel-dream-planner',
    'cute-stationery-gift-box',
    'rainbow-gel-pen-set',
    'kawaii-sticker-pack',
    'mini-doodle-notebook-pack-3',
    'cloud-washi-tape-collection',
    'star-dust-highlighters-6pc',
    'cozy-desk-organiser-set',
    'birthday-surprise-gift-hamper',
    'mint-green-pencil-pouch',
    'sunshine-sticky-note-bundle'
  )
);

-- 2. Demo products (cascade removes their product_images)
DELETE FROM products
WHERE slug IN (
  'aesthetic-floral-journal',
  'pastel-dream-planner',
  'cute-stationery-gift-box',
  'rainbow-gel-pen-set',
  'kawaii-sticker-pack',
  'mini-doodle-notebook-pack-3',
  'cloud-washi-tape-collection',
  'star-dust-highlighters-6pc',
  'cozy-desk-organiser-set',
  'birthday-surprise-gift-hamper',
  'mint-green-pencil-pouch',
  'sunshine-sticky-note-bundle'
);

-- 3. Demo categories
DELETE FROM categories WHERE slug IN ('diaries', 'stationery', 'gifts', 'accessories', 'desk');

-- 4. Demo banners
DELETE FROM banners WHERE title IN ('New Drop', 'Gift Something Cute', '20% Off Best Sellers');

-- 5. Demo reviews
DELETE FROM reviews WHERE name IN ('Ananya R.', 'Karthik M.', 'Sneha P.', 'Riya S.');

-- 6. Demo site settings (re-add your own from Admin → Settings)
DELETE FROM site_config WHERE key IN (
  'name', 'tagline', 'description', 'email', 'phone', 'whatsapp',
  'instagram', 'instagramHandle', 'address', 'freeShippingThreshold', 'shippingFee'
);

-- DONE.
