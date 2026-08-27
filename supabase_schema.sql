-- Patch My Backpack: Complete Database Schema & Functions

-- 1. Create spots table
CREATE TABLE IF NOT EXISTS public.spots (
  id INT PRIMARY KEY,
  label TEXT NOT NULL,
  short_label TEXT NOT NULL,
  zone TEXT NOT NULL,
  size TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  starting_bid NUMERIC NOT NULL,
  current_bid NUMERIC NOT NULL,
  bid_count INT NOT NULL DEFAULT 0,
  top_bidder_brand TEXT NOT NULL,
  top_bidder_url TEXT NOT NULL,
  top_bidder_logo TEXT DEFAULT '',
  coords_2d JSONB NOT NULL,
  coords_3d JSONB NOT NULL,
  description TEXT NOT NULL,
  visibility_note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id INT NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  amount NUMERIC NOT NULL,
  deposit_amount NUMERIC NOT NULL,
  bidder_email TEXT,
  bidder_twitter TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  twitter TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Spots: Everyone can read
DROP POLICY IF EXISTS "Allow public read on spots" ON public.spots;
CREATE POLICY "Allow public read on spots" ON public.spots
  FOR SELECT TO anon, authenticated
  USING (true);

-- Bids: Everyone can read
DROP POLICY IF EXISTS "Allow public read on bids" ON public.bids;
CREATE POLICY "Allow public read on bids" ON public.bids
  FOR SELECT TO anon, authenticated
  USING (true);

-- Bids: Everyone can insert
DROP POLICY IF EXISTS "Allow public insert on bids" ON public.bids;
CREATE POLICY "Allow public insert on bids" ON public.bids
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Waitlist: Everyone can insert
DROP POLICY IF EXISTS "Allow public insert on waitlist" ON public.waitlist;
CREATE POLICY "Allow public insert on waitlist" ON public.waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 6. Atomic RPC Function to place a bid safely
CREATE OR REPLACE FUNCTION public.place_bid(
  p_spot_id INT,
  p_brand_name TEXT,
  p_website_url TEXT,
  p_logo_url TEXT,
  p_amount NUMERIC,
  p_deposit_amount NUMERIC,
  p_bidder_email TEXT DEFAULT NULL,
  p_bidder_twitter TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_spot RECORD;
  v_bid_id UUID;
BEGIN
  -- Fetch and lock the spot row
  SELECT * INTO v_spot
  FROM public.spots
  WHERE id = p_spot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Spot % not found', p_spot_id;
  END IF;

  -- Validate minimum increment (+10)
  IF p_amount < (v_spot.current_bid + 10) THEN
    RAISE EXCEPTION 'Bid amount (%) must be at least %', p_amount, (v_spot.current_bid + 10);
  END IF;

  -- Mark previous active bids on this spot as outbid
  UPDATE public.bids
  SET status = 'outbid'
  WHERE spot_id = p_spot_id AND status = 'active';

  -- Insert new bid
  INSERT INTO public.bids (
    spot_id,
    brand_name,
    website_url,
    logo_url,
    amount,
    deposit_amount,
    bidder_email,
    bidder_twitter,
    status
  )
  VALUES (
    p_spot_id,
    p_brand_name,
    p_website_url,
    p_logo_url,
    p_amount,
    p_deposit_amount,
    p_bidder_email,
    p_bidder_twitter,
    'active'
  )
  RETURNING id INTO v_bid_id;

  -- Update spot top bidder & stats
  UPDATE public.spots
  SET
    current_bid = p_amount,
    bid_count = bid_count + 1,
    top_bidder_brand = p_brand_name,
    top_bidder_url = p_website_url,
    top_bidder_logo = COALESCE(p_logo_url, top_bidder_logo),
    updated_at = NOW()
  WHERE id = p_spot_id;

  RETURN jsonb_build_object(
    'success', true,
    'bid_id', v_bid_id,
    'spot_id', p_spot_id,
    'new_bid', p_amount
  );
END;
$$;

-- 7. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.spots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;

-- 8. Seed Initial 7 Spots with calibrated coordinates
INSERT INTO public.spots (
  id, label, short_label, zone, size, dimensions, starting_bid, current_bid, bid_count,
  top_bidder_brand, top_bidder_url, top_bidder_logo, coords_2d, coords_3d, description, visibility_note
)
VALUES
(
  1,
  'Top Flap: Upper Left',
  'Flap Top-Left',
  'Top Flap',
  'L',
  '9 × 6 cm',
  350,
  490,
  4,
  'Raycast',
  'https://raycast.com',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  '{"top": "19.3%", "left": "22.3%", "width": "22.0%", "height": "12.1%"}'::jsonb,
  '{"top": "21.2%", "left": "27.6%", "width": "17.2%", "height": "9.2%", "rotateX": "16deg", "rotateY": "-3deg", "rotateZ": "2deg", "skewY": "-2deg", "skewX": "-22deg"}'::jsonb,
  'Positioned at the upper left of the top leather flap. Highly noticeable at eye level in transit.',
  'Eye-level visibility in airport security lines and coffee queues.'
),
(
  2,
  'Top Flap: Lower Left',
  'Flap Bottom-Left',
  'Top Flap',
  'M',
  '7 × 4.5 cm',
  180,
  240,
  2,
  'Linear',
  'https://linear.app',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  '{"top": "32.4%", "left": "21.8%", "width": "22.3%", "height": "9.8%"}'::jsonb,
  '{"top": "32.0%", "left": "21.8%", "width": "19.0%", "height": "8.1%", "rotateX": "10deg", "rotateY": "-25deg", "rotateZ": "10deg", "skewY": "-3deg", "skewX": "-1deg"}'::jsonb,
  'Directly below the upper left patch on the main top flap. Clean and subtle placement.',
  'Direct sightline seen from the side and rear angles.'
),
(
  3,
  'Top Flap: Right Side',
  'Flap Right',
  'Top Flap',
  'L',
  '9 × 6 cm',
  200,
  310,
  3,
  'Supabase',
  'https://supabase.com',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  '{"top": "19.3%", "left": "50.2%", "width": "21.9%", "height": "13.1%"}'::jsonb,
  '{"top": "21.6%", "left": "48.3%", "width": "18.5%", "height": "10.0%", "rotateX": "12deg", "rotateY": "-6deg", "rotateZ": "8deg", "skewY": "-6deg", "skewX": "-11deg"}'::jsonb,
  'Top right flap zone opposite the left column, giving balanced visual weight.',
  'Direct glance visibility on the upper right flap.'
),
(
  4,
  'Front Pocket: Top Left (2×2 Grid)',
  'Pocket Top-Left',
  'Front Pocket (2×2 Grid)',
  'M',
  '7 × 6 cm',
  450,
  580,
  5,
  'Cursor',
  'https://cursor.com',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  '{"top": "49.5%", "left": "29.7%", "width": "14.5%", "height": "11.9%"}'::jsonb,
  '{"top": "48.9%", "left": "26.6%", "width": "13.5%", "height": "11.9%", "rotateX": "23deg", "rotateY": "8deg", "rotateZ": "-3deg", "skewY": "-2deg", "skewX": "-18deg"}'::jsonb,
  'Upper-left quadrant of the main 2×2 front pocket patch grid.',
  'Primary focal area on the front backpack compartment.'
),
(
  5,
  'Front Pocket: Bottom Right (2×2 Grid)',
  'Pocket Bottom-Right',
  'Front Pocket (2×2 Grid)',
  'M',
  '7 × 6 cm',
  140,
  190,
  2,
  'PostHog',
  'https://posthog.com',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  '{"top": "62.7%", "left": "47.1%", "width": "14.4%", "height": "11.3%"}'::jsonb,
  '{"top": "62.3%", "left": "36.4%", "width": "14.9%", "height": "11.5%", "rotateX": "6deg", "rotateY": "-19deg", "rotateZ": "4deg", "skewY": "-3deg", "skewX": "-3deg"}'::jsonb,
  'Lower-right quadrant of the main 2×2 front pocket patch grid.',
  'Balanced lower quadrant placement on the main front pocket.'
),
(
  6,
  'Front Pocket: Top Right (2×2 Grid)',
  'Pocket Top-Right',
  'Front Pocket (2×2 Grid)',
  'M',
  '7 × 6 cm',
  140,
  180,
  2,
  'Arc Browser',
  'https://arc.net',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  '{"top": "49.8%", "left": "46.7%", "width": "14.8%", "height": "11.9%"}'::jsonb,
  '{"top": "49.6%", "left": "40.1%", "width": "13.4%", "height": "10.8%", "rotateX": "6deg", "rotateY": "-18deg", "rotateZ": "-6deg", "skewY": "6deg", "skewX": "-19deg"}'::jsonb,
  'Upper-right quadrant of the main 2×2 front pocket patch grid.',
  'Front-facing visibility across conferences and subways.'
),
(
  7,
  'Front Pocket: Bottom Left (2×2 Grid)',
  'Pocket Bottom-Left',
  'Front Pocket (2×2 Grid)',
  'M',
  '7 × 6 cm',
  120,
  170,
  1,
  'Beehiiv',
  'https://beehiiv.com',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  '{"top": "62.6%", "left": "29.1%", "width": "15.0%", "height": "11.2%"}'::jsonb,
  '{"top": "61.7%", "left": "23.1%", "width": "13.4%", "height": "11.2%", "rotateX": "16deg", "rotateY": "-20deg", "rotateZ": "7deg", "skewY": "-4deg", "skewX": "2deg"}'::jsonb,
  'Lower-left quadrant of the main 2×2 front pocket patch grid.',
  'Structured placement above the lower pocket edge.'
)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  short_label = EXCLUDED.short_label,
  zone = EXCLUDED.zone,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  starting_bid = EXCLUDED.starting_bid,
  current_bid = EXCLUDED.current_bid,
  bid_count = EXCLUDED.bid_count,
  top_bidder_brand = EXCLUDED.top_bidder_brand,
  top_bidder_url = EXCLUDED.top_bidder_url,
  top_bidder_logo = EXCLUDED.top_bidder_logo,
  coords_2d = EXCLUDED.coords_2d,
  coords_3d = EXCLUDED.coords_3d,
  description = EXCLUDED.description,
  visibility_note = EXCLUDED.visibility_note;
