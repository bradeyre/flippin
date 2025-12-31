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

-- Create policies for public read access (for marketplace listings)
-- Users can read active listings
CREATE POLICY "Public can read active listings"
  ON "Listing"
  FOR SELECT
  USING (status = 'ACTIVE');

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON "User"
  FOR SELECT
  USING (auth.uid() = id);

-- Users can read their own listings
CREATE POLICY "Users can read own listings"
  ON "Listing"
  FOR SELECT
  USING (auth.uid() = "sellerId");

-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON "Transaction"
  FOR SELECT
  USING (auth.uid() = "sellerId" OR auth.uid() = "buyerId");

-- Users can read their own messages
CREATE POLICY "Users can read own messages"
  ON "Message"
  FOR SELECT
  USING (auth.uid() = "senderId" OR auth.uid() = "receiverId");

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON "Notification"
  FOR SELECT
  USING (auth.uid() = "userId");

-- Note: For production, you'll want more granular policies
-- This is a basic setup to address the security warnings
-- You may want to restrict writes to authenticated users only

