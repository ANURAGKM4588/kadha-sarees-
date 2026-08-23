-- KADHA SAREES SUPABASE DATABASE SCHEMA
-- Copy and run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/oglbbffvqyqrlctkycfs/sql/new

-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  weave TEXT NOT NULL,
  colour TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  status TEXT NOT NULL DEFAULT 'in_stock',
  stock_qty INT DEFAULT 1,
  image TEXT NOT NULL,
  views JSONB DEFAULT '[]'::jsonb,
  blurb TEXT,
  fabric TEXT,
  blouse TEXT,
  care TEXT,
  blouse_availability TEXT DEFAULT 'both',
  without_blouse_discount NUMERIC DEFAULT 0,
  cart_adds_count INT DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-migrations for products table columns if created earlier
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS blouse_availability TEXT DEFAULT 'both';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS without_blouse_discount NUMERIC DEFAULT 0;

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  payment_id TEXT,
  payment_status TEXT,
  date TEXT
);

-- Auto-migrations for orders table columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- 3. Notify Requests Table
CREATE TABLE IF NOT EXISTS public.notify_requests (
  id TEXT PRIMARY KEY,
  saree_name TEXT NOT NULL,
  saree_slug TEXT NOT NULL,
  phone TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Pending'
);

-- Enable public access for frontend storefront
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notify_requests DISABLE ROW LEVEL SECURITY;

-- 4. Supabase Storage Bucket for Product Images
-- SQL to configure public access for your 'Product images' bucket:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('Product images', 'Product images', true) 
ON CONFLICT (id) DO NOTHING;

-- Public Storage Access Policies for 'Product images' Bucket
CREATE POLICY "Public Read Access on Product images Bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'Product images');

CREATE POLICY "Public Insert Access on Product images Bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'Product images');
