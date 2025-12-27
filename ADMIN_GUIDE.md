# Admin Guide - Super User Backend

**Last Updated:** January 2025

---

## 🎯 Overview

You now have a comprehensive admin backend that allows you (as super user) to edit almost anything on the site. The admin system is fully functional and ready to use.

---

## 🔐 Admin Access

### Your Super User Account
- **Email:** `brad@eyre.co.za`
- **Type:** `ADMIN`
- **Status:** Auto-created and verified

The system automatically creates your admin account if it doesn't exist. All admin API routes are protected and require admin access.

---

## 📡 Admin API Routes

### Listings Management

**GET `/api/admin/listings`**
- List all listings with filters
- Query params: `status`, `categoryId`, `sellerId`, `page`, `limit`
- Returns paginated listings with seller and category info

**GET `/api/admin/listings/[id]`**
- Get single listing with full details
- Includes offers, instant offers, transactions

**PATCH `/api/admin/listings/[id]`**
- Update any listing field
- Can change: status, title, description, price, condition, category, seller, etc.
- Example: Approve/reject listings, edit prices, change sellers

**DELETE `/api/admin/listings/[id]`**
- Soft delete listing (sets status to REMOVED)

### Users Management

**GET `/api/admin/users`**
- List all users with filters
- Query params: `type`, `verified`, `search`, `page`, `limit`
- Search by email, name, phone

**GET `/api/admin/users/[id]`**
- Get single user with full details
- Includes listings, buy orders, transactions, stats

**PATCH `/api/admin/users/[id]`**
- Update any user field
- Can change: email, type, verification status, banking details, stats, etc.
- Example: Promote to admin, verify users, update ratings

### Instant Buyers Management

**GET `/api/admin/instant-buyers`**
- List all instant buyers
- Query params: `approved`, `active`, `page`, `limit`

**GET `/api/admin/instant-buyers/[id]`**
- Get single instant buyer with offers history

**PATCH `/api/admin/instant-buyers/[id]`**
- Approve/reject instant buyers
- Pause/resume offers
- Edit pricing rules (base offer %, condition multipliers)
- Edit categories they buy in

### Transactions Management

**GET `/api/admin/transactions`**
- List all transactions with filters
- Query params: `status`, `paymentStatus`, `transactionType`, `sellerId`, `buyerId`, `page`, `limit`

**GET `/api/admin/transactions/[id]`**
- Get single transaction with full details

**PATCH `/api/admin/transactions/[id]`**
- Update transaction status
- Verify payments
- Update delivery status
- Handle disputes
- Release escrow

### Ledger (Financial Audit Trail)

**GET `/api/admin/ledger`**
- Get all financial transactions
- Query params: `type`, `status`, `fromUserId`, `toUserId`, `transactionId`, `startDate`, `endDate`, `page`, `limit`
- Returns totals for completed transactions

### Platform Settings

**GET `/api/admin/settings`**
- Get current platform settings
- Auto-creates default settings if none exist

**PATCH `/api/admin/settings`**
- Update platform settings
- Can change: commission rates, free threshold, escrow days, bank details, email templates

### Statistics

**GET `/api/admin/stats`**
- Get platform overview statistics
- Returns: user counts, listing counts, transaction counts, revenue, recent activity

---

## 🖥️ Admin Dashboard

### Overview Page (`/admin`)

The admin dashboard provides:
- **Real-time Statistics**
  - Total users, listings, transactions
  - Platform revenue
  - Active instant buyers

- **Quick Navigation Cards**
  - Click to navigate to different admin sections

- **Recent Activity**
  - Latest listings
  - Latest transactions

- **Quick Actions**
  - Links to all admin sections

---

## 🧪 Testing the Admin Backend

### 1. Test Admin Access

```bash
# Start the dev server
npm run dev

# Visit the admin dashboard
http://localhost:3000/admin
```

### 2. Test API Routes

You can test API routes using curl or a tool like Postman:

```bash
# Get stats
curl http://localhost:3000/api/admin/stats

# Get all listings
curl http://localhost:3000/api/admin/listings

# Get a specific listing
curl http://localhost:3000/api/admin/listings/[listing-id]

# Update a listing
curl -X PATCH http://localhost:3000/api/admin/listings/[listing-id] \
  -H "Content-Type: application/json" \
  -d '{"status": "ACTIVE"}'
```

### 3. Test User Management

```bash
# Get all users
curl http://localhost:3000/api/admin/users

# Get instant buyers
curl http://localhost:3000/api/admin/instant-buyers

# Approve an instant buyer
curl -X PATCH http://localhost:3000/api/admin/instant-buyers/[buyer-id] \
  -H "Content-Type: application/json" \
  -d '{"approved": true}'
```

---

## 🔧 Common Admin Tasks

### Approve a Listing
```javascript
PATCH /api/admin/listings/[id]
{ "status": "ACTIVE" }
```

### Reject a Listing
```javascript
PATCH /api/admin/listings/[id]
{ "status": "REMOVED" }
```

### Approve an Instant Buyer
```javascript
PATCH /api/admin/instant-buyers/[id]
{ "approved": true }
```

### Verify Payment
```javascript
PATCH /api/admin/transactions/[id]
{ "paymentStatus": "VERIFIED", "paidAt": "2025-01-27T..." }
```

### Update Platform Settings
```javascript
PATCH /api/admin/settings
{
  "marketplaceRate": 0.055,
  "freeThreshold": 1000,
  "instantOfferRate": 0.05
}
```

### Change User Type
```javascript
PATCH /api/admin/users/[id]
{ "type": "ADMIN" }
```

---

## 📋 Next Steps

### UI Pages to Build (Part 2)

1. **Listings Management Page** (`/admin/listings`)
   - Table view with filters
   - Bulk actions (approve, reject)
   - Edit inline

2. **Users Management Page** (`/admin/users`)
   - User table with search
   - Edit user details
   - View user activity

3. **Instant Buyers Page** (`/admin/instant-buyers`)
   - List all instant buyers
   - Approve/reject workflow
   - Edit pricing rules

4. **Transactions Page** (`/admin/transactions`)
   - Transaction table
   - Payment verification
   - Dispute handling

5. **Settings Page** (`/admin/settings`)
   - Edit platform settings
   - Commission rates
   - Bank details

---

## 🔒 Security Notes

- All admin routes require admin authentication
- Currently uses email-based check (`brad@eyre.co.za`)
- In production, should use proper Supabase auth
- Admin routes return 401 if unauthorized

---

## 💡 Tips

- Use the dashboard overview for quick insights
- API routes support pagination (default 50 items per page)
- All list endpoints support filtering
- Update operations are partial (only send fields to update)
- Soft deletes are used (status changes, not actual deletion)

---

**The admin backend is fully functional and ready to use!** 🎉

