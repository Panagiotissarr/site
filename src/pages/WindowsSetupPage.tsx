import React from "react";
import { Link } from "react-router-dom";

const apps = [
  {
    id: "zen",
    name: "Zen Browser",
    description: "Welcome to a calmer internet. Beautifully designed and privacy-focused.",
    icon: "language",
    price: "free"
  },
  {
    id: "glazewm",
    name: "GlazeWM",
    description: "Keyboard-driven window manager for productivity layouts.",
    icon: "view_quilt",
    price: "free"
  },
  {
    id: "vscode",
    name: "VS Code",
    description: "My daily editor for everything from scripts to UI work.",
    icon: "code",
    price: "free"
  },
  {
    id: "raycast",
    name: "Raycast",
    description: "Launcher, snippets, and workflows for quick actions.",
    icon: "bolt",
    price: "free"
  },
  {
    id: "proton",
    name: "Proton VPN",
    description: "Privacy-first VPN with a clean, no-friction UI.",
    icon: "shield",
    price: "free"
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "Fast idea expansion and copy drafts when I need a boost.",
    icon: "chat_bubble",
    price: "free"
  }
];

export const WindowsSetupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-900 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 md:px-8">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/img/Thums/Windows-Preview.jpeg"
                alt="Windows preview"
                className="h-14 w-14 rounded-2xl border border-white/20 object-cover"
              />
              <div className="space-y-1">
                <h1 className="font-display text-3xl md:text-4xl">
                  <span className="text-primary">Windows</span> Setup
                </h1>
                <p className="text-xs text-zinc-300">
                  A complete lookaround of my personal Windows productivity
                  setup.
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-zinc-200 hover:bg-white/10"
            >
              <span className="material-symbols-rounded text-sm">arrow_back</span>
              Home
            </Link>
          </div>
        </header>

        <section className="space-y-6">
          <div className="rounded-3xl border border-white/15 bg-zinc-900/70 p-5 shadow-md shadow-black/60">
            <h2 className="mb-4 text-lg font-semibold">Device</h2>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <img
                  src="/assets/img/Thums/Windows.jpeg"
                  alt="Windows device"
                  className="w-full rounded-2xl border border-white/15 object-cover"
                />
                <img
                  src="/assets/img/Thums/Windows-Preview.jpeg"
                  alt="Desktop screenshot"
                  className="w-full rounded-2xl border border-white/15 object-cover"
                />
              </div>
              <div className="flex items-center">
                <p className="text-sm leading-relaxed text-zinc-200">
                  <span className="font-semibold text-primary">Windows</span>
                  <br />
                  8GB Memory
                  <br />
                  256GB Storage
                  <br />
                  12 CPU cores
                  <br />
                  Silver
                  <br />
                  Windows 11 25H2
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Apps and tools</h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Free
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Paid
                </span>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="rounded-3xl border border-white/15 bg-zinc-900/70 p-4 shadow-md shadow-black/60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-lg text-primary">
                        {app.icon}
                      </span>
                      <h3 className="text-sm font-semibold">{app.name}</h3>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        app.price === "free"
                          ? "bg-emerald-500/20 text-emerald-200"
                          : "bg-amber-500/20 text-amber-200"
                      }`}
                    >
                      {app.price}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-300">
                    {app.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
