import { useEffect, useRef, useMemo } from 'react';
import { useFabricStore } from '../store/fabricStore';
import { Download } from 'lucide-react';

const PIXELS_PER_UNIT = 20;
const INCHES_PER_UNIT = 0.5;
const CANVAS_HEIGHT = 1920;

export const FabricCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { timeline, textureOpacity } = useFabricStore();

  const noisePattern = useMemo(() => {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 100;
    pCanvas.height = 100;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
        pCtx.fillStyle = 'rgba(255, 255, 255, 0)';
        pCtx.fillRect(0, 0, 100, 100);
        for (let i = 0; i < 4000; i++) {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const opacity = Math.random() * 0.15;
            pCtx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            pCtx.fillRect(x, y, 1, 2);
        }
    }
    return pCanvas;
  }, []);

  const { totalPixelWidth, totalInches } = useMemo(() => {
    let units = 0;
    timeline.forEach(seg => {
      const segUnits = seg.items.reduce((acc, item) => acc + item.widthUnit, 0);
      units += segUnits * seg.repeatCount;
    });
    return {
        totalPixelWidth: units * PIXELS_PER_UNIT,
        totalInches: units * INCHES_PER_UNIT
    };
  }, [timeline]);

  // NEW: Watermarked Export
  const handleDownload = () => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas) return;

    // 1. Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sourceCanvas.width;
    tempCanvas.height = sourceCanvas.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    // 2. Copy the original design
    tCtx.drawImage(sourceCanvas, 0, 0);

    // 3. Add Watermark
    tCtx.save();
    tCtx.translate(tempCanvas.width - 40, tempCanvas.height - 40);
    tCtx.rotate(-Math.PI / 2); // Rotate text to run up the side, or keep flat?
    // Let's keep it flat at bottom right for readability
    tCtx.restore();

    tCtx.font = 'bold 48px sans-serif';
    tCtx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black
    tCtx.textAlign = 'right';
    tCtx.fillText('TCG Fashions', tempCanvas.width - 50, tempCanvas.height - 50);

    tCtx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Slight white highlight for contrast
    tCtx.fillText('TCG Fashions', tempCanvas.width - 52, tempCanvas.height - 52);

    // 4. Download
    const link = document.createElement('a');
    link.download = `TCG-AsoOke-${new Date().toISOString().slice(0,10)}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || totalPixelWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = totalPixelWidth;
    canvas.height = CANVAS_HEIGHT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentX = 0;
    timeline.forEach(segment => {
      for (let i = 0; i < segment.repeatCount; i++) {
        segment.items.forEach(stripe => {
          const stripeWidthPx = stripe.widthUnit * PIXELS_PER_UNIT;
          ctx.fillStyle = stripe.color;
          ctx.fillRect(currentX, 0, stripeWidthPx, CANVAS_HEIGHT);
          currentX += stripeWidthPx;
        });
      }
    });

    if (textureOpacity > 0) {
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = textureOpacity;
        const pattern = ctx.createPattern(noisePattern, 'repeat');
        if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
    }

  }, [timeline, totalPixelWidth, textureOpacity, noisePattern]);

  return (
    <div
      ref={containerRef}
      // NEW: added scroll-smooth
      className="w-full h-full overflow-x-auto overflow-y-hidden bg-stone-200 relative shadow-inner flex flex-col scroll-smooth"
    >
      {timeline.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <p>Canvas Empty. Add a segment.</p>
        </div>
      ) : (
        <>
            <div className="sticky left-0 top-0 w-full p-4 z-20 flex justify-between items-start pointer-events-none">
                <div className="bg-black/75 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full shadow-sm border border-white/10 pointer-events-auto">
                    Width: {totalInches}"
                </div>

                <button
                    onClick={handleDownload}
                    className="bg-white text-gray-900 p-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 pointer-events-auto transition-transform active:scale-95"
                    title="Download Design"
                >
                    <Download size={20} />
                </button>
            </div>

            <canvas
                ref={canvasRef}
                className="h-full block shadow-2xl"
                style={{ width: `${totalPixelWidth}px` }}
            />
        </>
      )}
    </div>
  );
};