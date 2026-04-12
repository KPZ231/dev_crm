"use client";

import Navbar from "./components/Navbar/Navbar";
import HeroSection from "./components/HeroSection/HeroSection";
import Features from "./components/Features/Features";
import Pricing from "./components/Pricing/Pricing";
import Footer from "./components/Footer/Footer";
import CTA from "./components/CTA/CTA";
import MetricsOverview from "./components/Metrics/MetricsOverview";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer";

export default function Home() {
  return (
    <main className="bg-[#09090b]">
      <Navbar />
      <HeroSection
        title="Przyszłość Twojego zespołu w jednym miejscu."
        description="Zintegrowany system operacyjny dla małych software house'ów i agencji. Zarządzaj leadami, projektami i rentownością z precyzją, której potrzebuje Twój biznes."
        ctaText="Zacznij teraz"
        secondaryCtaText="Skontaktuj się z nami"
      />
      <MetricsOverview />
      <Features />
      <Pricing />
      <VideoPlayer
        src="/Video/video.mp4"
        className="w-[70%] mx-auto m-12"
      ></VideoPlayer>
      <CTA
        title="Gotowy na transformację?"
        subtitle="Dołącz do setek software house'ów, które już usprawniają swoją pracę z DevCRM."
        ctaButtonContent="Zacznij teraz"
        ctaButtonLink="/dashboard"
      />
      <Footer />
    </main>
  );
}
