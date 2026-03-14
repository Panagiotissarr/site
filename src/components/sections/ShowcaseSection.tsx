import React from "react";
import { Link } from "react-router-dom";

const highlights = [
  {
    id: "cloud",
    title: "Cloud",
    description: "A free and open source AI",
    href: "/cloud",
    thumb: "/assets/img/Thums/Cloud.jpeg",
    preview: "/assets/img/Thums/Cloud-Preview.jpeg"
  },
  {
    id: "Project-Cearch",
    title: "Project Cearch",
    description: "Experimental search experience",
    href: "https://sarris.dev/Project-Cearch/",
    thumb: "/assets/img/Thums/Search.jpg",
    preview: "/assets/img/Thums/Search.jpeg"
  },
  {
    id: "edc",
    title: "My Every Day Carry",
    description: "Essentials I carry daily",
    href: "/edc-setup",
    thumb: "/assets/img/Thums/edc.jpeg",
    preview: "/assets/img/Thums/edc-preview.jpeg"
  },
  {
    id: "Windows",
    title: "My Windows Setup",
    description: "What's on my Surface?",
    href: "/windows",
    thumb: "/assets/img/Thums/Windows.jpeg",
    preview: "/assets/img/Thums/Windows-Preview.jpeg"
  },
  {
    id: "calendar",
    title: "Calendar App",
    description: "A calendar app AI made for me",
    href: "https://pscalendar.lovable.app/",
    thumb: "/assets/img/Thums/Calandar.jpg",
    preview: "/assets/img/Thums/dc-preview.jpg"
  },
  {
    id: "more-github",
    title: "More on GitHub",
    description: "Explore my projects",
    href: "https://github.com/panagiotissarr/",
    thumb: "/assets/img/Thums/github.jpeg",
    preview: "/assets/img/Thums/github.jpeg"
  }
];

export const ShowcaseSection: React.FC = () => {
  return (
    <section id="sitemap" className="space-y-6">
      <div className="inline-flex items-center rounded-magic-out bg-white/5 px-4 py-2 text-sm text-primary shadow-md shadow-primary/20">
        <span className="material-symbols-rounded mr-2 text-base">
          auto_awesome
        </span>
        Showcase
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {highlights.map((item) => {
          const isExternal = item.href.startsWith("http");
          const content = (
            <>
              <img
                src={item.thumb}
                alt={item.title}
                className="showcase-invert h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 rounded-magic-out bg-white/15 px-4 py-3 backdrop-blur-lg">
                <h3 className="text-sm font-semibold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-zinc-800/90">
                  {item.description}
                </p>
              </div>
            </>
          );

          if (isExternal) {
            return (
              <a
                key={item.id}
                id={item.id}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden rounded-magic-out border border-white/15 bg-zinc-900/60 shadow-lg shadow-black/40"
                data-title={item.title}
                data-preview={item.preview ?? item.thumb}
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              key={item.id}
              id={item.id}
              to={item.href}
              className="group relative aspect-square overflow-hidden rounded-magic-out border border-white/15 bg-zinc-900/60 shadow-lg shadow-black/40"
              data-title={item.title}
              data-preview={item.preview ?? item.thumb}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
};
