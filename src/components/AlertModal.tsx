interface Props {
  message: string | null;
  onClose: () => void;
}

export const AlertModal = ({ message, onClose }: Props) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 bg-black/20 backdrop-blur-[1px]">
      <div className="bg-[#2A1B1B] text-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200 border border-gray-700">

        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium flex items-center gap-2 text-red-200">
                 ⚠️ Limit Reached
            </h3>

            <p className="text-gray-300 whitespace-pre-line">
                {message}
            </p>

            <div className="flex justify-end mt-2">
                <button
                    onClick={onClose}
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