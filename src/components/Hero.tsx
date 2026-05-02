import { motion } from "motion/react";
import { ArrowUpRight, Play } from "lucide-react";
import BlurText from "./BlurText";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";
const PARTNERS = ["Stripe", "Vercel", "Linear", "Notion", "Figma"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ height: "1000px" }}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero_bg.jpeg"
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/5 z-0" />

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1]"
        style={{
          height: "300px",
          background: "linear-gradient(to bottom, transparent, black)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{ paddingTop: "150px" }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 liquid-glass rounded-full px-1 py-1 mb-8"
        >
          <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold font-body">
            New
          </span>
          <span className="text-white/80 text-xs font-body pr-2">
            Introducing AI-powered web design.
          </span>
        </motion.div>

        {/* Heading */}
        <BlurText
          text="The Website Your Brand Deserves"
          className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85] max-w-3xl tracking-[-3px] mb-6 justify-center"
          delay={100}
          animateBy="words"
        />

        {/* Subtext */}
        <motion.p
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-sm md:text-base text-white font-body font-light leading-tight max-w-md mb-10"
        >
          Stunning design. Blazing performance. Built by AI, refined by experts.{" "}
          <br className="hidden md:block" />
          This is web design, wildly reimagined.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex items-center gap-4"
        >
          <button className="liquid-glass-strong rounded-full px-5 py-2.5 text-white font-body text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform">
            Get Started
            <ArrowUpRight size={16} />
          </button>
          <button className="flex items-center gap-2 text-white font-body text-sm font-medium hover:opacity-80 transition-opacity">
            <Play size={16} fill="white" />
            Watch the Film
          </button>
        </motion.div>

        {/* Partners bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-auto pt-16 flex flex-col items-center gap-6"
          style={{ marginTop: "80px" }}
        >
          <div className="liquid-glass rounded-full px-4 py-1.5">
            <span className="text-white/50 text-xs font-body">
              Trusted by the teams behind
            </span>
          </div>
          <div className="flex items-center gap-12 md:gap-16 flex-wrap justify-center">
            {PARTNERS.map((name) => (
              <span
                key={name}
                className="text-2xl md:text-3xl font-heading italic text-white/70 hover:text-white transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
