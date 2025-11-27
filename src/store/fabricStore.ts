import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { FabricState, Segment, Stripe } from '../types';

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const useFabricStore = create<FabricState>()(
  persist(
    (set, get) => ({
      timeline: [],
      textureOpacity: 0.3,
      loomWidth: 6.5, // Default to Awẹ́

      setLoomWidth: (width) => set({ loomWidth: width }),

      resetPattern: () => set({ timeline: [] }),

      addSegment: () =>
        set((state) => ({
          timeline: [
            ...state.timeline,
            { id: uuidv4(), type: 'group', items: [], repeatCount: 1 }
          ]
        })),

      addStripeToSegment: (segmentId, stripeData) =>
        set((state) => ({
          timeline: state.timeline.map((seg) =>
            seg.id === segmentId
              ? { ...seg, items: [...seg.items, { ...stripeData, id: uuidv4() }] }
              : seg
          ),
        })),

      updateSegmentRepeat: (segmentId, count) =>
        set((state) => ({
          timeline: state.timeline.map((seg) =>
            seg.id === segmentId ? { ...seg, repeatCount: Math.max(1, count) } : seg
          ),
        })),

      deleteSegment: (segmentId) =>
        set((state) => ({
          timeline: state.timeline.filter((seg) => seg.id !== segmentId),
        })),

      updateStripe: (segmentId, stripeId, updates) =>
        set((state) => ({
          timeline: state.timeline.map((seg) =>
            seg.id === segmentId
              ? {
                  ...seg,
                  items: seg.items.map((item) =>
                    item.id === stripeId ? { ...item, ...updates } : item
                  ),
                }
              : seg
          ),
        })),

      deleteStripeFromSegment: (segmentId, stripeId) =>
        set((state) => ({
          timeline: state.timeline.map((seg) =>
            seg.id === segmentId
              ? { ...seg, items: seg.items.filter((item) => item.id !== stripeId) }
              : seg
          ),
        })),

      // NEW: Smart Shuffle Logic
      shufflePattern: () => {
        const { loomWidth } = get();
        const targetUnits = loomWidth * 2; // 1 inch = 2 units
        let currentUnits = 0;
        const newItems: Stripe[] = [];

        // Generate stripes until we fill the width
        while (currentUnits < targetUnits) {
          let width = Math.floor(Math.random() * 3) + 1; // Random width 1-3

          // Clamp the last stripe to fit exactly
          if (currentUnits + width > targetUnits) {
            width = targetUnits - currentUnits;
          }

          if (width > 0) {
            newItems.push({
              id: uuidv4(),
              color: getRandomColor(),
              widthUnit: width,
            });
            currentUnits += width;
          }
        }

        // For simplicity in shuffle, we create 1 main block that repeats once
        const newSegment: Segment = {
          id: uuidv4(),
          type: 'group',
          items: newItems,
          repeatCount: 1,
        };

        set({ timeline: [newSegment] });
      },
    }),
    {
      name: 'aso-oke-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);