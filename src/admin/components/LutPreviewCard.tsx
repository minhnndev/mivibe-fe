import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { renderLutPreview } from "../lutEngine";
import type { Lut } from "../types";

// Default preview images (royalty-free Unsplash photos)
const DEFAULT_PREVIEW_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4", // landscape
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04", // portrait
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429", // urban
];

type LutPreviewCardProps = {
  lut: Lut;
  previewImage?: string;
  onClick?: () => void;
  selected?: boolean;
  showBadge?: boolean;
  theme?: "dark" | "light";
};

export default function LutPreviewCard({
  lut,
  previewImage,
  onClick,
  selected = false,
  showBadge = true,
  theme = "dark",
}: LutPreviewCardProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [largePreview, setLargePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [largeLoading, setLargeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);
  const compareAreaRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef(false);
  const isLight = theme === "light";

  const updateComparePosition = (clientX: number) => {
    const rect = compareAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setComparePosition(Math.min(100, Math.max(0, next)));
  };

  const imgUrl = previewImage || DEFAULT_PREVIEW_IMAGES[0]!;
  const lutUrl = lut.storage_key || lut.filename;

  useEffect(() => {
    abortRef.current = false;
    setLoading(true);
    setError(null);
    setPreview(null);

    renderLutPreview(imgUrl, lutUrl, lut.intensity || 1.0, 300)
      .then((dataUrl) => {
        if (!abortRef.current) {
          setPreview(dataUrl);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!abortRef.current) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      abortRef.current = true;
    };
  }, [imgUrl, lutUrl, lut.intensity]);

  useEffect(() => {
    let cancelled = false;
    if (!showCompare) return;

    setLargeLoading(true);
    setLargePreview(null);
    renderLutPreview(imgUrl, lutUrl, lut.intensity || 1.0, 1100)
      .then((dataUrl) => {
        if (!cancelled) setLargePreview(dataUrl);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) setLargeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showCompare, imgUrl, lutUrl, lut.intensity]);

  return (
    <>
      <Card
        onClick={onClick}
        className={`group relative cursor-pointer overflow-hidden p-0 transition-all duration-200 ${
          selected ? "ring-2 ring-white scale-[1.02]" : "hover:scale-[1.02]"
        } ${
          isLight
            ? "border border-neutral-200 bg-white text-neutral-950 shadow-sm"
            : "border-0 bg-[#111] text-white"
        }`}
      >
        {/* Preview Image */}
        <Button
          type="button"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setShowCompare(true);
          }}
          className="relative block h-auto w-full overflow-hidden rounded-none p-0 text-left hover:bg-transparent"
        >
          <span className="block aspect-[4/3] w-full">
            {loading && (
              <div
                className={`absolute inset-0 flex items-center justify-center ${
                  isLight ? "bg-neutral-100" : "bg-white/5"
                }`}
              >
                <div
                  className={`w-6 h-6 animate-spin rounded-full border-2 ${
                    isLight
                      ? "border-neutral-300 border-t-neutral-900"
                      : "border-white/20 border-t-white/80"
                  }`}
                />
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 text-red-400 text-xs p-2 text-center">
                <span className="text-lg mb-1">⚠</span>
                Failed to render
              </div>
            )}
            {preview && (
              <img
                src={preview}
                alt={lut.name}
                className="w-full h-full object-cover"
              />
            )}
            <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white/60 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              Click to compare
            </span>
            {!lut.is_active && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge className="border-white/20 bg-transparent px-2 py-0.5 text-xs text-white/60 hover:bg-transparent">
                  Inactive
                </Badge>
              </div>
            )}
          </span>
        </Button>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p
                className={`text-sm font-body font-medium leading-tight ${
                  isLight ? "text-neutral-950" : "text-white"
                }`}
              >
                {lut.name}
              </p>
              <p
                className={`text-xs font-body mt-0.5 ${
                  isLight ? "text-neutral-500" : "text-white/40"
                }`}
              >
                {lut.filename}
              </p>
            </div>
            {showBadge && lut.is_free && (
              <Badge className="shrink-0 border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 hover:bg-emerald-500/20">
                Free
              </Badge>
            )}
          </div>
          {lut.tags?.length ? (
            <div className="flex flex-wrap gap-1 mt-2">
              {lut.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={`text-[10px] font-body ${
                    isLight ? "text-neutral-400" : "text-white/30"
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
      {showCompare && (
        <Dialog open onOpenChange={setShowCompare}>
          <DialogContent
            className={`z-[120] max-w-7xl gap-0 overflow-hidden p-0 shadow-2xl sm:max-w-7xl ${
              isLight
                ? "border-neutral-200 bg-white text-neutral-950"
                : "border-white/10 bg-[#0d0d0d] text-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader
              className={`flex-row items-center justify-between px-4 py-3 ${
                isLight ? "border-b border-neutral-200" : "border-b border-white/10"
              }`}
            >
              <div className="min-w-0">
                <DialogTitle
                  className={`truncate text-sm font-medium ${
                    isLight ? "text-neutral-950" : "text-white"
                  }`}
                >
                  {lut.name}
                </DialogTitle>
                <p
                  className={`truncate text-xs ${
                    isLight ? "text-neutral-500" : "text-white/35"
                  }`}
                >
                  Drag slider to compare original and LUT
                </p>
              </div>
            </DialogHeader>

            <div className="relative bg-black">
              <div
                ref={compareAreaRef}
                className="relative mx-auto aspect-[16/9] max-h-[82vh] overflow-hidden select-none touch-none"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  updateComparePosition(e.clientX);
                }}
                onPointerMove={(e) => {
                  if (e.buttons !== 1) return;
                  e.preventDefault();
                  updateComparePosition(e.clientX);
                }}
              >
                <img
                  src={largePreview || imgUrl}
                  alt={`${lut.name} applied`}
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
                />
                <img
                  src={imgUrl}
                  alt="Original sample"
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
                  style={{
                    clipPath: `inset(0 ${100 - comparePosition}% 0 0)`,
                  }}
                />
                {(largeLoading || !largePreview) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                  </div>
                )}
                <div
                  className="pointer-events-none absolute top-0 h-full w-px -translate-x-1/2 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                  style={{
                    left: `clamp(18px, ${comparePosition}%, calc(100% - 18px))`,
                  }}
                >
                  <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/70 backdrop-blur">
                    <div className="h-3 w-px bg-white/80" />
                  </div>
                </div>
                <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white/70 backdrop-blur">
                  Original
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white/70 backdrop-blur">
                  LUT
                </div>
              </div>
              <Slider
                min={0}
                max={100}
                value={[comparePosition]}
                onValueChange={([value]) => setComparePosition(value ?? 50)}
                className="absolute inset-x-4 bottom-4 w-auto opacity-0"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
