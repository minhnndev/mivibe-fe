import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

type HLSVideoProps = {
  src: string;
  className?: string;
  style?: CSSProperties;
  desaturate?: boolean;
};

export default function HLSVideo({
  src,
  className = "",
  style = {},
  desaturate = false,
}: HLSVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loadVideo = async () => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          return () => hls.destroy();
        }
      }
    };

    void loadVideo();
  }, [src]);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className={className}
      style={{ ...style, ...(desaturate ? { filter: "saturate(0)" } : {}) }}
    />
  );
}
