'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Check, ArrowRight, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface PricingPlan {
  id: number;
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  recommended?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 1,
    name: "Developer",
    price: "39",
    description: "Idealny dla freelancerów i małych projektów.",
    features: [
      "Zarządzanie leadami",
      "Baza 100 klientów",
      "Podstawowe raporty",
      "Dokumenty z szablonów",
      "Wsparcia e-mail"
    ],
    cta: "Wybierz Developer"
  },
  {
    id: 2,
    name: "Agency",
    price: "49",
    description: "Pełna moc dla dynamicznych zespołów.",
    features: [
      "Wszystko w planie Developer",
      "Nielimitowani klienci",
      "Pełne wykresy Revenue",
      "Moduł Kanban & Taski",
      "Analiza marży i kosztów",
      "Wyjątkowy design Obsidian"
    ],
    cta: "Wybierz Agency",
    recommended: true
  },
  {
    id: 3,
    name: "Scale",
    price: "79",
    description: "Bez kompromisów dla dużej skali.",
    features: [
      "Wszystko w planie Agency",
      "Wiele workspace'ów",
      "Nielimitowane dokumenty",
      "Zaawansowana analityka",
      "Priorytetowe wsparcie 24/7",
      "Dedykowany opiekun"
    ],
    cta: "Wybierz Scale"
  }
];

const Pricing = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header entrance
      gsap.from(headerRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%'
        }
      });

      const cards = cardsRef.current.filter((el): el is HTMLDivElement => el !== null);

      // Cards stagger entrance
      gsap.from(cards, {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%'
        }
      });

      // Subtle pulse for recommended card
      const recommendedCard = cards.find((_, i) => plans[i].recommended);
      if (recommendedCard) {
        const innerCard = recommendedCard.firstElementChild;
        if (innerCard) {
          gsap.to(innerCard, {
            boxShadow: '0 0 40px rgba(167, 139, 250, 0.3)',
            repeat: -1,
            yoyo: true,
            duration: 2,
            ease: 'power1.inOut'
          });
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="py-24 px-6 md:px-12 lg:px-24 bg-[#09090b] relative"
      id="pricing"
    >
      <div className="max-w-7xl mx-auto">
        <header ref={headerRef} className="mb-20 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Inwestycja, która <span className="text-[#a78bfa]">się zwraca</span>
          </h2>
          <p className="text-[#a1a1aa] text-lg leading-relaxed">
            Wybierz plan dopasowany do skali Twojego software house&apos;u. Proste zasady, bez ukrytych kosztów.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={plan.id}
              ref={el => { 
                if (el) cardsRef.current[index] = el; 
              }}
              className="h-full"
            >
              <div
                className={`
                  relative p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-full
                  ${plan.recommended 
                    ? 'bg-[#0c0c0f] border-[#a78bfa] md:scale-105 z-10 shadow-[0_0_30px_rgba(167,139,250,0.1)]' 
                    : 'bg-[#0c0c0f] border-[#27272a] hover:border-[#a1a1aa]/50 hover:bg-[#18181b]'
                  }
                `}
              >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#a78bfa] text-[#09090b] text-[11px] font-bold uppercase tracking-widest rounded-full flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Najpopularniejszy
                </div>
              )}

              <div>
                <header className="mb-8">
                  <h3 className="text-lg font-semibold text-[#a1a1aa] mb-2 uppercase tracking-wide">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xl text-[#a1a1aa] font-medium">PLN/msc</span>
                  </div>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </header>

                <div className="space-y-4 mb-10">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-start gap-3">
                      <div className={`mt-1 p-0.5 rounded-full ${plan.recommended ? 'bg-[#a78bfa]/20' : 'bg-zinc-800'}`}>
                        <Check className={`w-3 h-3 ${plan.recommended ? 'text-[#a78bfa]' : 'text-[#fafafa]'}`} />
                      </div>
                      <span className="text-sm text-[#fafafa] leading-tight">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                className={`
                  w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 group
                  ${plan.recommended 
                    ? 'bg-[#a78bfa] text-[#09090b] hover:bg-[#c4b5fd]' 
                    : 'bg-[#18181b] border border-[#27272a] text-[#fafafa] hover:bg-[#27272a]'
                  }
                `}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
          ))}
        </div>

        <footer className="mt-16 text-center">
          <p className="text-xs text-[#a1a1aa] uppercase tracking-[0.2em]">
            Wszystkie ceny są cenami netto i podlegają opodatkowaniu 23% VAT.
          </p>
        </footer>
      </div>
    </section>
  );
};

export default Pricing;
