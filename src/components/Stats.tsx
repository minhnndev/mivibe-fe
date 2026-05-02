import HLSVideo from "./HLSVideo";
import { motion } from "motion/react";

const VIDEO_SRC =
  "https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8";

const stats = [
  { value: "150+", label: "LUTs & presets" },
  { value: "1-tap", label: "Filter application" },
  { value: "Free", label: "Edits" },
  { value: "Export", label: "Results" },
];

type StatsProps = {
  asSlide?: boolean;
};

export default function Stats({ asSlide = false }: StatsProps) {
  return (
    <section
      className={`relative overflow-hidden ${asSlide ? "h-full" : "py-32"}`}
    >
      {!asSlide ? (
        <HLSVideo
          src={VIDEO_SRC}
          className="absolute inset-0 w-full h-full object-cover"
          desaturate
        />
      ) : null}

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center px-6 md:px-16 h-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="liquid-glass rounded-3xl p-12 md:p-16 w-full max-w-5xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col gap-2">
                <span className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white">
                  {s.value}
                </span>
                <span className="text-white/60 font-body font-light text-sm">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
