'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import LineWaves from '@/components/LineWaves';

interface HeroSectionProps {
  badge?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  secondaryCtaText?: string;
  onCtaClick?: () => void;
  onSecondaryCtaClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  badge = "Wszystkie Twoje procesy w jednym miejscu",
  title = "Nowoczesny CRM dla twórców technologii.",
  description = "Pomóż swojemu zespołowi zarządzać leadami, projektami, finansami i dokumentami w jednym przejrzystym, technicznym interfejsie. Zbudowany z myślą o agencjach i software house'ach.",
  ctaText = "Wypróbuj za darmo",
  secondaryCtaText = "Zobacz demo",
  onCtaClick,
  onSecondaryCtaClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial setup
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8 },
        '+=0.2'
      )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        '-=0.5'
      )
      .fromTo(
        descRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        '-=0.7'
      )
      .fromTo(
        ctaGroupRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8 },
        '-=0.6'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#09090b] selection:bg-[#a78bfa]/30 selection:text-[#a78bfa]"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 opacity-40">
        <LineWaves 
          speed={0.2}
          innerLineCount={40}
          outerLineCount={45}
          warpIntensity={1.2}
          rotation={-45}
          brightness={0.3}
          color1="#a78bfa" // Primary violet
          color2="#34d399" // Tertiary emerald
          color3="#27272a" // Surface zinc
          enableMouseInteraction={false}
        />
      </div>

      {/* Decorative Gradient Overlays */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-1 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(9,9,11,0.8)_100%)]"></div>
      <div className="absolute top-0 left-0 w-full h-32 pointer-events-none z-1 bg-linear-to-b from-[#09090b] to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-48 pointer-events-none z-1 bg-linear-to-t from-[#09090b] via-[#09090b]/80 to-transparent"></div>

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-6 max-w-5xl flex flex-col items-center text-center">
        
        {/* Badge */}
        <span 
          ref={badgeRef}
          className="px-4 py-1.5 mb-8 rounded-full bg-[#18181b] border border-[#27272a] text-[#a78bfa] text-xs font-semibold tracking-wider uppercase backdrop-blur-sm"
        >
          {badge}
        </span>

        {/* Title */}
        <h1 
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight mb-8 tracking-[-0.03em] drop-shadow-2xl"
        >
          {title}
        </h1>

        {/* Description */}
        <p 
          ref={descRef}
          className="text-lg md:text-xl text-[#a1a1aa] max-w-2xl leading-relaxed mb-12"
        >
          {description}
        </p>

        {/* CTA Group */}
        <div 
          ref={ctaGroupRef}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <button 
            onClick={onCtaClick}
            className="group relative px-8 py-4 bg-[#a78bfa] text-[#09090b] rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:bg-[#c4b5fd] shadow-[0_0_20px_rgba(167,139,250,0.4)] active:scale-95 overflow-hidden"
          >
            <span className="relative z-10">{ctaText}</span>
            <div className="absolute top-0 left-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
          </button>

          <button 
            onClick={onSecondaryCtaClick}
            className="px-8 py-4 bg-[#0c0c0f] border border-[#27272a] text-white rounded-xl font-medium transition-all duration-300 hover:bg-[#18181b] hover:border-[#a1a1aa]/30 active:scale-95"
          >
            {secondaryCtaText}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
