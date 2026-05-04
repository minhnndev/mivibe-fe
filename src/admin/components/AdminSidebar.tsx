import { Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { NAV_ITEMS } from "../constants";
import { isConfigured } from "../supabase";
import type { ActiveTab, AdminTheme } from "../types";

type AdminSidebarProps = {
  activeTab: ActiveTab;
  activeLuts: number;
  categoryCount: number;
  lutCount: number;
  theme: AdminTheme;
  onTabChange: (tab: ActiveTab) => void;
  onThemeChange: (theme: AdminTheme) => void;
};

export default function AdminSidebar({
  activeTab,
  activeLuts,
  categoryCount,
  lutCount,
  theme,
  onTabChange,
  onThemeChange,
}: AdminSidebarProps) {
  const isLight = theme === "light";

  const getCount = (tab: ActiveTab) => {
    if (tab === "luts") return lutCount;
    if (tab === "categories") return categoryCount;
    return undefined;
  };

  return (
    <div
      className={`fixed left-0 top-0 bottom-0 w-64 flex flex-col z-20 transition-colors ${
        isLight
          ? "border-r border-neutral-200 bg-white"
          : "border-r border-white/5 bg-[#0d0d0d]"
      }`}
    >
      <div
        className={`p-6 ${
          isLight ? "border-b border-neutral-200" : "border-b border-white/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              isLight ? "bg-black" : "bg-white"
            }`}
          >
            <span
              className={`font-heading italic text-sm font-bold ${
                isLight ? "text-white" : "text-black"
              }`}
            >
              S
            </span>
          </div>
          <div>
            <p
              className={`font-heading italic text-base leading-tight ${
                isLight ? "text-neutral-950" : "text-white"
              }`}
            >
              Mivibe
            </p>
            <p
              className={`text-xs font-body ${
                isLight ? "text-neutral-500" : "text-white/30"
              }`}
            >
              Mivibe LUTs Admin
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const count = getCount(item.id);
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={`h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 ${
                activeTab === item.id
                  ? isLight
                    ? "bg-neutral-100 text-neutral-950"
                    : "bg-white/10 text-white"
                  : isLight
                    ? "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                    : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{item.label}</span>
              {count !== undefined && (
                <Badge
                  className={`px-2 py-0.5 ${
                    isLight
                      ? "bg-neutral-200 text-neutral-500 hover:bg-neutral-200"
                      : "bg-white/10 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      <div
        className={`space-y-3 p-4 ${
          isLight ? "border-t border-neutral-200" : "border-t border-white/5"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-body">
          <span className={isLight ? "text-neutral-500" : "text-white/30"}>
            Theme
          </span>
          <label className="flex items-center gap-2">
            <Sun
              size={13}
              className={isLight ? "text-amber-500" : "text-white/25"}
            />
            <Switch
              checked={!isLight}
              onCheckedChange={(checked) =>
                onThemeChange(checked ? "dark" : "light")
              }
              size="sm"
            />
            <Moon
              size={13}
              className={isLight ? "text-neutral-400" : "text-sky-300"}
            />
          </label>
        </div>
        <div className="flex justify-between text-xs font-body">
          <span className={isLight ? "text-neutral-500" : "text-white/30"}>
            Active LUTs
          </span>
          <span className="text-emerald-400">{activeLuts}</span>
        </div>
        <div className="flex justify-between text-xs font-body">
          <span className={isLight ? "text-neutral-500" : "text-white/30"}>
            Supabase
          </span>
          <span className={isConfigured ? "text-emerald-400" : "text-orange-400"}>
            {isConfigured ? "Connected" : "Local only"}
          </span>
        </div>
      </div>
    </div>
  );
}
