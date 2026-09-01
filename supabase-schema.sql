-- ============================================================
-- AN STATIONERY — SUPABASE SCHEMA (NON-DESTRUCTIVE + NO SEED)
-- ============================================================
-- HOW TO USE:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste this entire file
--   3. Click "Run"
--
--   ★ SAFE TO RE-RUN. This file NEVER drops tables and NEVER deletes
--     existing rows. It only creates objects that are missing
--     (CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS, and
--     guarded policies/triggers). Your live data is always preserved.
--
--   ★ NO DUMMY DATA. No demo products, categories, banners, reviews
--     or settings are inserted. All content is added from the admin
--     panel by the store owner.
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. UPDATED_AT helper (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. TABLES (IF NOT EXISTS → existing data is preserved)
-- ============================================================

-- USERS (admin)
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT DEFAULT 'ADMIN',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  emoji       TEXT,
  image       TEXT,
  description TEXT,
  accent      TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  description    TEXT NOT NULL,
  price          INTEGER NOT NULL,
  original_price INTEGER,
  stock          INTEGER DEFAULT 0,
  sku            TEXT,
  badge          TEXT,
  is_active      BOOLEAN DEFAULT TRUE,
  is_featured    BOOLEAN DEFAULT FALSE,
  is_trending    BOOLEAN DEFAULT FALSE,
  is_new         BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  rating         REAL DEFAULT 0,
  review_count   INTEGER DEFAULT 0,
  deleted_at     TIMESTAMPTZ,
  category_id    UUID REFERENCES categories(id),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT IMAGES (multi-image support)
CREATE TABLE IF NOT EXISTS product_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT UNIQUE NOT NULL,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  customer_email  TEXT,
  address         TEXT NOT NULL,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  pincode         TEXT NOT NULL,
  subtotal        INTEGER NOT NULL,
  shipping_amount INTEGER NOT NULL,
  total_amount    INTEGER NOT NULL,
  status          TEXT DEFAULT 'NEW',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3b. PAYMENT COLUMNS ON ORDERS (NON-DESTRUCTIVE — re-run safe)
--    ALTER TABLE ADD COLUMN IF NOT EXISTS guarantees existing
--    rows keep their current values and no table is ever dropped.
-- ============================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method   TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status   TEXT DEFAULT 'PENDING';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id   TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature  TEXT;

-- ORDER ITEMS (with price/name snapshots for historical accuracy)
CREATE TABLE IF NOT EXISTS order_items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id           UUID REFERENCES products(id),
  product_name_snapshot TEXT NOT NULL,
  price_snapshot       INTEGER NOT NULL,
  quantity             INTEGER NOT NULL,
  subtotal             INTEGER NOT NULL
);

-- SHIPMENTS (manual shipping)
CREATE TABLE IF NOT EXISTS shipments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  courier_name    TEXT,
  tracking_number TEXT,
  tracking_url    TEXT,
  status          TEXT DEFAULT 'PENDING',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- BANNERS (homepage promotional posters)
CREATE TABLE IF NOT EXISTS banners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  subtitle    TEXT,
  image_url   TEXT,
  button_text TEXT,
  button_url  TEXT,
  variant     TEXT DEFAULT 'yellow',
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS / TESTIMONIALS
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  city       TEXT,
  rating     INTEGER DEFAULT 5,
  text       TEXT NOT NULL,
  product    TEXT,
  product_id UUID REFERENCES products(id),
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SITE CONFIG (single source of truth for business settings)
CREATE TABLE IF NOT EXISTS site_config (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key   TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);

-- NOTIFICATIONS (in-app notifications pushed to top-nav bell)
-- One row per event: order placed, status changed (shipped, out for
-- delivery, delivered, cancelled), etc. Keyed to the recipient email
-- so both customers and the admin can read their own latest updates.
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email   TEXT NOT NULL,
  order_id     UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_number TEXT,
  type         TEXT DEFAULT 'ORDER_STATUS',
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  status       TEXT,
  is_read      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. INDEXES (IF NOT EXISTS → idempotent)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_trending    ON products(is_trending) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_new         ON products(is_new) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_bestseller  ON products(is_best_seller) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_featured    ON products(is_featured) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_product_images_pid   ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created       ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order    ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_email) WHERE is_read = FALSE;

