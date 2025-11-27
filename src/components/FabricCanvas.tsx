import { useEffect, useRef, useMemo } from 'react';
import { useFabricStore } from '../store/fabricStore';
import { Download } from 'lucide-react';

const PIXELS_PER_UNIT = 20;
const INCHES_PER_UNIT = 0.5;
const CANVAS_HEIGHT = 1920;

export const FabricCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { timeline, textureOpacity, loomWidth } = useFabricStore();

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

  const handleDownload = () => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sourceCanvas.width;
    tempCanvas.height = sourceCanvas.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    tCtx.drawImage(sourceCanvas, 0, 0);

    // Watermark Logic
    tCtx.save();
    tCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);

    // 1. Define the text
    const text = "TCG Fashions";

    // 2. Measure & Scale Logic (Fit to 80% of Width)
    // We start with a base font to measure ratio, then scale up/down
    tCtx.font = "bold 100px sans-serif";
    const measured = tCtx.measureText(text);
    const textWidth = measured.width;

    // Calculate exact scale to fill 80% of the canvas width
    const targetWidth = tempCanvas.width * 0.8;
    const scaleFactor = targetWidth / textWidth;
    const finalFontSize = Math.floor(100 * scaleFactor);

    // 3. Apply Styling
    tCtx.font = `bold ${finalFontSize}px sans-serif`;
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';

    // Fill: 15% Black (Slightly darker than before)
    tCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    tCtx.fillText(text, 0, 0);

    // Stroke: 50% White (Stronger contrast for visibility)
    tCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    tCtx.lineWidth = Math.max(2, finalFontSize / 30); // Thicker stroke
    tCtx.strokeText(text, 0, 0);

    tCtx.restore();

    // Timestamp Filename
    const now = new Date();
    const dateStr = now.toISOString().slice(0,10);
    const timeStr = now.toTimeString().slice(0,8).replace(/:/g, '');

    const link = document.createElement('a');
    link.download = `TCG-AsoOke-${dateStr}-${timeStr}.png`;
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
      className="w-full h-full overflow-x-auto overflow-y-hidden bg-stone-200 relative shadow-inner flex flex-col scroll-smooth"
    >
      {timeline.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <p>Canvas Empty. Add a segment.</p>
        </div>
      ) : (
        <>
            <div className="sticky left-0 top-0 w-full p-4 z-20 flex justify-between items-start pointer-events-none">
                <div className="bg-black/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full shadow-lg border border-white/10 pointer-events-auto font-mono">
                    Width: {totalInches}" / {loomWidth}"
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