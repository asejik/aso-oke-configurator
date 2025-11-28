import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Plus, Copy, ArrowLeftRight } from 'lucide-react';
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
    duplicateStripe,
    duplicateSegment,
    reverseSegment
  } = useFabricStore();

  const handleAddStripe = () => {
    addStripeToSegment(segment.id, { color: '#000000', widthUnit: 2 });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-3 shadow-sm">
      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-t-lg"> {/* Reduced padding p-3 -> p-2.5 */}

        <div
          className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0" // Added min-w-0 for flex shrinking
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}

          {/* Label: Added text-sm and whitespace-nowrap to prevent drop */}
          <span className="font-semibold text-gray-700 text-sm whitespace-nowrap">
            Block {index + 1}
          </span>

          {/* Color Preview: Hidden on very small screens if needed, or just tight */}
          <div className="flex h-3 gap-[1px] ml-1.5">
            {segment.items.slice(0, 5).map((s) => (
              <div key={s.id} className="w-1.5 h-full rounded-full" style={{ background: s.color }} />
            ))}
          </div>
        </div>

        {/* Right Controls: Tighter Gap (gap-3 -> gap-1) */}
        <div className="flex items-center gap-1">

          <button
             onClick={() => reverseSegment(segment.id)}
             className="text-gray-400 hover:text-purple-600 p-1"
             title="Reverse Order"
          >
             <ArrowLeftRight size={16} />
          </button>

          <button
             onClick={() => duplicateSegment(segment.id)}
             className="text-gray-400 hover:text-blue-600 p-1"
             title="Duplicate Block"
          >
             <Copy size={16} />
          </button>

          {/* Repeat Box: Reduced Padding and Size */}
          <div className="flex items-center bg-white border rounded px-1.5 py-0.5">
            <span className="text-[10px] text-gray-500 mr-1">x</span>
            <input
              type="number"
              min="1"
              max="99"
              value={segment.repeatCount}
              onChange={(e) => updateSegmentRepeat(segment.id, parseInt(e.target.value) || 1)}
              // Width reduced w-8 -> w-5, Text reduced text-sm -> text-xs
              className="w-5 text-center text-xs font-medium outline-none"
            />
          </div>

          <button
            onClick={() => deleteSegment(segment.id)}
            className="text-gray-400 hover:text-red-500 p-1"
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