import { describe, expect, it } from 'vitest';
import {
  LISTING_OWNER_ID_SELECT,
  LISTING_SAFE_SELECT,
} from '@/features/listings/repository/supabase/listing-safe-select';

describe('listing owner_id PostgREST lockdown prep', () => {
  it('keeps a privileged id,owner_id projection separate from public select', () => {
    expect(LISTING_OWNER_ID_SELECT).toBe('id,owner_id');
    expect(LISTING_SAFE_SELECT.split(',')).not.toContain('owner_id');
  });
});
