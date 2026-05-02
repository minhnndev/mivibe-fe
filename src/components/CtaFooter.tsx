import { ArrowUpRight } from 'lucide-react'
import HLSVideo from './HLSVideo'
import BlurText from './BlurText'
import { motion } from 'motion/react'

const VIDEO_SRC =
  'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8'

export default function CtaFooter() {
  return (
    <section className="relative overflow-hidden">
      <HLSVideo src={VIDEO_SRC} className="absolute inset-0 w-full h-full object-cover" />

      {/* Top fade */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-[1]"
        style={{
          height: '200px',
          background: 'linear-gradient(to bottom, black, transparent)',
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1]"
        style={{
          height: '200px',
          background: 'linear-gradient(to top, black, transparent)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-40 gap-8">
        <BlurText
          text="Your next website starts here."
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
          Book a free strategy call. See what AI-powered design can do. No commitment, no pressure. Just possibilities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          <button className="liquid-glass-strong rounded-full px-6 py-3 text-white font-body text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform">
            Book a Call
            <ArrowUpRight size={16} />
          </button>
          <button className="bg-white text-black rounded-full px-6 py-3 font-body text-sm font-medium hover:bg-white/90 transition-colors">
            View Pricing
          </button>
        </motion.div>

        {/* Footer bar */}
        <div className="mt-32 pt-8 border-t border-white/10 w-full max-w-6xl flex items-center justify-between flex-wrap gap-4">
          <span className="text-white/40 text-xs font-body">© 2026 Studio. All rights reserved.</span>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map((link) => (
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
  )
}
