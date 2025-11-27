import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { FabricState, Segment, Stripe } from '../types';

// Helper: Random Color Generator
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
    (set) => ({
      timeline: [],
      textureOpacity: 0.3,

      addSegment: () =>
        set((state) => {
          const newSegment: Segment = {
            id: uuidv4(),
            type: 'group',
            items: [],
            repeatCount: 1,
          };
          return { timeline: [...state.timeline, newSegment] };
        }),

      addStripeToSegment: (segmentId, stripeData) =>
        set((state) => {
          const newStripe: Stripe = {
            ...stripeData,
            id: uuidv4(),
          };
          return {
            timeline: state.timeline.map((seg) =>
              seg.id === segmentId
                ? { ...seg, items: [...seg.items, newStripe] }
                : seg
            ),
          };
        }),

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

      shufflePattern: () => {
        const segmentCount = Math.floor(Math.random() * 2) + 1;
        const newTimeline: Segment[] = [];

        for (let i = 0; i < segmentCount; i++) {
          const stripeCount = Math.floor(Math.random() * 4) + 2;
          const items: Stripe[] = [];

          for (let j = 0; j < stripeCount; j++) {
            items.push({
              id: uuidv4(),
              color: getRandomColor(),
              widthUnit: Math.floor(Math.random() * 3) + 1,
            });
          }

          newTimeline.push({
            id: uuidv4(),
            type: 'group',
            items,
            repeatCount: Math.floor(Math.random() * 5) + 1,
          });
        }
        set({ timeline: newTimeline });
      },
    }),
    {
      name: 'aso-oke-storage', // unique name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);