-- ============================================================
-- 5. TRIGGERS for updated_at (DROP + CREATE → idempotent, safe)
-- ============================================================
DROP TRIGGER IF EXISTS trg_categories_updated  ON categories;
CREATE TRIGGER trg_categories_updated  BEFORE UPDATE ON categories  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated    ON products;
CREATE TRIGGER trg_products_updated    BEFORE UPDATE ON products    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated      ON orders;
CREATE TRIGGER trg_orders_updated      BEFORE UPDATE ON orders      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_shipments_updated   ON shipments;
CREATE TRIGGER trg_shipments_updated   BEFORE UPDATE ON shipments   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_banners_updated     ON banners;
CREATE TRIGGER trg_banners_updated     BEFORE UPDATE ON banners     FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated       ON users;
CREATE TRIGGER trg_users_updated       BEFORE UPDATE ON users       FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. ROW LEVEL SECURITY (idempotent — ENABLE on existing tables)
-- ============================================================
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;

-- Allow all operations for the anon/authenticated roles.
-- Storage of policies is idempotent: drop-if-exists then recreate.
DROP POLICY IF EXISTS "anon_all_categories"   ON categories;
CREATE POLICY "anon_all_categories"   ON categories   FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_all_products"     ON products;
CREATE POLICY "anon_all_products"     ON products     FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_all_prod_images"  ON product_images;
CREATE POLICY "anon_all_prod_images"  ON product_images FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_all_orders"       ON orders;
CREATE POLICY "anon_all_orders"       ON orders        FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_all_order_items"  ON order_items;
CREATE POLICY "anon_all_order_items"  ON order_items   FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_all_shipments"    ON shipments;
CREATE POLICY "anon_all_shipments"    ON shipments     FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_all_banners"      ON banners;
CREATE POLICY "anon_all_banners"      ON banners       FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_all_reviews"      ON reviews;
CREATE POLICY "anon_all_reviews"      ON reviews       FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_all_site_config"  ON site_config;
CREATE POLICY "anon_all_site_config"  ON site_config   FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_all_notifications" ON notifications;
CREATE POLICY "anon_all_notifications" ON notifications FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_no_users"         ON users;
CREATE POLICY "anon_no_users"         ON users         FOR ALL USING (FALSE) WITH CHECK (FALSE);

