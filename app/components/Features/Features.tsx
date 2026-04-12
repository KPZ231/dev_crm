"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import {
  UserPlus,
  Users,
  BarChart3,
  ShieldCheck,
  FileText,
  Receipt,
  Search,
  LayoutDashboard,
  ArrowUpRight,
} from "lucide-react";
import Particles from "@/components/Particles";

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  className?: string;
}

const features: Feature[] = [
  {
    id: 1,
    title: "Rejestracja Leadów",
    description:
      "Kompletny system zarządzania potencjalnymi klientami. Pełna historia kontaktu, statusy i przypisywanie osób odpowiedzialnych.",
    icon: <UserPlus className="w-6 h-6 text-[#a78bfa]" />,
    link: "/leads",
    className: "md:col-span-2 lg:col-span-2",
  },
  {
    id: 2,
    title: "Baza Klientów",
    description:
      "Czysty widok listy klientów z filtrowaniem i kartami szczegółów. Wszystko pod kontrolą w jednym miejscu.",
    icon: <Users className="w-6 h-6 text-[#a78bfa]" />,
    link: "/clients",
    className: "md:col-span-1 lg:col-span-1",
  },
  {
    id: 3,
    title: "Revenue Chart",
    description:
      "Zaawansowany panel z wykresem przychodów. Śledź MRR, zaległe płatności i prognozy finansowe.",
    icon: <BarChart3 className="w-6 h-6 text-[#a78bfa]" />,
    link: "/revenue",
    className: "md:col-span-1 lg:col-span-1",
  },
  {
    id: 4,
    title: "Administracja",
    description:
      "Zarządzanie rolami, uprawnieniami i ustawieniami workspace. Pełna kontrola nad Twoim zespołem.",
    icon: <ShieldCheck className="w-6 h-6 text-[#a78bfa]" />,
    link: "/admin",
    className: "md:col-span-1 lg:col-span-1",
  },
  {
    id: 5,
    title: "Generowanie Dokumentów",
    description:
      "Automatyczne tworzenie ofert, umów i faktur na bazie danych systemu. Szybko i bezbłędnie.",
    icon: <FileText className="w-6 h-6 text-[#a78bfa]" />,
    link: "/documents",
    className: "md:col-span-1 lg:col-span-1",
  },
  {
    id: 6,
    title: "Podział Kosztów",
    description:
      "Szczegółowe zestawienie kosztów projektowych i operacyjnych. Analiza marży i wydatków per projekt.",
    icon: <Receipt className="w-6 h-6 text-[#a78bfa]" />,
    link: "/costs",
    className: "md:col-span-2 lg:col-span-1",
  },
  {
    id: 7,
    title: "Globalna Wyszukiwarka",
    description:
      "Zintegrowany search bar dostępny zawsze. Znajdź leada, klienta lub dokument w sekundę.",
    icon: <Search className="w-6 h-6 text-[#a78bfa]" />,
    link: "/search",
    className: "md:col-span-1 lg:col-span-1",
  },
  {
    id: 8,
    title: "Kanban & Taski",
    description:
      "Intuicyjne zarządzanie zadaniami dev teamu. Widok obciążenia zespołu i sprinty pod kontrolą.",
    icon: <LayoutDashboard className="w-6 h-6 text-[#a78bfa]" />,
    link: "/kanban",
    className: "md:col-span-2 lg:col-span-2",
  },
];

const Features = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.from(cardsRef.current, {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      // Hover effect on individual cards
      cardsRef.current.forEach((card) => {
        if (!card) return;
        const arrow = card.querySelector(".arrow-icon");

        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -5,
            borderColor: "#a78bfa",
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(arrow, {
            opacity: 1,
            x: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            y: 0,
            borderColor: "#27272a",
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(arrow, {
            opacity: 0,
            x: -10,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-24 px-6 md:px-12 lg:px-24 bg-[#09090b] relative overflow-hidden"
      id="features"
    >
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={["#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles
          disableRotation={false}
          pixelRatio={1}
        ></Particles>
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            System operacyjny dla{" "}
            <span className="text-[#a78bfa]">Software House&apos;ów</span>
          </h2>
          <p className="text-[#a1a1aa] text-lg leading-relaxed">
            Zarządzaj każdym etapem rozwoju swojej agencji w jednym, precyzyjnie
            zaprojektowanym panelu.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
          {features.map((feature, index) => (
            <div key={feature.id} className={feature.className}>
              <div
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className={`
                  group relative p-8 bg-[#0c0c0f] border border-[#27272a] rounded-2xl 
                  flex flex-col justify-between transition-colors cursor-pointer h-full
                `}
                onClick={() => (window.location.href = feature.link)}
              >
                <div>
                  <div className="mb-6 p-3 bg-zinc-900/50 w-fit rounded-xl border border-[#27272a]">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed max-w-[280px]">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] group-hover:text-white transition-colors">
                  Szczegóły
                  <ArrowUpRight className="arrow-icon w-4 h-4 opacity-0 -translate-x-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
