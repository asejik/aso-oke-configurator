import { useFabricStore } from './store/fabricStore';
import { FabricCanvas } from './components/FabricCanvas';
import { SegmentCard } from './components/SegmentCard';
import { DisclaimerModal } from './components/DisclaimerModal';
import { Shuffle, Plus } from 'lucide-react';

function App() {
  const { timeline, shufflePattern, addSegment } = useFabricStore();

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">

      {/* Disclaimer Modal (Self-manages visibility) */}
      <DisclaimerModal />

      {/* SECTION 1: The Loom (Canvas) - Top 55% */}
      <div className="h-[55%] w-full relative z-0 shadow-lg">
        <FabricCanvas />

        <button
          onClick={shufflePattern}
          className="absolute bottom-4 right-4 bg-gray-900 text-white p-3 rounded-full shadow-xl active:scale-95 transition-transform z-10"
          title="Randomize Pattern"
        >
          <Shuffle size={20} />
        </button>
      </div>

      {/* SECTION 2: Control Panel - Bottom 45% */}
      <div className="h-[45%] flex flex-col w-full bg-white z-10 relative">

        <div className="px-6 pt-4 pb-2 border-b flex justify-between items-center bg-white">
            <h2 className="font-bold text-gray-800">Weaving Blocks</h2>
            <button
                onClick={addSegment}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100"
            >
                <Plus size={14} /> Add Block
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20">
          {timeline.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              <p>No patterns yet.</p>
              <p className="text-sm">Click "Add Block" or use the Shuffle button.</p>
            </div>
          ) : (
            timeline.map((segment, index) => (
              <SegmentCard key={segment.id} segment={segment} index={index} />
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default App;