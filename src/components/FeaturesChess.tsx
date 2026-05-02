import { ArrowUpRight } from "lucide-react";
import BlurText from "./BlurText";
import { motion } from "motion/react";

type GifPlaceholderProps = {
  label: string;
  reverse?: boolean;
};

// Placeholder for GIF - using gradient placeholders since external GIFs are blocked
function GifPlaceholder({ label }: GifPlaceholderProps) {
  return (
    <div
      className="liquid-glass rounded-2xl overflow-hidden aspect-video w-full flex items-end justify-start p-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 100%)",
        minHeight: "300px",
      }}
    >
      <div className="text-white/20 font-body text-xs uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}

const rows = [
  {
    title: "Designed to convert. Built to perform.",
    body: "Every pixel is intentional. Our AI studies what works across thousands of top sites—then builds yours to outperform them all.",
    cta: "Learn more",
    gif: "feature-1",
    reverse: false,
  },
  {
    title: "It gets smarter. Automatically.",
    body: "Your site evolves on its own. AI monitors every click, scroll, and conversion—then optimizes in real time. No manual updates. Ever.",
    cta: "See how it works",
    gif: "feature-2",
    reverse: true,
  },
];

export default function FeaturesChess() {
  return (
    <section className="py-32 px-6 md:px-16">
      {/* Section header */}
      <div className="flex flex-col items-center text-center mb-20 gap-4">
        <div className="liquid-glass rounded-full px-3.5 py-1">
          <span className="text-white text-xs font-medium font-body">
            Capabilities
          </span>
        </div>
        <BlurText
          text="Pro features. Zero complexity."
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9] justify-center"
          delay={100}
        />
      </div>

      <div className="flex flex-col gap-24 max-w-6xl mx-auto">
        {rows.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className={`flex flex-col ${row.reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12`}
          >
            {/* Text */}
            <div className="flex-1 flex flex-col gap-6">
              <h3 className="text-3xl md:text-4xl font-heading italic text-white leading-tight">
                {row.title}
              </h3>
              <p className="text-white/60 font-body font-light text-sm md:text-base leading-relaxed">
                {row.body}
              </p>
              <button className="liquid-glass-strong rounded-full px-5 py-2.5 text-white font-body text-sm font-medium flex items-center gap-2 w-fit hover:scale-105 transition-transform">
                {row.cta}
                <ArrowUpRight size={16} />
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 w-full">
              <GifPlaceholder
                label={`Feature ${i + 1} preview`}
                reverse={row.reverse}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
