import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

interface Props {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPickerPopover = ({ color, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Handle Opening: Calculate position based on the trigger element
  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        // FIX 2: Position to the RIGHT (rect.right + 10px)
        // Use 'fixed' positioning coordinates
        setCoords({
            top: rect.top - 100, // Move up slightly to center it vertically relative to row
            left: rect.right + 15
        });
    }
    setIsOpen(!isOpen);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is inside trigger OR inside popover
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Only add listener if open
    if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <div
        ref={triggerRef}
        className="w-8 h-8 rounded-full shadow-sm border border-gray-300 cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
        style={{ backgroundColor: color }}
        onClick={handleToggle}
      />

      {isOpen && (
        // FIX 2: Use 'fixed' positioning to escape overflow containers
        // Added z-[9999] to ensure it sits on top of everything
        <div
            ref={popoverRef}
            className="fixed z-[9999] animate-in fade-in zoom-in duration-200"
            style={{ top: coords.top, left: coords.left }}
        >
          <div className="bg-white p-3 rounded-xl shadow-2xl border border-gray-200 w-[200px]">
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