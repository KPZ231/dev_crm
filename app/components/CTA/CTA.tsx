'use client'
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ShapeGrid from "@/components/ShapeGrid";

interface CTAProps{
    title: string;
    subtitle: string;
    ctaButtonContent: string;
    ctaButtonLink: string;
}

export default function CTA({title, subtitle, ctaButtonContent, ctaButtonLink} : CTAProps){
    return(
        <section className="py-24 px-6 md:px-12 lg:px-24 relative overflow-hidden">

            {/* Background */}
            <div className="absolute inset-0 z-0">
                <ShapeGrid 
                    speed={0.5}
                    squareSize={40}
                    direction='diagonal'
                    hoverFillColor='#222'
                    shape='square'
                    hoverTrailAmount={0}
                />
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            {title}
                        </h2>

                        <p className="text-[#a1a1aa] text-lg leading-relaxed">
                            {subtitle}
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Link 
                            href={ctaButtonLink} 
                            className="px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 group bg-[#a78bfa] text-[#09090b] hover:bg-[#c4b5fd]"
                        >
                            {ctaButtonContent}

                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                </div>
            </div>

        </section>
    );
}