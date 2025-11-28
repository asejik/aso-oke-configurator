import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

interface Props {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPickerPopover = ({ color, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popover.current && !popover.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div
        className="w-8 h-8 rounded-full shadow-sm border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
        style={{ backgroundColor: color }}
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="absolute top-10 left-0 z-50 animate-in fade-in zoom-in duration-200" ref={popover}>
          <div className="bg-white p-3 rounded-xl shadow-2xl border border-gray-200">
             <HexColorPicker color={color} onChange={onChange} />
             <div className="mt-2 flex gap-2">
                <div className="flex-1 bg-gray-100 rounded px-2 py-1 text-xs text-gray-600 font-mono text-center">
                    {color.toUpperCase()}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};