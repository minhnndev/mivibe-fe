type NavbarItem = {
  id: string;
  label: string;
};

type NavbarProps = {
  items: NavbarItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

export default function Navbar({ items, activeId, onSelect }: NavbarProps) {
  return (
    <>
      {/* Logo (top-left) */}
      <div className="absolute left-6 top-6 z-50 hidden md:flex">
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shrink-0">
            <span className="text-black font-heading italic text-base font-bold">
              M
            </span>
          </div>
          <div className="flex flex-col">
            <h2 className="font-heading italic text-white text-base">
              Mivibe
            </h2>
            <span className="text-white/40 text-xs font-body">
              Filters & LUTs
            </span>
          </div>
        </div>
      </div>

      {/* Section selector (left side) */}
      <aside
        className="absolute left-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col"
        aria-label="Sections"
      >
        <div className="p-2 flex flex-col gap-2">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`${isActive ? "liquid-glass-strong" : "liquid-glass"} rounded-full px-4 py-2 text-left text-sm font-body text-white/90 hover:text-white transition-colors`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