-- ============================================================
-- 6b. EXPLICIT GRANTS (idempotent)
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL  ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL  ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL  ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- ============================================================
-- 7. CREATE_ORDER RPC (atomic order + stock decrement + payment)
-- ============================================================
CREATE OR REPLACE FUNCTION create_order(
  p_customer_name    TEXT,
  p_customer_phone   TEXT,
  p_customer_email   TEXT,
  p_address          TEXT,
  p_city             TEXT,
  p_state            TEXT,
  p_pincode          TEXT,
  p_lines            JSONB,
  p_shipping_threshold INTEGER DEFAULT 499,
  p_shipping_fee        INTEGER DEFAULT 49,
  p_payment_method     TEXT DEFAULT 'COD',
  p_razorpay_order_id   TEXT DEFAULT NULL,
  p_razorpay_payment_id TEXT DEFAULT NULL,
  p_razorpay_signature  TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_order_id    UUID;
  v_order_number TEXT;
  v_subtotal    INTEGER := 0;
  v_shipping    INTEGER;
  v_total       INTEGER;
  v_line        JSONB;
  v_product     RECORD;
  v_item_sub    INTEGER;
  v_items       JSONB := '[]'::JSONB;
  v_primary_url TEXT;
  v_payment_status TEXT;
BEGIN
  -- Generate order number
  v_order_number := 'AN-' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000000)::TEXT, 6, '0') || LPAD((RANDOM() * 90 + 10)::INT::TEXT, 2, '0');

  -- Validate stock and calculate subtotal
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    SELECT id, name, price, stock INTO v_product
    FROM products
    WHERE slug = v_line->>'slug' AND deleted_at IS NULL AND is_active = TRUE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product "%" is no longer available.', v_line->>'slug';
    END IF;

    IF v_product.stock < (v_line->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Only % of "%" available.', v_product.stock, v_product.name;
    END IF;

    v_item_sub := v_product.price * (v_line->>'quantity')::INTEGER;
    v_subtotal := v_subtotal + v_item_sub;
  END LOOP;

  -- Calculate shipping
  IF v_subtotal >= p_shipping_threshold THEN
    v_shipping := 0;
  ELSE
    v_shipping := p_shipping_fee;
  END IF;
  v_total := v_subtotal + v_shipping;

  -- Determine payment status based on method
  IF p_payment_method = 'RAZORPAY' AND p_razorpay_payment_id IS NOT NULL THEN
    v_payment_status := 'PAID';
  ELSE
    v_payment_status := 'PENDING';
  END IF;

  -- Create order (with payment columns)
  INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, address, city, state, pincode, subtotal, shipping_amount, total_amount, status, payment_method, payment_status, razorpay_order_id, razorpay_payment_id, razorpay_signature)
  VALUES (v_order_number, p_customer_name, p_customer_phone, NULLIF(p_customer_email, ''), p_address, p_city, p_state, p_pincode, v_subtotal, v_shipping, v_total, 'NEW', p_payment_method, v_payment_status, NULLIF(p_razorpay_order_id, ''), NULLIF(p_razorpay_payment_id, ''), NULLIF(p_razorpay_signature, ''))
  RETURNING id INTO v_order_id;

  -- Create order items + decrement stock + build response
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    SELECT id, name, price INTO v_product
    FROM products
    WHERE slug = v_line->>'slug' AND deleted_at IS NULL;

    v_item_sub := v_product.price * (v_line->>'quantity')::INTEGER;

    INSERT INTO order_items (order_id, product_id, product_name_snapshot, price_snapshot, quantity, subtotal)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.price, (v_line->>'quantity')::INTEGER, v_item_sub);

    -- Decrement stock (atomic within transaction)
    UPDATE products SET stock = stock - (v_line->>'quantity')::INTEGER WHERE id = v_product.id;

    -- Get primary image for response
    SELECT url INTO v_primary_url FROM product_images WHERE product_id = v_product.id AND is_primary = TRUE LIMIT 1;
    IF v_primary_url IS NULL THEN
      SELECT url INTO v_primary_url FROM product_images WHERE product_id = v_product.id ORDER BY sort_order ASC LIMIT 1;
    END IF;

    v_items := v_items || jsonb_build_object(
      'name', v_product.name,
      'price', v_product.price,
      'quantity', (v_line->>'quantity')::INTEGER,
      'image', COALESCE(v_primary_url, '')
    );
  END LOOP;

  RETURN jsonb_build_object(
    'orderNumber',       v_order_number,
    'customerName',      p_customer_name,
    'customerPhone',     p_customer_phone,
    'customerEmail',     NULLIF(p_customer_email, ''),
    'address',           p_address,
    'city',              p_city,
    'state',             p_state,
    'pincode',           p_pincode,
    'items',             v_items,
    'subtotal',          v_subtotal,
    'shippingAmount',    v_shipping,
    'totalAmount',       v_total,
    'status',            'NEW',
    'paymentMethod',     p_payment_method,
    'paymentStatus',     v_payment_status,
    'createdAt',         NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- 8. NO SEED DATA
--    Nothing is inserted above. Categories, products, product
--    images, banners, reviews and settings are all added through
--    the admin panel so nothing is ever wiped or overridden.
-- ============================================================

-- ============================================================
-- 9. STORAGE: PRODUCT IMAGES (run once, idempotent)
--    Enables app/api/admin/upload → Supabase Storage, so uploads
--    persist on Vercel (no local disk). Paste into SQL Editor + Run.
-- ============================================================

-- Public bucket (id + name both "product-images").
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif'];

-- Allow the app's publishable (anon) key to upload, read and manage
-- objects inside the product-images bucket.
--   NOTE: storage.objects is NOT dropped by this script, so these
--   policies are guarded — a re-run skips any that already exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'product_images_insert'
  ) THEN
    CREATE POLICY "product_images_insert" ON storage.objects
      FOR INSERT TO anon, authenticated
      WITH CHECK (bucket_id = 'product-images');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'product_images_select'
  ) THEN
    CREATE POLICY "product_images_select" ON storage.objects
      FOR SELECT TO anon, authenticated
      USING (bucket_id = 'product-images');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'product_images_update'
  ) THEN
    CREATE POLICY "product_images_update" ON storage.objects
      FOR UPDATE TO anon, authenticated
      USING (bucket_id = 'product-images');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'product_images_delete'
  ) THEN
    CREATE POLICY "product_images_delete" ON storage.objects
      FOR DELETE TO anon, authenticated
      USING (bucket_id = 'product-images');
  END IF;
END;
$$;

-- ============================================================
-- DONE! Your database is ready.
--   Tables: users, categories, products, product_images, orders,
--           order_items, shipments, banners, reviews, site_config,
--           notifications
--   RPC:    create_order() for atomic checkout (SECURITY DEFINER,
--           pinned search_path, grants applied for anon calls)
--   RLS:    Permissive anon policies + explicit grants so the app's
--           publishable-key calls work out of the box.
--   Storage: product images in a public "product-images" bucket.
--
--   ★ This script is NON-DESTRUCTIVE: re-running it never drops a
--     table or deletes a row. It only creates missing objects.
--   ★ NO SEED DATA: content is added via the admin panel.
--   NOTE: for production, move admin writes + create_order to the
--   service_role key and drop the anon INSERT/UPDATE/DELETE rights
--   (keep only anon SELECT for the storefront).
-- ============================================================
