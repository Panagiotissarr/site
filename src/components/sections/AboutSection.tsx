import React, { useState, useEffect } from "react";

export const AboutSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section id="about-me" className="space-y-8">
      <h2 className="inline-flex items-center rounded-magic-out bg-white/5 px-4 py-2 text-sm text-primary shadow-md shadow-primary/20">
        <span className="material-symbols-rounded mr-2 text-base">
          sentiment_satisfied
        </span>
        About Me
      </h2>

      <div className="grid gap-10 lg:grid-cols-[1.7fr,1.3fr]">
        <p className="max-w-xl text-justify text-sm leading-relaxed text-zinc-200">
Hey there! i am well... Panagiotis! Welcome to my Portfollio.
        </p>

        <table className="w-full text-sm text-left text-zinc-200/90">
          <tbody>
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4 font-semibold text-primary">Name</td>
              <td className="py-2">Panagiotis Sarris</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4 font-semibold text-primary">Age</td>
              <td className="py-2">10</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-semibold text-primary">Location</td>
              <td className="py-2">Central Greece, Nea Artaki</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-6">
        <a
          href="https://github.com/panagiotissarr/"
          target="_blank"
          rel="noreferrer"
          className="hover-state inline-flex w-fit self-center"
          data-title="GitHub"
        >
          <img
            src={`https://skillicons.dev/icons?i=arch,windows,apple,python,figma,github,obsidian,photoshop,premiere,vercel,vscode,neovim&theme=dark&perline=${isMobile ? "3" : "15"}`}
            alt="Pana's Skills"
            className="max-w-full rounded-magic-out border border-white/10 bg-black/40 p-2"
          />
        </a>

        <a
          href="https://git.io/streak-stats"
          target="_blank"
          rel="noreferrer"
          className="hover-state inline-flex w-fit self-center"
          data-title="GitHub stats"
        >
          <img
            src="https://github-readme-stats.vercel.app/api?username=panagiotissarr&show_icons=true&count_private=true&theme=transparent&hide_border=true&hide_title=true"
            alt="GitHub Streak"
            className="max-w-full rounded-magic-out border border-white/10 bg-black/40 p-3"
            data-title="GitHub stats"
          />
        </a>
      </div>
    </section>
  );
};
