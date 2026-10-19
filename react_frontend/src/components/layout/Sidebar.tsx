import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  BookMarked,
  Settings,
  Compass,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggle,
}) => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Course Generator", href: "/builder", icon: Sparkles },
    { label: "Saved Library", href: "/library", icon: BookMarked },
    { label: "Explore Catalog", href: "/explore", icon: Compass },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-card/80 backdrop-blur-lg transition-all duration-300 ease-in-out select-none",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Navigation List */}
      <div className="flex-1 py-6 px-3 space-y-1.5">
        <div className={cn("px-3 mb-4", isCollapsed && "text-center")}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {isCollapsed ? "•" : "Menu"}
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || (item.href === "/builder" && location.pathname.startsWith("/builder"));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "group flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary glow-inner font-semibold"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Collapse Toggle Button */}
      {onToggle && (
        <div className="p-3 border-t border-border/40 flex justify-end">
          <button
            onClick={onToggle}
            aria-label="Toggle sidebar collapse"
            className="btn-ghost h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      )}
    </aside>
  );
};
