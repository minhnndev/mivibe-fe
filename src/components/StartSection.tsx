import { ArrowUpRight } from "lucide-react";
import HLSVideo from "./HLSVideo";
import BlurText from "./BlurText";

const VIDEO_SRC =
  "https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8";

type StartSectionProps = {
  asSlide?: boolean;
};

export default function StartSection({ asSlide = false }: StartSectionProps) {
  return (
    <section
      className="relative overflow-hidden h-full"
      style={asSlide ? undefined : { minHeight: "700px" }}
    >
      {/* HLS Video Background */}
      {!asSlide ? (
        <HLSVideo
          src={VIDEO_SRC}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 gap-6"
        style={
          asSlide
            ? { height: "100%" }
            : { minHeight: "700px", paddingTop: "8rem", paddingBottom: "8rem" }
        }
      >
        <div className="liquid-glass rounded-full px-3.5 py-1">
          <span className="text-white text-xs font-medium font-body">
            Workflow
          </span>
        </div>

        <BlurText
          text="Pick a look. Dial it in. Export."
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic tracking-tight leading-[0.9] text-white justify-center"
          delay={120}
        />

        <p className="text-white/60 font-body font-light text-sm md:text-base max-w-md leading-relaxed">
          Browse LUTs and filters, fine-tune intensity and warmth, then export a
          consistent look for your feed, client work, or your next drop.
        </p>

        <button className="liquid-glass-strong rounded-full px-6 py-3 text-white font-body text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform">
          Try the editor
          <ArrowUpRight size={16} />
        </button>
      </div>
    </section>
  );
}
