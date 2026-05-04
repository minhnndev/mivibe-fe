import { Image, Upload } from "lucide-react";
import type { ChangeEvent, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_IMAGES } from "../constants";
import type { AdminTheme } from "../types";

type PreviewImageSelectorProps = {
  customImage: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  lutCount: number;
  previewImage: string;
  theme: AdminTheme;
  onCustomImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onPreviewImageChange: (url: string) => void;
};

export default function PreviewImageSelector({
  customImage,
  fileInputRef,
  lutCount,
  previewImage,
  theme,
  onCustomImageUpload,
  onPreviewImageChange,
}: PreviewImageSelectorProps) {
  const isLight = theme === "light";
  const inactiveClass = isLight
    ? "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-950"
    : "text-white/30 hover:bg-white/5 hover:text-white";
  const activeClass = isLight
    ? "bg-neutral-200 text-neutral-950"
    : "bg-white/15 text-white";

  return (
    <div
      className={`flex items-center gap-2 px-5 py-2.5 shrink-0 ${
        isLight
          ? "border-b border-neutral-200 bg-neutral-50"
          : "border-b border-white/5 bg-white/[0.02]"
      }`}
    >
      <Image size={13} className={isLight ? "text-neutral-400" : "text-white/30"} />
      <span className={isLight ? "text-neutral-500 text-xs" : "text-white/30 text-xs"}>
        Preview with:
      </span>
      {DEFAULT_IMAGES.map((img) => (
        <Button
          key={img.label}
          variant="ghost"
          size="xs"
          onClick={() => onPreviewImageChange(img.url)}
          className={`rounded-full px-2.5 py-1 ${
            previewImage === img.url && !customImage ? activeClass : inactiveClass
          }`}
        >
          {img.label}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="xs"
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-full px-2.5 py-1 ${customImage ? activeClass : inactiveClass}`}
      >
        <Upload size={11} /> Custom
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onCustomImageUpload}
      />
      <span className={isLight ? "text-neutral-400 text-xs ml-auto" : "text-white/20 text-xs ml-auto"}>
        {lutCount} LUTs
      </span>
    </div>
  );
}
