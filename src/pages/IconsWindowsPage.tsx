import React from "react";
import { Link } from "react-router-dom";

export const IconsWindowsPage: React.FC = () => {
  return (
    <SimpleIconsPage
      title="Icons – Windows"
      description="Remixed placeholder page for your Windows icon set."
    />
  );
};

type SimpleIconsProps = {
  title: string;
  description: string;
};

export const SimpleIconsPage: React.FC<SimpleIconsProps> = ({
  title,
  description
}) => (
  <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-900 text-white">
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-primary">
            {title}
          </h1>
          <p className="mt-1 text-xs text-zinc-300">{description}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-zinc-200 hover:bg-white/10"
        >
          <span className="material-symbols-rounded text-sm">arrow_back</span>
          Home
        </Link>
      </header>

      <section className="rounded-3xl border border-white/15 bg-zinc-900/70 p-6 text-sm text-zinc-200 shadow-md shadow-black/60">
        <p>
          The original icons pages are static previews. Here you can later plug
          in your generated icon grids. For now this page is a minimal remix
          that keeps routing and page structure in place.
        </p>
      </section>
    </div>
  </div>
);

