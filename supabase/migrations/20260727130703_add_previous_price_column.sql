/*
# Add previous_price column to listings

Adds a `previous_price` column to track the last known price before
the most recent change. This works alongside price_history to give
the dashboard instant access to "last price vs current price" without
needing to query the history table.

## 1. Modified Tables

### listings
- previous_price (numeric, nullable) — the price before the current one.
  Updated only when price actually changes during a sync.

## 2. Security
No new tables — existing RLS policies on listings cover this column.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'previous_price'
  ) THEN
    ALTER TABLE listings ADD COLUMN previous_price numeric(12,2);
  END IF;
END $$;
