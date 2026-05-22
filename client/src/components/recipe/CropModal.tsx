import { useRef, useState, useEffect, useCallback } from 'react';

interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

type HandleType = 'move' | 'nw' | 'ne' | 'sw' | 'se';

interface DragState {
  handle: HandleType;
  startX: number;
  startY: number;
  startCrop: Crop;
}

const MIN_SIZE = 40;

export default function CropModal({
  src,
  onApply,
  onCancel,
}: {
  src: string;
  onApply: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [imgRect, setImgRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [crop, setCrop] = useState<Crop | null>(null);

  function computeLayout() {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    const scale = Math.min(cw / nw, ch / nh);
    const rw = nw * scale;
    const rh = nh * scale;
    const rect = { x: (cw - rw) / 2, y: (ch - rh) / 2, w: rw, h: rh };

    setImgRect(rect);
    setCrop({ ...rect });
  }

  function clampCrop(c: Crop, r: NonNullable<typeof imgRect>): Crop {
    let { x, y, w, h } = c;
    w = Math.max(MIN_SIZE, w);
    h = Math.max(MIN_SIZE, h);
    x = Math.max(r.x, x);
    y = Math.max(r.y, y);
    if (x + w > r.x + r.w) {
      w = r.x + r.w - x;
      if (w < MIN_SIZE) { w = MIN_SIZE; x = r.x + r.w - w; }
    }
    if (y + h > r.y + r.h) {
      h = r.y + r.h - y;
      if (h < MIN_SIZE) { h = MIN_SIZE; y = r.y + r.h - h; }
    }
    return { x, y, w, h };
  }

  const onPointerMove = useCallback(
    (clientX: number, clientY: number) => {
      const drag = dragRef.current;
      if (!drag || !imgRect || !containerRef.current) return;

      const cr = containerRef.current.getBoundingClientRect();
      const dx = clientX - cr.left - drag.startX;
      const dy = clientY - cr.top - drag.startY;
      const sc = drag.startCrop;

      let nc: Crop;
      switch (drag.handle) {
        case 'move': nc = { x: sc.x + dx, y: sc.y + dy, w: sc.w,      h: sc.h      }; break;
        case 'nw':   nc = { x: sc.x + dx, y: sc.y + dy, w: sc.w - dx, h: sc.h - dy }; break;
        case 'ne':   nc = { x: sc.x,      y: sc.y + dy, w: sc.w + dx, h: sc.h - dy }; break;
        case 'sw':   nc = { x: sc.x + dx, y: sc.y,      w: sc.w - dx, h: sc.h + dy }; break;
        case 'se':   nc = { x: sc.x,      y: sc.y,      w: sc.w + dx, h: sc.h + dy }; break;
      }

      setCrop(clampCrop(nc, imgRect));
    },
    [imgRect]
  );

  const onPointerEnd = useCallback(() => { dragRef.current = null; }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (dragRef.current && e.touches.length > 0) {
        e.preventDefault();
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onPointerEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onPointerEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onPointerEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onPointerEnd);
    };
  }, [onPointerMove, onPointerEnd]);

  function startDrag(handle: HandleType, e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation();
    e.preventDefault();
    const cr = containerRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      handle,
      startX: clientX - cr.left,
      startY: clientY - cr.top,
      startCrop: crop!,
    };
  }

  function handleApply() {
    if (!crop || !imgRect || !imgRef.current) return;
    const img = imgRef.current;
    const scaleX = img.naturalWidth / imgRect.w;
    const scaleY = img.naturalHeight / imgRect.h;
    const sx = Math.round((crop.x - imgRect.x) * scaleX);
    const sy = Math.round((crop.y - imgRect.y) * scaleY);
    const sw = Math.round(crop.w * scaleX);
    const sh = Math.round(crop.h * scaleY);

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    canvas.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    canvas.toBlob((blob) => { if (blob) onApply(blob); }, 'image/jpeg', 0.92);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">Crop photo</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-text/60 hover:text-text transition-colors px-2 py-1 rounded-lg hover:bg-black/5"
          >
            Cancel
          </button>
        </div>

        {/* Image / crop area */}
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-xl bg-black/10 select-none touch-none"
          style={{ height: 400 }}
        >
          <img
            ref={imgRef}
            src={src}
            onLoad={computeLayout}
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            alt="Crop preview"
          />

          {crop && imgRect && (
            <>
              {/* Dark overlays outside crop area */}
              <div className="absolute bg-black/50 pointer-events-none" style={{ left: 0, top: 0, right: 0, height: crop.y }} />
              <div className="absolute bg-black/50 pointer-events-none" style={{ left: 0, top: crop.y + crop.h, right: 0, bottom: 0 }} />
              <div className="absolute bg-black/50 pointer-events-none" style={{ left: 0, top: crop.y, width: crop.x, height: crop.h }} />
              <div className="absolute bg-black/50 pointer-events-none" style={{ left: crop.x + crop.w, top: crop.y, right: 0, height: crop.h }} />

              {/* Crop box */}
              <div
                className="absolute border-2 border-white cursor-move"
                style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
                onMouseDown={(e) => startDrag('move', e)}
                onTouchStart={(e) => startDrag('move', e)}
              >
                {/* Rule-of-thirds grid */}
                <div className="absolute inset-0 pointer-events-none">
                  {[1, 2].map((i) => (
                    <div key={`v${i}`} className="absolute top-0 bottom-0 border-l border-white/30" style={{ left: `${(i / 3) * 100}%` }} />
                  ))}
                  {[1, 2].map((i) => (
                    <div key={`h${i}`} className="absolute left-0 right-0 border-t border-white/30" style={{ top: `${(i / 3) * 100}%` }} />
                  ))}
                </div>

                {/* Corner handles */}
                {(['nw', 'ne', 'sw', 'se'] as const).map((hnd) => (
                  <div
                    key={hnd}
                    className={`absolute w-4 h-4 bg-white rounded-sm shadow ${
                      hnd === 'nw' ? '-top-2 -left-2 cursor-nw-resize' :
                      hnd === 'ne' ? '-top-2 -right-2 cursor-ne-resize' :
                      hnd === 'sw' ? '-bottom-2 -left-2 cursor-sw-resize' :
                                     '-bottom-2 -right-2 cursor-se-resize'
                    }`}
                    onMouseDown={(e) => startDrag(hnd, e)}
                    onTouchStart={(e) => startDrag(hnd, e)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Apply button */}
        <button
          type="button"
          onClick={handleApply}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Apply crop
        </button>
      </div>
    </div>
  );
}
