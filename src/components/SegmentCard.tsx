// ... imports remain the same
import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Plus, Copy } from 'lucide-react';
import type { Segment, Stripe } from '../types';
import { useFabricStore } from '../store/fabricStore';
import { ColorPickerPopover } from './ColorPickerPopover';

interface Props {
  segment: Segment;
  index: number;
}

export const SegmentCard = ({ segment, index }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    updateSegmentRepeat,
    deleteSegment,
    addStripeToSegment,
    updateStripe,
    deleteStripeFromSegment,
    duplicateStripe
  } = useFabricStore();

  const handleAddStripe = () => {
    addStripeToSegment(segment.id, { color: '#000000', widthUnit: 2 });
  };

  return (
    // FIX 3: Removed 'overflow-hidden' so the popover can float outside the card
    <div className="bg-white border border-gray-200 rounded-lg mb-3 shadow-sm">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
        <div
          className="flex items-center gap-2 cursor-pointer flex-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <span className="font-semibold text-gray-700">Block {index + 1}</span>
          <div className="flex h-4 gap-[1px] ml-2">
            {segment.items.slice(0, 5).map((s) => (
              <div key={s.id} className="w-2 h-full rounded-full" style={{ background: s.color }} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border rounded px-2 py-1">
            <span className="text-xs text-gray-500 mr-2">x</span>
            <input
              type="number"
              min="1"
              max="99"
              value={segment.repeatCount}
              onChange={(e) => updateSegmentRepeat(segment.id, parseInt(e.target.value) || 1)}
              className="w-8 text-center text-sm font-medium outline-none"
            />
          </div>
          <button
            onClick={() => deleteSegment(segment.id)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 border-t bg-white rounded-b-lg">
            <div className="space-y-2">
                {segment.items.length === 0 && (
                    <p className="text-sm text-gray-400 italic text-center py-2">No threads yet.</p>
                )}

                {segment.items.map((stripe) => (
                    <StripeRow
                        key={stripe.id}
                        stripe={stripe}
                        onChange={(updates) => updateStripe(segment.id, stripe.id, updates)}
                        onDelete={() => deleteStripeFromSegment(segment.id, stripe.id)}
                        onDuplicate={() => duplicateStripe(segment.id, stripe.id)}
                    />
                ))}
            </div>

            <button
                onClick={handleAddStripe}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
                <Plus size={16} /> Add Thread Line
            </button>
        </div>
      )}
    </div>
  );
};

const StripeRow = ({ stripe, onChange, onDelete, onDuplicate }: {
    stripe: Stripe,
    onChange: (u: Partial<Stripe>) => void,
    onDelete: () => void,
    onDuplicate: () => void
}) => {
    return (
        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded group">
            {/* Popover Logic is handled inside ColorPickerPopover */}
            <ColorPickerPopover
                color={stripe.color}
                onChange={(c) => onChange({ color: c })}
            />

            <select
                value={stripe.widthUnit}
                onChange={(e) => onChange({ widthUnit: parseFloat(e.target.value) })}
                className="flex-1 text-sm border-gray-200 rounded-md py-1.5 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value={0.5}>Ex. Fine (0.25")</option>
                <option value={1}>Fine (0.5")</option>
                <option value={2}>Medium (1.0")</option>
                <option value={3}>Thick (1.5")</option>
                <option value={4}>X-Thick (2.0")</option>
                <option value={5}>XX-Thick (2.5")</option>
                <option value={6}>Wide (3.0")</option>
            </select>

            <button
                onClick={onDuplicate}
                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                title="Duplicate Line"
            >
                <Copy size={16} />
            </button>

            <button
                onClick={onDelete}
                className="text-red-300 hover:text-red-600 transition-colors p-1"
                title="Delete Line"
            >
                <Trash2 size={16} />
            </button>
        </div>
    )
}