# Payment Strategy - Card Fee Management

## Card Processing Fees
- **Card fee**: ~2% (charged by payment processor)
- **Question**: Should Flippin absorb this cost?

## Options

### Option 1: Absorb the Fee (Recommended)
**Pros:**
- Simpler buyer experience (no surprise fees)
- Competitive advantage (buyers see one price)
- Faster checkout (less friction)
- Better conversion rates

**Cons:**
- Reduces our margin by 2%
- Need to factor into pricing strategy

**Implementation:**
- Show one price to buyer
- Deduct 2% from seller payout (or from platform fee)
- Example: R1,000 purchase
  - Buyer pays: R1,000
  - Card fee: R20 (2%)
  - Platform fee: R55 (5.5% of R1,000)
  - Seller receives: R925 (R1,000 - R55 - R20)

### Option 2: Pass to Buyer
**Pros:**
- Maintains full margin
- Transparent about costs

**Cons:**
- Higher checkout price (reduces conversion)
- Feels like a "hidden fee" even if disclosed
- More complex UI (need to show breakdown)

**Implementation:**
- Show: "R1,000 + R20 card fee = R1,020"
- Buyer pays: R1,020
- Seller receives: R945 (R1,000 - R55)

### Option 3: Split the Fee
**Pros:**
- Shared cost
- Fair to both parties

**Cons:**
- Most complex
- Still adds friction

**Implementation:**
- Buyer pays: R1,010 (R1,000 + R10)
- Seller receives: R935 (R1,000 - R55 - R10)

## Recommendation: **Charge Seller, Show Transparently**

**Reasoning:**
1. **Transparency**: Both buyer and seller see clear fee breakdown
2. **Buyer Experience**: One price = faster decisions = more sales
3. **Seller Understanding**: Seller sees exactly what they're paying for
4. **Fairness**: Seller benefits from card convenience, pays the fee
5. **Accounting**: Clear separation of platform fee vs payment processing fee

**How to handle:**
- Buyer pays: One price (no card fee shown to buyer)
- Seller receives: Item price - platform fee - card fee (if card payment)
- Show clear breakdown in seller dashboard:
  - Item Price: R1,500
  - Platform Fee (5.5%): -R82.50
  - Card Processing Fee (2%): -R30.00 (only if paid by card)
  - You Receive: R1,387.50

**Example Calculation:**
```
Item Price: R1,500
Shipping: R150
Total Buyer Pays: R1,650 (same regardless of payment method)

If paid by CARD:
- Platform fee (5.5%): R82.50
- Card fee (2%): R30.00
- Seller receives: R1,500 - R82.50 - R30.00 = R1,387.50

If paid by EFT:
- Platform fee (5.5%): R82.50
- Card fee: R0.00
- Seller receives: R1,500 - R82.50 = R1,417.50
```

**Benefits:**
- ✅ Buyer sees one simple price (no friction)
- ✅ Seller sees transparent fee breakdown
- ✅ Encourages EFT payments (seller gets more)
- ✅ Clear accounting and reporting

