import { useState } from 'react';
import { useFabricStore } from './store/fabricStore';
import { FabricCanvas } from './components/FabricCanvas';
import { SegmentCard } from './components/SegmentCard';
import { DisclaimerModal } from './components/DisclaimerModal';
import { ClearModal } from './components/ClearModal';
import { AlertModal } from './components/AlertModal';
import { SavedDesignsModal } from './components/SavedDesignsModal'; // NEW
import { Shuffle, Plus, RotateCcw, Info, Save, Folder } from 'lucide-react'; // Added Save, Folder
import clsx from 'clsx';

function App() {
  const {
    timeline,
    shufflePattern,
    addSegment,
    resetPattern,
    loomWidth,
    setLoomWidth,
    activeAlert,
    clearAlert,
    setDisclaimerOpen,
    saveDesign // NEW action
  } = useFabricStore();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false); // NEW state for modal

  const LOOM_OPTIONS = [
    { label: 'Awẹ́ (6.5")', value: 6.5 },
    { label: 'Loom 20', value: 20 },
    { label: 'Loom 25', value: 25 },
  ];

  const handleSave = () => {
    const name = prompt("Name your design:");
    if (name) {
        saveDesign(name);
        alert("Design Saved!");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      <DisclaimerModal />
      <AlertModal message={activeAlert} onClose={clearAlert} />

      {/* NEW: Saved Designs Modal */}
      <SavedDesignsModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      <ClearModal
        isOpen={isClearModalOpen}
        onCancel={() => setIsClearModalOpen(false)}
        onConfirm={() => {
            resetPattern();
            setIsClearModalOpen(false);
        }}
      />

      {/* SECTION 1: The Loom (Canvas) - Top 55% */}
      <div className="h-[55%] w-full relative z-0 shadow-lg flex flex-col">

        <div className="bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-2 flex items-center justify-between z-30">

           {/* Loom Selectors */}
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {LOOM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLoomWidth(opt.value)}
                  className={clsx(
                    "text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors",
                    loomWidth === opt.value
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {opt.label}
                </button>
              ))}
           </div>

           {/* Header Actions */}
           <div className="flex items-center gap-0">
             <button
                onClick={() => setIsLibraryOpen(true)}
                className="text-gray-500 hover:text-blue-600 p-2"
                title="My Designs"
             >
                <Folder size={20} />
             </button>

             <button
                onClick={handleSave}
                className="text-gray-500 hover:text-blue-600 p-2"
                title="Save Design"
             >
                <Save size={20} />
             </button>

             <div className="w-px h-4 bg-gray-300 mx-1"></div>

             <button
               onClick={() => setDisclaimerOpen(true)}
               className="text-gray-400 hover:text-blue-500 p-2"
               title="Color Accuracy Info"
             >
               <Info size={18} />
             </button>

             <button
               onClick={() => setIsClearModalOpen(true)}
               className="text-gray-400 hover:text-red-500 p-2"
               title="Reset Canvas"
             >
               <RotateCcw size={18} />
             </button>
           </div>
        </div>

        <div className="flex-1 relative overflow-hidden flex justify-center bg-stone-200">
            <FabricCanvas />

            <button
                onClick={shufflePattern}
                className="absolute bottom-4 right-4 bg-gray-900 text-white p-3 rounded-full shadow-xl active:scale-95 transition-transform z-10"
                title="Shuffle (Max 4 Colors)"
            >
            <Shuffle size={20} />
            </button>
        </div>
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
              <p className="text-sm">Select a size above and click Shuffle.</p>
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