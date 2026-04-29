import React, { useCallback, useRef, useEffect } from "react";
import { useNowPlayingSettings } from "../useNowPlayingSettings";

const STROKE_LENGTH = 1200;
const STROKE_DURATION = 5;
const FILL_DELAY = 0.8;
const FILL_DURATION = 1.4;
const FILL_START_PROGRESS = FILL_DELAY / STROKE_DURATION;
const FILL_END_PROGRESS = (FILL_DELAY + FILL_DURATION) / STROKE_DURATION;

function easeOut(t: number) {
  return 1 - (1 - t) * (1 - t);
}

export const IntroSection: React.FC = () => {
  const { settings } = useNowPlayingSettings();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const strokeAnimRef = useRef<SVGTextElement>(null);
  const fillRef = useRef<SVGTextElement>(null);
  const progressRef = useRef(0);
  const rafIdRef = useRef(0);
  const animRef = useRef({
    startTime: 0,
    startProgress: 0,
    endProgress: 0,
    duration: 0,
  });

  const applyProgress = useCallback((progress: number) => {
    const strokeEl = strokeAnimRef.current;
    const fillEl = fillRef.current;
    if (!strokeEl || !fillEl) return;
    if (progress <= 0) {
      strokeEl.style.opacity = "";
      strokeEl.style.strokeDashoffset = "";
      fillEl.style.opacity = "";
      return;
    }
    strokeEl.style.opacity = "1";
    strokeEl.style.strokeDashoffset = String(STROKE_LENGTH * (1 - progress));
    const fillOpacity =
      progress < FILL_START_PROGRESS
        ? 0
        : Math.min(1, (progress - FILL_START_PROGRESS) / (FILL_END_PROGRESS - FILL_START_PROGRESS));
    fillEl.style.opacity = String(fillOpacity);
  }, []);

  const tick = useCallback(() => {
    const now = performance.now() / 1000;
    const { startTime, startProgress, endProgress, duration } = animRef.current;
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const eased = easeOut(t);
    const progress = startProgress + (endProgress - startProgress) * eased;
    progressRef.current = progress;
    applyProgress(progress);
    if (t < 1) {
      rafIdRef.current = requestAnimationFrame(tick);
    } else {
      progressRef.current = endProgress;
      applyProgress(endProgress);
      if (endProgress === 0) {
        wrapRef.current?.classList.remove("manim-leaving");
      }
    }
  }, [applyProgress]);

  const handleManimEnter = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    wrapRef.current?.classList.remove("manim-leaving");
    const start = progressRef.current;
    const end = 1;
    const duration = (end - start) * STROKE_DURATION;
    animRef.current = {
      startTime: performance.now() / 1000,
      startProgress: start,
      endProgress: end,
      duration: Math.max(0.02, duration),
    };
    rafIdRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const handleManimLeave = useCallback(() => {
    if (window.matchMedia("(max-width: 768px)").matches) return;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    wrapRef.current?.classList.add("manim-leaving");
    const start = progressRef.current;
    const end = 0;
    const duration = start * STROKE_DURATION;
    animRef.current = {
      startTime: performance.now() / 1000,
      startProgress: start,
      endProgress: end,
      duration: Math.max(0.02, duration),
    };
    rafIdRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => () => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
  }, []);

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
          {settings.enabled && (
            <div
              id="music-holder"
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 shadow-md"
            >
              {settings.isScrobbling ? (
                <>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                      Now listening to
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {settings.title}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {settings.showImage !== false && (
                    <img
                      src={settings.imageUrl}
                      alt="Now playing artwork"
                      className="size-10 rounded-2xl border border-white/10 bg-zinc-800/60 object-cover"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                      {settings.label}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {settings.title}
                    </span>
                  </div>
                  {settings.showEqualizer !== false && (
                    <span className="inline-flex h-6 items-center gap-0.5">
                      <span className="equalizer-bar h-4 w-0.5 bg-emerald-400/80" />
                      <span className="equalizer-bar h-3 w-0.5 bg-emerald-400/60 delay-75" />
                      <span className="equalizer-bar h-5 w-0.5 bg-emerald-400/90 delay-150" />
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex w-full flex-col items-end gap-4 text-right">
          <h1 className="font-display text-[clamp(3.5rem,18vw,7rem)] leading-none">
            <span className="block text-right">
              <span
                ref={wrapRef}
                className="manim-wrap manim-js"
                onMouseEnter={handleManimEnter}
                onMouseLeave={handleManimLeave}
                onTouchStart={handleManimEnter}
              >
                <svg className="manim-text" role="img" aria-label="Sarris">
                  <text
                    className="manim-stroke"
                    x="100%"
                    y="0.85em"
                    textAnchor="end"
                  >
                    Sarris
                  </text>
                  <text
                    ref={strokeAnimRef}
                    className="manim-stroke-anim"
                    x="100%"
                    y="0.85em"
                    textAnchor="end"
                  >
                    Sarris
                  </text>
                  <text
                    ref={fillRef}
                    className="manim-fill"
                    x="100%"
                    y="0.85em"
                    textAnchor="end"
                  >
                    Sarris
                  </text>
                </svg>
              </span>
            </span>
            <span className="block">Panagiotis</span>
          </h1>

          <div className="inline-flex max-w-md items-center justify-end rounded-magic-out border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300">
            <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-semibold text-emerald-300">
              ●
            </span>
            <span>
                Hey there! i am well... Panagiotis! Welcome to my Portfollio.
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
