-- Enable Row Level Security (RLS) on all public tables
-- This addresses the Supabase Security Advisor warnings

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BuyOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InstantBuyer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InstantOffer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Offer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlatformSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LedgerEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_BuyOrderToListing" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Public can read active listings" ON "Listing";
DROP POLICY IF EXISTS "Users can read own listings" ON "Listing";
DROP POLICY IF EXISTS "Users can read own data" ON "User";
DROP POLICY IF EXISTS "Users can read own transactions" ON "Transaction";
DROP POLICY IF EXISTS "Users can read own messages" ON "Message";
DROP POLICY IF EXISTS "Users can read own notifications" ON "Notification";

-- Users can read their own data
-- Fixed: Use current_setting pattern to avoid re-evaluation per row
CREATE POLICY "Users can read own data"
  ON "User"
  FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = id
  );

-- Listing: Combined SELECT policy (fixes Multiple Permissive Policies warning)
-- Public can read active listings OR users can read their own listings
CREATE POLICY "Listing read access"
  ON "Listing"
  FOR SELECT
  USING (
    status = 'ACTIVE' OR
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "sellerId"
  );

-- Users can read their own transactions
-- Fixed: Use current_setting pattern to avoid re-evaluation
CREATE POLICY "Users can read own transactions"
  ON "Transaction"
  FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "sellerId" OR
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "buyerId"
  );

-- Users can read their own messages
-- Fixed: Use current_setting pattern
CREATE POLICY "Users can read own messages"
  ON "Message"
  FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "senderId" OR
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "receiverId"
  );

-- Users can read their own notifications
-- Fixed: Use current_setting pattern
CREATE POLICY "Users can read own notifications"
  ON "Notification"
  FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "userId"
  );

-- Note: For production, you'll want more granular policies
-- This is a basic setup to address the security warnings
-- You may want to restrict writes to authenticated users only

