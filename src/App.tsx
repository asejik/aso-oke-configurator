import { useState } from 'react';
import { useStore } from 'zustand';
import { useFabricStore } from './store/fabricStore';
import { FabricCanvas } from './components/FabricCanvas';
import { SegmentCard } from './components/SegmentCard';
import { DisclaimerModal } from './components/DisclaimerModal';
import { ClearModal } from './components/ClearModal';
import { AlertModal } from './components/AlertModal';
import { SavedDesignsModal } from './components/SavedDesignsModal';
import { Shuffle, Plus, RotateCcw, Info, Folder, Undo2, Redo2 } from 'lucide-react'; // Removed Save
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
    saveDesign
  } = useFabricStore();

  const { undo, redo, pastStates, futureStates } = useStore(useFabricStore.temporal, (state) => state);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

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

        {/* UPDATED HEADER: Responsive Layout */}
        <div className="bg-white/90 backdrop-blur border-b border-gray-200 z-30 flex flex-col md:flex-row md:items-center justify-between">

           {/* Row 1 (Mobile): Loom Selectors - Full Width Grid */}
           <div className="grid grid-cols-3 gap-1 p-2 w-full md:w-auto md:flex md:gap-2">
              {LOOM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLoomWidth(opt.value)}
                  className={clsx(
                    "text-[11px] md:text-xs font-medium py-1.5 rounded-full transition-colors text-center border",
                    loomWidth === opt.value
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                  )}
                >
                  {opt.label}
                </button>
              ))}
           </div>

           {/* Row 2 (Mobile): Actions - Right Aligned */}
           <div className="flex items-center justify-between md:justify-end px-2 pb-2 md:pb-0 md:p-2 gap-0 border-t border-gray-100 md:border-0">

             {/* Undo/Redo Group */}
             <div className="flex items-center mr-2 border-r border-gray-200 pr-2">
                 <button
                    onClick={() => undo()}
                    disabled={pastStates.length === 0}
                    className="text-gray-500 hover:text-gray-900 p-2 disabled:opacity-30"
                    title="Undo"
                 >
                    <Undo2 size={18} />
                 </button>
                 <button
                    onClick={() => redo()}
                    disabled={futureStates.length === 0}
                    className="text-gray-500 hover:text-gray-900 p-2 disabled:opacity-30"
                    title="Redo"
                 >
                    <Redo2 size={18} />
                 </button>
             </div>

             {/* Right Side Tools */}
             <div className="flex items-center">
                <button
                    onClick={() => setIsLibraryOpen(true)}
                    className="text-gray-500 hover:text-blue-600 p-2"
                    title="My Designs"
                >
                    <Folder size={18} />
                </button>

                {/* Removed Save Icon from here */}

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
        </div>

        <div className="flex-1 relative overflow-hidden flex justify-center bg-stone-200">
            {/* Pass handleSave to FabricCanvas */}
            <FabricCanvas onSave={handleSave} />

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