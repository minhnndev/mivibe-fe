import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import BlurText from "./BlurText";
import HLSVideo from "./HLSVideo";

type CtaFooterProps = {
  asSlide?: boolean;
};

const VIDEO_SRC =
  "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

export default function CtaFooter({ asSlide = false }: CtaFooterProps) {
  return (
    <section className={`relative overflow-hidden ${asSlide ? "h-full" : ""}`}>
      {!asSlide ? (
        <HLSVideo
          src={VIDEO_SRC}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6 gap-8"
        style={
          asSlide
            ? { height: "100%", justifyContent: "center" }
            : { paddingTop: "10rem", paddingBottom: "10rem" }
        }
      >
        <BlurText
          text="Start grading your photos today."
          className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white leading-[0.85] max-w-2xl justify-center"
          delay={100}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-white/60 font-body font-light text-sm md:text-base max-w-md leading-relaxed"
        >
          Explore a curated library of LUTs and filters, fine-tune your look,
          and export consistent results you’ll love.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          <button className="liquid-glass-strong rounded-full px-6 py-3 text-white font-body text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform">
            Get the app
            <ArrowUpRight size={16} />
          </button>
          <button className="bg-white text-black rounded-full px-6 py-3 font-body text-sm font-medium hover:bg-white/90 transition-colors">
            Browse presets
          </button>
        </motion.div>

        {/* Footer bar */}
        <div
          className={`pt-8 border-t border-white/10 w-full max-w-6xl flex items-center justify-between flex-wrap gap-4 ${
            asSlide ? "mt-16" : "mt-32"
          }`}
        >
          <span className="text-white/40 text-xs font-body">
            © 2026 Mivibe. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-white/40 text-xs font-body hover:text-white/70 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
