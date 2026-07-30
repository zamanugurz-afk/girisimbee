export interface ListingNote {
  id: string;
  text: string;
  pinned: boolean;
  color: string;
  createdAt: string;
}

export interface ListingFavoriteMetadata {
  version: 1;
  notes: ListingNote[];
  purchaseStatus: string;
  checklistChecked: number[];
}

const DEFAULT_METADATA: ListingFavoriteMetadata = {
  version: 1,
  notes: [],
  purchaseStatus: 'watching',
  checklistChecked: [],
};

export function parseFavoriteMetadata(notes: string | null | undefined): ListingFavoriteMetadata {
  if (!notes?.trim()) return { ...DEFAULT_METADATA };

  try {
    const parsed = JSON.parse(notes) as Partial<ListingFavoriteMetadata>;
    if (parsed.version === 1) {
      return {
        version: 1,
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        purchaseStatus: parsed.purchaseStatus ?? 'watching',
        checklistChecked: Array.isArray(parsed.checklistChecked) ? parsed.checklistChecked : [],
      };
    }
  } catch {
    return {
      ...DEFAULT_METADATA,
      notes: [
        {
          id: 'legacy-note',
          text: notes,
          pinned: false,
          color: 'yellow',
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  return { ...DEFAULT_METADATA };
}

export function serializeFavoriteMetadata(metadata: ListingFavoriteMetadata): string {
  return JSON.stringify(metadata);
}
