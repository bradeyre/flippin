# Changelog

All notable changes to the Flippin project will be documented in this file.

---

## [Unreleased] - 2025-01-27

### Added
- **Listing Creation API** (`/api/listings/create`)
  - Creates listings in database with full product details
  - Generates instant offers from active instant buyers
  - Applies friendly pricing rounding
  - Handles delivery method selection
  
- **Friendly Pricing Utility** (`lib/utils/pricing.ts`)
  - Rounds prices to "friendly" numbers ending in 9 or 99
  - Examples: R87 → R99, R1,312 → R1,319
  - Applied to both asking prices and instant offers

- **Delivery Method Selection**
  - Added `LOCKER_TO_LOCKER` to DeliveryMethod enum
  - Added delivery method selection step in seller flow
  - Supports: PAXI, LOCKER_TO_LOCKER, DOOR_TO_DOOR

### Changed
- **Pricing Calculations**
  - Updated `calculateInstantOffer()` to use friendly pricing
  - Instant offers now round to friendly numbers
  - Asking prices automatically rounded to friendly prices

- **Seller Flow**
  - Added delivery method selection step before listing creation
  - Updated to pass full analysis and pricing data to API
  - Improved data flow between steps

### Fixed
- Updated Prisma schema to include LOCKER_TO_LOCKER delivery method
- Fixed category inclusion in confirmed details

---

## Previous Changes

See `BUILD_STATUS.md` for historical development progress.

