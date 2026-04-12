"use client";
import LineWaves from "@/components/LineWaves";
import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: HeaderProps) {
  const containerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // GSAP context ensures proper cleanup of animations
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ 
        defaults: { 
          ease: "expo.out",
          duration: 1.2 
        } 
      });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1 },
        "+=0.2"
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.4 },
          "-=0.8"
        )
        .fromTo(
          descRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.2 },
          "-=1.0"
        )
        .fromTo(
          ctaGroupRef.current,
          { opacity: 0, scale: 0.95, y: 10 },
          { opacity: 1, scale: 1, y: 0, duration: 1 },
          "-=0.9"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={containerRef}
      className="relative w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-[#09090b] px-6 text-center selection:bg-[#a78bfa]/30 selection:text-[#a78bfa]"
    >
      {/* Background Animated Layer */}
      <div className="absolute inset-0 z-0 opacity-30 select-none pointer-events-none">
        <LineWaves
          speed={0.15}
          innerLineCount={42}
          outerLineCount={48}
          warpIntensity={1.2}
          rotation={-45}
          brightness={0.25}
          color1="#a78bfa" // Primary violet
          color2="#34d399" // Tertiary emerald
          color3="#27272a" // Surface zinc
          enableMouseInteraction={false}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-6xl">
        {/* Badge / Tagline */}
        <div
          ref={badgeRef}
          className="mb-10 px-5 py-2 rounded-full border border-[#27272a] bg-[#0c0c0f]/80 backdrop-blur-md text-[#a78bfa] text-xs font-bold uppercase tracking-[0.2em] shadow-xl"
        >
          Professional CRM for Dev Teams
        </div>

        {/* Hero Title */}
        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl lg:text-9xl font-black text-[#fafafa] leading-[0.9] mb-10 tracking-[-0.05em] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
        >
          {title}
        </h1>

        {/* Hero Subtitle / Description */}
        <p
          ref={descRef}
          className="text-lg md:text-2xl text-[#a1a1aa] max-w-3xl leading-relaxed mb-14 font-medium tracking-tight"
        >
          {subtitle}
        </p>

        {/* Call to Actions */}
        <div ref={ctaGroupRef} className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="group relative px-10 py-5 bg-[#a78bfa] text-[#09090b] font-black rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(167,139,250,0.4)]">
            Launch System
            <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button className="px-10 py-5 bg-transparent border-2 border-[#27272a] text-[#fafafa] font-black rounded-lg transition-all duration-300 hover:bg-[#18181b] hover:border-[#3f3f46] active:scale-95">
            View Documentation
          </button>
        </div>
      </div>

      {/* Aesthetic Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-linear-to-t from-[#09090b] to-transparent z-10" />
    </header>
  );
}

