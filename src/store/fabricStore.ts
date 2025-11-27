import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { FabricState, Segment, Stripe } from '../types'; // FIXED: Added 'type'

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Helper: Calculate total used width in units
const calculateTotalUnits = (timeline: Segment[]) => {
  return timeline.reduce((acc, seg) => {
    const segWidth = seg.items.reduce((sAcc, item) => sAcc + item.widthUnit, 0);
    return acc + (segWidth * seg.repeatCount);
  }, 0);
};

export const useFabricStore = create<FabricState>()(
  persist(
    (set, get) => ({
      timeline: [],
      textureOpacity: 0.3,
      loomWidth: 6.5,
      activeAlert: null, // NEW: Store alert message here

      setLoomWidth: (width) => set({ loomWidth: width }),

      resetPattern: () => set({ timeline: [] }),

      clearAlert: () => set({ activeAlert: null }), // NEW: Action to dismiss alert

      addSegment: () =>
        set((state) => ({
          timeline: [
            ...state.timeline,
            { id: uuidv4(), type: 'group', items: [], repeatCount: 1 }
          ]
        })),

      addStripeToSegment: (segmentId, stripeData) => {
        const state = get();
        const maxUnits = state.loomWidth * 2;
        const currentUnits = calculateTotalUnits(state.timeline);

        const segment = state.timeline.find(s => s.id === segmentId);
        if (!segment) return;

        const addedUnits = stripeData.widthUnit * segment.repeatCount;

        if (currentUnits + addedUnits > maxUnits) {
          // FIXED: Use state instead of browser alert
          set({ activeAlert: `Loom Full! Max Width: ${state.loomWidth}"` });
          return;
        }

        set((state) => ({
          timeline: state.timeline.map((seg) =>
            seg.id === segmentId
              ? { ...seg, items: [...seg.items, { ...stripeData, id: uuidv4() }] }
              : seg
          ),
        }));
      },

      updateSegmentRepeat: (segmentId, count) => {
        const state = get();
        const maxUnits = state.loomWidth * 2;

        const segment = state.timeline.find(s => s.id === segmentId);
        if (!segment) return;

        const otherSegmentsWidth = calculateTotalUnits(state.timeline.filter(s => s.id !== segmentId));
        const segmentBaseWidth = segment.items.reduce((acc, item) => acc + item.widthUnit, 0);

        const newTotal = otherSegmentsWidth + (segmentBaseWidth * count);

        if (newTotal > maxUnits) {
           set({ activeAlert: `Cannot repeat ${count} times.\nLimit is ${state.loomWidth}"` });
           return;
        }

        set((state) => ({
          timeline: state.timeline.map((seg) =>
            seg.id === segmentId ? { ...seg, repeatCount: Math.max(1, count) } : seg
          ),
        }));
      },

      deleteSegment: (segmentId) =>
        set((state) => ({
          timeline: state.timeline.filter((seg) => seg.id !== segmentId),
        })),

      updateStripe: (segmentId, stripeId, updates) => {
         const state = get();

         if (updates.widthUnit) {
            const maxUnits = state.loomWidth * 2;
            const hypotheticalTimeline = state.timeline.map(seg => {
                if (seg.id !== segmentId) return seg;
                return {
                    ...seg,
                    items: seg.items.map(item => item.id === stripeId ? { ...item, ...updates } : item)
                };
            });

            if (calculateTotalUnits(hypotheticalTimeline) > maxUnits) {
                set({ activeAlert: `Too wide! Limit is ${state.loomWidth}"` });
                return;
            }
         }

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
        }));
      },

      deleteStripeFromSegment: (segmentId, stripeId) =>
        set((state) => ({
          timeline: state.timeline.map((seg) =>
            seg.id === segmentId
              ? { ...seg, items: seg.items.filter((item) => item.id !== stripeId) }
              : seg
          ),
        })),

      shufflePattern: () => {
        const { loomWidth } = get();
        const targetUnits = loomWidth * 2;
        let currentUnits = 0;
        const newItems: Stripe[] = [];

        while (currentUnits < targetUnits) {
          let width = Math.floor(Math.random() * 3) + 1;
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