// src/types.ts

// Base Unit: The physical thread line [cite: 38]
export interface Stripe {
  id: string;         // UUID
  color: string;      // Hex Code (e.g., "#FFD700")
  widthUnit: number;  // 1 unit = 0.5 inches (Base resolution) [cite: 42]
}

// Container: The repeatable block [cite: 44]
export interface Segment {
  id: string;
  type: 'group';
  items: Stripe[];    // Array of stripes inside this group [cite: 49]
  repeatCount: number;// e.g., 5 means this block appears 5 times sequentially [cite: 50]
}

// Global Store State
export interface FabricState {
  timeline: Segment[];
  textureOpacity: number;

  // Actions
  addSegment: () => void;
  addStripeToSegment: (segmentId: string, stripe: Omit<Stripe, 'id'>) => void;
  updateSegmentRepeat: (segmentId: string, count: number) => void;
  deleteSegment: (segmentId: string) => void;
  // New Action:
  updateStripe: (segmentId: string, stripeId: string, updates: Partial<Stripe>) => void;
  deleteStripeFromSegment: (segmentId: string, stripeId: string) => void;
  shufflePattern: () => void;
}