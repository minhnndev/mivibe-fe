import { ArrowUpRight } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
          <span className="text-black font-heading italic text-sm font-bold">
            S
          </span>
        </div>
        <span className="font-heading italic text-white text-lg hidden sm:block">
          Studio
        </span>
      </div>

      {/* Center Nav */}
      <div className="hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1 gap-1">
        {["Home", "Services", "Work", "Process", "Pricing"]
          .slice(0, 4)
          .map((link) => (
            <a
              key={link}
              href="#"
              className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors"
            >
              {link}
            </a>
          ))}
        <a
          href="#"
          className="flex items-center gap-1 bg-white text-black rounded-full px-3.5 py-1.5 text-sm font-body font-medium hover:bg-white/90 transition-colors"
        >
          Get Started
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* Mobile CTA */}
      <a
        href="#"
        className="md:hidden flex items-center gap-1 liquid-glass-strong rounded-full px-4 py-2 text-sm font-body text-white"
      >
        Get Started
        <ArrowUpRight size={14} />
      </a>
    </nav>
  );
}
