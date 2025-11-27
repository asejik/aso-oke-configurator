import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ClearModal = ({ isOpen, onConfirm, onCancel }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/20 backdrop-blur-[1px]">
      <div className="bg-[#2A1B1B] text-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200 border border-gray-700">

        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
                 127.0.0.1:5173 says
            </h3>

            <p className="text-gray-300">
                Clear all segments?
            </p>

            <div className="flex justify-end gap-3 mt-2">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 rounded-full bg-[#5C2E2E] hover:bg-[#6D3636] text-white font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-6 py-2 rounded-full bg-[#FFA0A0] hover:bg-[#FFB0B0] text-[#5C2E2E] font-bold transition-colors"
                >
                    OK
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};