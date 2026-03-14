import React from "react";
import { SidebarNav } from "./SidebarNav";
import { IntroSection } from "./sections/IntroSection";
import { ShowcaseSection } from "./sections/ShowcaseSection";
import { AboutSection } from "./sections/AboutSection";
import { ContactSection } from "./sections/ContactSection";
import { useMagicCursor } from "./useMagicCursor";

export const PortfolioPage: React.FC = () => {
  useMagicCursor();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-900 text-white">
      <SidebarNav />

      <div className="pointer-events-none magic-cursor" id="magic-cursor">
        <div id="magic-cursor-text" className="magic-cursor-text"></div>
      </div>

      <main className="container mx-auto px-4 md:px-12 lg:px-24 xl:px-32 pt-16 pb-28 md:pb-16 space-y-32">
        <IntroSection />
        <ShowcaseSection />
        <AboutSection />
        <ContactSection />
      </main>
    </div>
  );
};

