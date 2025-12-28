# Cart & Multi-Item Purchase Strategy

## Current System
- One transaction per listing
- One seller per transaction
- Direct checkout per item

## Multi-Item Purchase Requirements

### Scenario: Buyer wants to buy 3 items from 3 different sellers
- Item 1: R500 (Seller A)
- Item 2: R1,200 (Seller B)  
- Item 3: R800 (Seller C)

### Options

#### Option 1: Cart System (Recommended)
**How it works:**
- Add items to cart
- Cart shows all items grouped by seller
- Checkout creates multiple transactions (one per seller)
- Buyer can pay all at once (combined payment) or separately
- Each seller ships independently
- Each transaction tracked separately

**Pros:**
- Better UX (like Amazon/eBay)
- Can compare items before buying
- Batch checkout convenience
- Still maintains separate transactions per seller

**Cons:**
- More complex implementation
- Need cart management

#### Option 2: One-at-a-Time (Current)
**How it works:**
- Buy one item, complete transaction
- Then buy next item
- Each is independent

**Pros:**
- Simple
- Already works
- No cart complexity

**Cons:**
- Less convenient for multiple items
- Can't compare easily
- Multiple checkout flows

## Recommendation: **Hybrid Approach**

### Quick Buy (One Item)
- "Buy Now" button → Direct checkout (current system)
- Fast for single items

### Cart System (Multiple Items)
- "Add to Cart" button
- Cart page shows all items
- Checkout creates multiple transactions
- Payment options:
  - Pay all at once (if same payment method)
  - Pay separately (if different methods needed)

### Implementation

**Cart Model:**
- Session-based cart (no database needed initially)
- Or: Cart table for logged-in users
- Stores: listingId, quantity (always 1 for now), selected options

**Checkout Flow:**
1. Buyer adds items to cart
2. Goes to cart page
3. Reviews items (grouped by seller)
4. Checks out
5. System creates one transaction per seller
6. Payment:
   - If all EFT: One payment instruction with multiple references
   - If all Card: One payment with split to multiple transactions
   - Mixed: Separate payment flows

**Transaction Structure:**
- Each transaction remains independent
- Each seller ships separately
- Each transaction tracked separately
- Buyer can confirm delivery per item

## Database Changes Needed

**Option A: Session-based (Simpler)**
- No DB changes
- Cart stored in localStorage/session
- Lost if user logs out

**Option B: Cart Table (Better)**
```prisma
model Cart {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  items     CartItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id])
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
}
```

## Payment Strategy for Multi-Item

**Single Payment (Recommended):**
- Buyer pays total amount once
- System splits payment across transactions
- Each seller gets their portion
- Simpler for buyer

**Multiple Payments:**
- Buyer pays each transaction separately
- More complex but more flexible

## Recommendation

**Start with Session-based Cart:**
1. Add to cart functionality
2. Cart page
3. Checkout creates multiple transactions
4. Single payment that splits across transactions

**Future Enhancement:**
- Add Cart table for persistence
- Save for later functionality
- Cart abandonment emails

