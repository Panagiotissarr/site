import React from "react";

export const IntroSection: React.FC = () => {
  return (
    <section
      id="intro"
      className="relative flex min-h-[80vh] flex-col justify-between gap-8 pt-8"
    >
      <div className="flex flex-col items-end gap-6">
        <div className="flex w-full items-start justify-between">
          <a href="#" className="hover-state" data-title="Home">
            <img
              id="logo"
              src="/assets/img/logo-mini.png"
              alt="Panagiotis Sarris Logo"
              className="h-16 w-16 rounded-2xl border border-white/20 bg-white/5 p-2 shadow-lg shadow-primary/20"
            />
          </a>
          <div
            id="music-holder"
            className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 shadow-md"
          >
            <div className="size-10 rounded-2xl bg-zinc-800/60" />
            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Now playing
              </span>
              <span className="text-sm font-semibold text-white">
                Ambient focus mix
              </span>
            </div>
            <span className="inline-flex h-6 items-center gap-0.5">
              <span className="h-4 w-0.5 animate-pulse bg-emerald-400/80" />
              <span className="h-3 w-0.5 animate-pulse bg-emerald-400/60 delay-75" />
              <span className="h-5 w-0.5 animate-pulse bg-emerald-400/90 delay-150" />
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col items-end gap-4 text-right">
          <h1 className="font-display text-[clamp(3.5rem,18vw,7rem)] leading-none">
            <span className="block text-primary">Sarris</span>
            <span className="block">Panagiotis</span>
          </h1>

          <div className="inline-flex max-w-md items-center justify-end rounded-magic-out border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300">
            <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-semibold text-emerald-300">
              ●
            </span>
            <span>
              Developer & designer from Greece arranging pieces of thought while
              the world is sleeping.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-zinc-400">
            <span className="rounded-full bg-white/5 px-3 py-1">
              <span className="font-medium text-zinc-200">10 y/o</span> coding
              things
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1">
              Central Greece • Nea Artaki
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};


