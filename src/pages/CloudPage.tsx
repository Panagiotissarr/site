import React from "react";
import { Link } from "react-router-dom";

const featureTiles = [
  {
    id: "better-ai",
    icon: "devices",
    title: "Better AI",
    description: "Don't use that junk ChatGPT and Gemini. Use Cloud instead.",
    className: "md:col-span-2 md:row-span-2",
    bgImage: "/assets/img/Thums/Cloud.jpeg"
  },
  {
    id: "image-support",
    icon: "reply",
    title: "Image support",
    description: "Coming never! (Keeping the original playful copy.)",
    className: "md:col-span-1 md:row-span-1",
    bgImage: "/assets/img/Thums/Search.jpeg"
  },
  {
    id: "file-upload",
    icon: "files",
    title: "File upload",
    description: "Also coming never!",
    className: "md:col-span-1 md:row-span-1",
    bgImage: "/assets/img/Thums/dc.jpeg"
  },
  {
    id: "friendly",
    icon: "notifications",
    title: "Friendly conversation",
    description: "Cloud responds as friendly as possible.",
    className: "md:col-span-2 md:row-span-1",
    bgImage: "/assets/img/Thums/Windows.jpeg"
  },
  {
    id: "fast-reply",
    icon: "play_circle",
    title: "Fast reply",
    description: "Cloud responds fast depending on your internet.",
    className: "md:col-span-1 md:row-span-1",
    bgImage: "/assets/img/Thums/Calandar.jpg"
  },
  {
    id: "secure",
    icon: "key",
    title: "Secure",
    description: "Everything is sent to an end-to-end encrypted server.",
    className: "md:col-span-1 md:row-span-1"
  },
  {
    id: "desktop",
    icon: "desktop_windows",
    title: "Desktop companion",
    description: "A tiny assistant for your everyday tasks.",
    className: "md:col-span-2 md:row-span-1",
    bgImage: "/assets/img/Thums/Cloud-Preview.jpeg"
  },
  {
    id: "open-source",
    icon: "code",
    title: "Free and open source",
    description: "Feel free to tinker with the source and make it your own.",
    className: "md:col-span-2 md:row-span-1",
    bgImage: "/assets/img/Thums/github.jpeg"
  }
];

export const CloudPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937,_#020617)] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <span className="material-symbols-rounded text-2xl text-sky-400">
                cloud
              </span>
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-sky-300">
                cloud
              </h1>
              <p className="text-xs text-zinc-300">
                The simplest (and worst) AI assistant, reworked as a moodboard.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/cloud-privacy"
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/60 bg-sky-950 px-3 py-1.5 text-[11px] font-medium text-sky-200 hover:bg-sky-900"
            >
              <span className="material-symbols-rounded text-xs">policy</span>
              Privacy policy
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-zinc-200 hover:bg-white/10"
            >
              <span className="material-symbols-rounded text-sm">arrow_back</span>
              Home
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:auto-rows-[170px] md:grid-cols-4">
          <div className="relative flex flex-col gap-4 rounded-3xl border border-sky-400/60 bg-zinc-900/80 p-5 shadow-lg shadow-sky-900/60 md:col-span-2 md:row-span-3">
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <img
                src="/assets/img/Thums/Cloud-Preview.jpeg"
                alt="Cloud preview"
                className="h-52 w-full object-cover md:h-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-xs text-sky-200">
                <span className="material-symbols-rounded text-sm">bolt</span>
                All OS supported
              </div>
              <h2 className="text-lg font-semibold text-sky-300">
                A playful open-source AI assistant
              </h2>
              <p className="text-sm text-zinc-200">
                Cloud is an open source AI based on Gemini, running on a server
                with end-to-end encryption. Built to stay minimal, fast, and
                fun.
              </p>
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-2">
              <a
                href="https://pscloud-two.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-sky-950 shadow-md shadow-sky-500/40 hover:bg-sky-400"
              >
                <span className="material-symbols-rounded text-sm">
                  download
                </span>
                Cloud 2.0 (BETA)
              </a>
              <a
                href="https://github.com/panagiotissarr/Cloud"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-100 hover:bg-white/10"
              >
                <span className="material-symbols-rounded text-sm">code</span>
                Source
              </a>
            </div>
          </div>

          {featureTiles.map((tile) => (
            <FeatureTile key={tile.id} {...tile} />
          ))}
        </section>

        <footer className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
          <span>cloud — reimagined moodboard layout</span>
          <a
            href="https://sarris.dev"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-zinc-300 hover:text-white"
          >
            <span className="material-symbols-rounded text-xs">arrow_forward</span>
            More of my projects
          </a>
        </footer>
      </div>
    </div>
  );
};

type FeatureTileProps = {
  id: string;
  icon: string;
  title: string;
  description: string;
  className: string;
  bgImage?: string;
};

const FeatureTile: React.FC<FeatureTileProps> = ({
  icon,
  title,
  description,
  className,
  bgImage
}) => (
  <div
    className={`relative overflow-hidden rounded-3xl border border-white/15 bg-zinc-900/80 p-4 shadow-md shadow-black/50 ${className}`}
  >
    {bgImage && (
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
    <div className="relative flex h-full flex-col justify-end gap-2">
      <span className="inline-flex items-center justify-center rounded-full bg-white/10 p-1.5">
        <span className="material-symbols-rounded text-base text-sky-300">
          {icon}
        </span>
      </span>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="text-xs text-zinc-200">{description}</p>
    </div>
  </div>
);
