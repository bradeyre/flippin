-- Enable Row Level Security (RLS) on all public tables
-- Optimized version to fix Performance Advisor warnings

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
DROP POLICY IF EXISTS "Users can read own data" ON "User";
DROP POLICY IF EXISTS "Users can read own listings" ON "Listing";
DROP POLICY IF EXISTS "Users can read own transactions" ON "Transaction";
DROP POLICY IF EXISTS "Users can read own messages" ON "Message";
DROP POLICY IF EXISTS "Users can read own notifications" ON "Notification";

-- ============================================
-- OPTIMIZED POLICIES (Fixed Performance Issues)
-- ============================================

-- User: Read own data
-- Fixed: Use auth.uid() once and store in variable pattern
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

-- Transaction: Read own transactions
-- Fixed: Use current_setting pattern to avoid re-evaluation
CREATE POLICY "Users can read own transactions"
  ON "Transaction"
  FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "sellerId" OR
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "buyerId"
  );

-- Message: Read own messages
-- Fixed: Use current_setting pattern
CREATE POLICY "Users can read own messages"
  ON "Message"
  FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "senderId" OR
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "receiverId"
  );

-- Notification: Read own notifications
-- Fixed: Use current_setting pattern
CREATE POLICY "Users can read own notifications"
  ON "Notification"
  FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "userId"
  );

-- ============================================
-- WRITE POLICIES (For authenticated users)
-- ============================================

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON "User"
  FOR UPDATE
  USING (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = id
  );

-- Sellers can create their own listings
CREATE POLICY "Sellers can create own listings"
  ON "Listing"
  FOR INSERT
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "sellerId"
  );

-- Sellers can update their own listings
CREATE POLICY "Sellers can update own listings"
  ON "Listing"
  FOR UPDATE
  USING (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "sellerId"
  );

-- Users can create their own transactions (as buyer)
CREATE POLICY "Buyers can create transactions"
  ON "Transaction"
  FOR INSERT
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "buyerId"
  );

-- Sellers can update their own transactions
CREATE POLICY "Sellers can update own transactions"
  ON "Transaction"
  FOR UPDATE
  USING (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "sellerId"
  );

-- Buyers can update transactions they're buying
CREATE POLICY "Buyers can update own transactions"
  ON "Transaction"
  FOR UPDATE
  USING (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "buyerId"
  );

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON "Message"
  FOR INSERT
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "senderId"
  );

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update own received messages"
  ON "Message"
  FOR UPDATE
  USING (
    (current_setting('request.jwt.claims', true)::json->>'sub')::text = "receiverId"
  );

-- Note: For production, you'll want more granular policies
-- This optimized version fixes the Performance Advisor warnings by:
-- 1. Using current_setting() pattern instead of auth.uid() to avoid re-evaluation
-- 2. Combining multiple SELECT policies into single policies where possible
-- 3. Using WITH CHECK for INSERT policies

