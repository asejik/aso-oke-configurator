import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Plus } from 'lucide-react';
import type { Segment, Stripe } from '../types';
import { useFabricStore } from '../store/fabricStore';
import clsx from 'clsx';

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
    deleteStripeFromSegment
  } = useFabricStore();

  const handleAddStripe = () => {
    addStripeToSegment(segment.id, { color: '#000000', widthUnit: 2 });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-3 shadow-sm overflow-hidden">
      {/* HEADER: Summary & Repeat Controls */}
      <div className="flex items-center justify-between p-3 bg-gray-50">
        <div
          className="flex items-center gap-2 cursor-pointer flex-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <span className="font-semibold text-gray-700">Block {index + 1}</span>

          {/* Mini Color Preview */}
          <div className="flex h-4 gap-[1px] ml-2">
            {segment.items.slice(0, 5).map((s) => (
              <div key={s.id} className="w-2 h-full rounded-full" style={{ background: s.color }} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
            {/* Repeat Logic [FN-08] */}
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

      {/* BODY: Stripe Editor (Accordion) */}
      {isExpanded && (
        <div className="p-3 border-t bg-white">
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

// Sub-component for individual stripe row
const StripeRow = ({ stripe, onChange, onDelete }: {
    stripe: Stripe,
    onChange: (u: Partial<Stripe>) => void,
    onDelete: () => void
}) => {
    return (
        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded group">
            {/* Color Picker [FN-07] */}
            <div className="relative overflow-hidden w-8 h-8 rounded-full shadow-sm border border-gray-200">
                <input
                    type="color"
                    value={stripe.color}
                    onChange={(e) => onChange({ color: e.target.value })}
                    className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0"
                />
            </div>

            {/* Width Selector [FN-07] */}
            <select
                value={stripe.widthUnit}
                onChange={(e) => onChange({ widthUnit: parseInt(e.target.value) })}
                className="flex-1 text-sm border-gray-200 rounded-md py-1.5 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value={1}>Fine (0.5")</option>
                <option value={2}>Medium (1.0")</option>
                <option value={3}>Thick (1.5")</option>
                <option value={6}>Wide (3.0")</option>
            </select>

            <button onClick={onDelete} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={14} />
            </button>
        </div>
    )
}