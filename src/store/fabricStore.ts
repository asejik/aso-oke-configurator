import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { temporal } from 'zundo'; // NEW
import { v4 as uuidv4 } from 'uuid';
import type { FabricState, Segment, Stripe, SavedDesign } from '../types';

// ... (Keep existing helpers generatePalette and calculateTotalUnits here) ...
const generatePalette = () => {
  const letters = '0123456789ABCDEF';
  const getHex = () => {
    let color = '#';
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    return color;
  };
  return [getHex(), getHex(), getHex(), getHex()];
};

const calculateTotalUnits = (timeline: Segment[]) => {
  return timeline.reduce((acc, seg) => {
    const segWidth = seg.items.reduce((sAcc, item) => sAcc + item.widthUnit, 0);
    return acc + (segWidth * seg.repeatCount);
  }, 0);
};

export const useFabricStore = create<FabricState>()(
  temporal(
    persist(
      (set, get) => ({
        timeline: [],
        textureOpacity: 0.3,
        loomWidth: 6.5,
        activeAlert: null,
        isDisclaimerOpen: false,
        savedDesigns: [],

        setLoomWidth: (width) => set({ loomWidth: width }),
        setLoomAndShuffle: (width) => {
            set({ loomWidth: width });
            // Immediately trigger shuffle using the NEW width
            get().shufflePattern();
        },
        resetPattern: () => set({ timeline: [] }),
        clearAlert: () => set({ activeAlert: null }),
        setDisclaimerOpen: (isOpen) => set({ isDisclaimerOpen: isOpen }),

        saveDesign: (name) => {
          const state = get();
          if (state.timeline.length === 0) {
              set({ activeAlert: "Cannot save an empty pattern." });
              return;
          }
          const newDesign: SavedDesign = {
              id: uuidv4(),
              name,
              createdAt: Date.now(),
              timeline: state.timeline,
              loomWidth: state.loomWidth
          };
          set({ savedDesigns: [newDesign, ...state.savedDesigns] });
        },

        loadDesign: (designId) => {
          const state = get();
          const design = state.savedDesigns.find(d => d.id === designId);
          if (design) {
              set({
                  timeline: design.timeline,
                  loomWidth: design.loomWidth
              });
          }
        },

        deleteDesign: (designId) => {
          set(state => ({
              savedDesigns: state.savedDesigns.filter(d => d.id !== designId)
          }));
        },

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

        duplicateStripe: (segmentId, stripeId) => {
          const state = get();
          const maxUnits = state.loomWidth * 2;
          const currentUnits = calculateTotalUnits(state.timeline);

          const segment = state.timeline.find(s => s.id === segmentId);
          if (!segment) return;

          const stripeToCopy = segment.items.find(s => s.id === stripeId);
          if (!stripeToCopy) return;

          const addedUnits = stripeToCopy.widthUnit * segment.repeatCount;
          if (currentUnits + addedUnits > maxUnits) {
             set({ activeAlert: `Cannot duplicate.\nLoom Limit Reached (${state.loomWidth}")` });
             return;
          }

          set((state) => ({
            timeline: state.timeline.map((seg) =>
              seg.id === segmentId
              ? {
                  ...seg,
                  items: seg.items.reduce((acc, item) => {
                      if (item.id === stripeId) {
                          return [...acc, item, { ...item, id: uuidv4() }];
                      }
                      return [...acc, item];
                  }, [] as Stripe[])
                }
              : seg
            )
          }));
        },

        updateSegmentRepeat: (segmentId, count) => {
          const state = get();
          const maxUnits = state.loomWidth * 2;
          const segment = state.timeline.find(s => s.id === segmentId);
          if (!segment) return;

          const otherSegmentsWidth = calculateTotalUnits(state.timeline.filter(s => s.id !== segmentId));
          const segmentBaseWidth = segment.items.reduce((acc, item) => acc + item.widthUnit, 0);

          if (otherSegmentsWidth + (segmentBaseWidth * count) > maxUnits) {
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
                ? { ...seg, items: seg.items.map((item) => item.id === stripeId ? { ...item, ...updates } : item) }
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
          const palette = generatePalette();

          while (currentUnits < targetUnits) {
            let width = Math.floor(Math.random() * 3) + 1;
            if (currentUnits + width > targetUnits) width = targetUnits - currentUnits;

            if (width > 0) {
              newItems.push({
                id: uuidv4(),
                color: palette[Math.floor(Math.random() * palette.length)],
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
    ),
    {
      // Zundo Configuration
      limit: 100, // Keep last 100 moves
      partialize: (state) => {
        // Only track timeline and loomWidth in history
        // Ignore alerts, modals, and saved library
        const { timeline, loomWidth } = state;
        return { timeline, loomWidth };
      },
    }
  )
);