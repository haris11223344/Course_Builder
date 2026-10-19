import React from "react";

export const FloatingOrbs: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Orb 1: Primary Glow Top Left */}
      <div
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-25 blur-3xl animate-float"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary-glow)) 0%, transparent 70%)",
        }}
      />

      {/* Orb 2: Primary Deep Canopy Center Right */}
      <div
        className="absolute top-1/3 -right-24 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl animate-float"
        style={{
          animationDelay: "2s",
          background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
        }}
      />

      {/* Orb 3: Cyan Accent Tint Bottom Left */}
      <div
        className="absolute -bottom-40 left-1/4 h-[450px] w-[450px] rounded-full opacity-15 blur-3xl animate-float"
        style={{
          animationDelay: "4s",
          background: "radial-gradient(circle, rgb(6, 182, 212) 0%, transparent 70%)",
        }}
      />

      {/* Orb 4: Amber Subtle Rim Bottom Right */}
      <div
        className="absolute bottom-10 -right-20 h-80 w-80 rounded-full opacity-10 blur-3xl animate-float"
        style={{
          animationDelay: "3s",
          background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};
