import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useFabricStore } from '../store/fabricStore';

interface Props {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPickerPopover = ({ color, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const { recentColors, addRecentColor } = useFabricStore();

  const handleToggle = () => {
    if (isOpen) {
        // Closing: Save color
        addRecentColor(color);
        setIsOpen(false);
    } else {
        // Opening: Calculate position
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top - 120,
                left: rect.right + 15
            });
        }
        setIsOpen(true);
    }
  };

  useEffect(() => {
    // Handle both Mouse and Touch events
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
            addRecentColor(color); // Save to recent on outside click
            setIsOpen(false);
        }
      }
    };

    if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside); // FIX: Mobile support
    }
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, color, addRecentColor]);

  return (
    <>
      <div
        ref={triggerRef}
        className="w-8 h-8 rounded-full shadow-sm border border-gray-300 cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
        style={{ backgroundColor: color }}
        onClick={handleToggle}
      />

      {isOpen && (
        <div
            ref={popoverRef}
            className="fixed z-[9999] animate-in fade-in zoom-in duration-200"
            style={{ top: coords.top, left: coords.left }}
        >
          <div className="bg-white p-3 rounded-xl shadow-2xl border border-gray-200 w-[200px]">

             {/* Recent Colors Row */}
             <div className="mb-2">
                <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Recent</p>
                <div className="flex flex-wrap gap-1.5">
                    {recentColors.map((rc, idx) => (
                        <div
                            key={idx}
                            className="w-5 h-5 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: rc }}
                            onClick={() => onChange(rc)}
                        />
                    ))}
                </div>
             </div>

             <HexColorPicker color={color} onChange={onChange} />

             <div className="mt-2 flex gap-2">
                <div className="flex-1 bg-gray-100 rounded px-2 py-1 text-xs text-gray-600 font-mono text-center">
                    {color.toUpperCase()}
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
};