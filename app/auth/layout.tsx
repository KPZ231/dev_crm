import React from "react";
import LineWaves from "@/components/LineWaves";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#09090b] selection:bg-[#a78bfa]/30 selection:text-[#a78bfa]">
      <div className="absolute inset-0 z-0 opacity-20">
        <LineWaves 
          speed={0.1}
          innerLineCount={20}
          outerLineCount={25}
          warpIntensity={1.5}
          rotation={45}
          brightness={0.2}
          color1="#a78bfa"
          color2="#34d399"
          color3="#27272a"
          enableMouseInteraction={false}
        />
      </div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-1 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(9,9,11,0.9)_100%)]"></div>

      <div className="relative z-10 w-full max-w-md p-6">
        {children}
      </div>
    </div>
  );
}
