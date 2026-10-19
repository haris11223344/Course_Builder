import React from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showText?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 54,
  strokeWidth = 4,
  className,
  showText = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safeProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Indicator */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: "drop-shadow(0 0 6px hsl(var(--primary-glow) / 0.7))",
            transition: "stroke-dashoffset 0.5s ease-in-out",
          }}
        />
      </svg>
      {showText && (
        <span className="absolute text-[11px] font-bold tracking-tight text-foreground">
          {Math.round(safeProgress)}%
        </span>
      )}
    </div>
  );
};
