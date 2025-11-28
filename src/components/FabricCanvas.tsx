import { useEffect, useRef, useMemo } from 'react';
import { useFabricStore } from '../store/fabricStore';
import { Download, Share2 } from 'lucide-react'; // Added Share2

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

  // Shared Logic for generating the final blob
  const generateBlob = async (callback: (blob: Blob | null) => void) => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sourceCanvas.width;
    tempCanvas.height = sourceCanvas.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    tCtx.drawImage(sourceCanvas, 0, 0);

    tCtx.save();
    tCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);

    const fontSize = Math.max(20, Math.floor(tempCanvas.width / 10));
    tCtx.font = `bold ${fontSize}px sans-serif`;
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    tCtx.fillText('TCG Fashions', 0, 0);
    tCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    tCtx.lineWidth = Math.max(1, fontSize / 40);
    tCtx.strokeText('TCG Fashions', 0, 0);
    tCtx.restore();

    tempCanvas.toBlob(callback, 'image/png');
  };

  const handleDownload = () => {
    generateBlob((blob) => {
        if (!blob) return;
        const now = new Date();
        const dateStr = now.toISOString().slice(0,10);
        const timeStr = now.toTimeString().slice(0,8).replace(/:/g, '');
        const link = document.createElement('a');
        link.download = `TCG-AsoOke-${dateStr}-${timeStr}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
    });
  };

  const handleShare = () => {
    generateBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'aso-oke-design.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'My Aso Oke Design',
                    text: 'Check out this fabric design I created with TCG Fashions!',
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            alert('Sharing not supported on this device. Please download instead.');
        }
    });
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
    // FIT WIDTH UPDATE: Removed overflow-x-auto, added w-full, flex justify-center
    <div
      ref={containerRef}
      className="w-full h-full bg-stone-200 relative shadow-inner flex flex-col items-center overflow-y-hidden"
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

                <div className="flex gap-2 pointer-events-auto">
                    {/* Share Button */}
                    <button
                        onClick={handleShare}
                        className="bg-white text-gray-900 p-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-transform active:scale-95"
                        title="Share Design"
                    >
                        <Share2 size={20} />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="bg-white text-gray-900 p-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-transform active:scale-95"
                        title="Download Design"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Canvas fits width (100%) and height auto */}
            <canvas
                ref={canvasRef}
                className="block shadow-2xl origin-top"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill' // Ensures it stretches to fill height if needed, or 'contain'
                }}
            />
        </>
      )}
    </div>
  );
};