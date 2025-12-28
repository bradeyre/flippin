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

## Recommendation: **Option 1 - Absorb the Fee**

**Reasoning:**
1. **User Experience**: One price = faster decisions = more sales
2. **Competitive**: Most modern platforms absorb card fees
3. **Scale**: At scale, we can negotiate better rates
4. **Psychology**: Buyers prefer simple pricing

**How to handle:**
- Factor 2% into our platform fee calculation
- For listings over R1,000: Platform fee = 5.5% + 2% card fee = 7.5% total
- For listings under R1,000: We absorb the 2% (since no platform fee)
- Or: Deduct from seller payout (simpler accounting)

**Example Calculation:**
```
Item Price: R1,500
Shipping: R150
Total: R1,650

If paid by card:
- Card fee (2%): R33
- Platform fee (5.5%): R82.50
- Seller receives: R1,500 - R82.50 - R33 = R1,384.50

If paid by EFT:
- Platform fee (5.5%): R82.50
- Seller receives: R1,500 - R82.50 = R1,417.50
```

**Note**: We could also offer a small discount for EFT payments to encourage them (since they're cheaper for us).

