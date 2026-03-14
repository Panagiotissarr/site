import React from "react";
import { Link } from "react-router-dom";

export const CloudPrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-900 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl">
              <span className="text-primary">cloud</span> Privacy Policy
            </h1>
            <p className="mt-1 text-xs text-zinc-300">
              How Cloud handles your data and protects your privacy.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs">
            <Link
              to="/cloud"
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-zinc-200 hover:bg-white/10"
            >
              <span className="material-symbols-rounded text-sm">arrow_back</span>
              Back to Cloud
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-200 hover:bg-white/10"
            >
              <span className="material-symbols-rounded text-sm">home</span>
              Home
            </Link>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-zinc-900/80 p-6 text-sm leading-relaxed text-zinc-200 shadow-md shadow-black/60">
          <div className="pointer-events-none absolute inset-0 bg-[url('/assets/img/Thums/Cloud-Preview.jpeg')] bg-cover bg-center opacity-15" />
          <div className="relative space-y-4">
            <p>
              At <span className="font-semibold text-primary">cloud</span>, I
              respect your privacy and am committed to protecting your personal
              data. This Privacy Policy explains what data I collect, how it is
              used, and your rights.
            </p>
            <p className="text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300">Effective date:</span>{" "}
              December 6, 2025
            </p>

            <hr className="border-white/10" />

            <div>
              <h2 className="text-base font-semibold text-primary">
                Information I Collect
              </h2>
              <p className="mt-2 font-semibold">None.</p>
              <p className="mt-2">
                Cloud is intentionally designed to be as minimal as possible.
                Your prompts are processed only to generate responses and are
                not stored for profiling or resale.
              </p>
            </div>

            <div className="pt-4">
              <Link
                to="/cloud"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/40 hover:bg-primary/90"
              >
                <span className="material-symbols-rounded text-sm">
                  arrow_back
                </span>
                Back to cloud
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
