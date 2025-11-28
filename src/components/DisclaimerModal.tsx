import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useFabricStore } from '../store/fabricStore';

export const DisclaimerModal = () => {
  const { isDisclaimerOpen, setDisclaimerOpen } = useFabricStore();

  useEffect(() => {
    const hasSeen = localStorage.getItem('aso-oke-disclaimer-seen');
    if (!hasSeen) {
      setDisclaimerOpen(true);
    }
  }, [setDisclaimerOpen]);

  const handleDismiss = () => {
    localStorage.setItem('aso-oke-disclaimer-seen', 'true');
    setDisclaimerOpen(false);
  };

  if (!isDisclaimerOpen) return null;

  // ... (JSX is identical to before, just use handleDismiss)
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-amber-50 p-6 flex gap-4 border-b border-amber-100">
          <div className="bg-amber-100 p-3 rounded-full h-fit text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Color Accuracy Warning</h3>
            <p className="text-sm text-gray-600 mt-1">Please read before designing.</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-700 leading-relaxed">
            The colors you see on your screen (RGB) are <strong>digital approximations</strong>.
            Real thread dyes respond to light differently than phone screens.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 border border-gray-200">
            <strong>Tip for Weavers:</strong> Always use physical thread samples to confirm colors with your client before purchasing materials.
          </div>
        </div>
        <div className="p-4 bg-gray-50 flex justify-end">
          <button
            onClick={handleDismiss}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            I Understand <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};