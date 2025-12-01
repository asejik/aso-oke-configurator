import { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { generatePattern } from '../services/ai';
import { useFabricStore } from '../store/fabricStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MagicModal = ({ isOpen, onClose }: Props) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setTimeline, setLoomWidth } = useFabricStore(); // We need to expose setTimeline in store

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { timeline, loomWidth } = await generatePattern(prompt);

      setLoomWidth(loomWidth);
      setTimeline(timeline); // We will add this action to store next
      onClose();
      setPrompt(''); // Reset
    } catch (err) {
      setError("Failed to generate. Check your API key or try a different description.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="animate-pulse" size={20} />
            <h2 className="font-bold text-lg">Magic Designer</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm">
            Describe your Aso Oke pattern in plain English. Include colors, thickness, and style.
          </p>

          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none min-h-[120px] resize-none"
            placeholder="E.g., I need a pattern with deep royal blue and gold. The blue lines should be thick (1.5 inches) and the gold lines thin. Repeat the block 5 times."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3 bg-black text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Weaving...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Pattern
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};