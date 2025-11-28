import { Trash2, FolderOpen, X } from 'lucide-react';
import { useFabricStore } from '../store/fabricStore';
import type { SavedDesign } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedDesignsModal = ({ isOpen, onClose }: Props) => {
  const { savedDesigns, loadDesign, deleteDesign } = useFabricStore();

  if (!isOpen) return null;

  const handleLoad = (design: SavedDesign) => {
    if (confirm(`Load "${design.name}"? This will replace your current canvas.`)) {
        loadDesign(design.id);
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <FolderOpen size={20} className="text-blue-600"/> My Designs
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
            </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedDesigns.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                    <p>No saved designs yet.</p>
                    <p className="text-sm">Click the "Save" icon to add one.</p>
                </div>
            ) : (
                savedDesigns.map((design) => (
                    <div key={design.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors bg-white shadow-sm flex justify-between items-center">
                        <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleLoad(design)}
                        >
                            <h3 className="font-semibold text-gray-800">{design.name}</h3>
                            <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                <span>{new Date(design.createdAt).toLocaleDateString()}</span>
                                <span className="bg-gray-100 px-2 rounded-full text-gray-600">
                                    {design.loomWidth}" Loom
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if(confirm("Delete this design?")) deleteDesign(design.id)
                            }}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
};