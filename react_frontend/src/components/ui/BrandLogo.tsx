import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className,
  size = 32,
  showText = true,
}) => {
  return (
    <div className={cn("inline-flex items-center gap-2.5 font-display select-none", className)}>
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop */}
        <div
          className="absolute inset-0 rounded-xl blur-md opacity-70"
          style={{ background: "hsl(var(--primary-glow) / 0.5)" }}
        />
        {/* Custom Hybrid Leaf/Play SVG */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow"
        >
          {/* Rounded organic container */}
          <rect
            width="40"
            height="40"
            rx="12"
            fill="hsl(var(--card))"
            stroke="hsl(var(--primary) / 0.4)"
            strokeWidth="1.5"
          />
          {/* Leaf vein / Play button hybrid path */}
          <path
            d="M14 11C14 11 28 14 28 26C28 31 22 31 18 29C15 27.5 14 24 14 20V11Z"
            fill="hsl(var(--primary))"
          />
          <path
            d="M17 17L25 21.5L17 26V17Z"
            fill="hsl(var(--primary-foreground))"
          />
        </svg>
      </div>

      {showText && (
        <span className="text-xl font-bold tracking-tight text-foreground">
          Course<span className="text-gradient-primary">Forge</span>
        </span>
      )}
    </div>
  );
};
