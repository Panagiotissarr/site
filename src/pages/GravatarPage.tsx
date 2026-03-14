import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export const GravatarPage: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardStyle = {
    perspective: "1000px",
    WebkitPerspective: "1000px",
    "--x-rotation": "0deg",
    "--y-rotation": "0deg",
    "--hover-scale": "1"
  } as React.CSSProperties;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMove = (event: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxTilt = 8;

      const rotateX = ((x - centerX) / centerX) * maxTilt;
      const rotateY = -((y - centerY) / centerY) * maxTilt;

      card.style.setProperty("--x-rotation", `${rotateX}deg`);
      card.style.setProperty("--y-rotation", `${rotateY}deg`);
    };

    const handleEnter = () => {
      card.style.setProperty("--hover-scale", "1.03");
    };

    const handleLeave = () => {
      card.style.setProperty("--x-rotation", "0deg");
      card.style.setProperty("--y-rotation", "0deg");
      card.style.setProperty("--hover-scale", "1");
    };

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseenter", handleEnter);
    card.addEventListener("mouseleave", handleLeave);

    return () => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseenter", handleEnter);
      card.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[url('https://2.gravatar.com/bg/248931595/156d264684691a181023e71ae7b6240a')] bg-cover bg-center">
      <div className="flex min-h-screen items-center justify-center bg-black/60 px-4">
        <div className="relative w-[360px] font-sans text-white">
          <div className="mb-4 flex items-center justify-between text-xs text-zinc-300">
            <span>Gravatar hovercard - dark remix</span>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] hover:bg-white/20"
            >
              <span className="material-symbols-rounded text-xs">arrow_back</span>
              Home
            </Link>
          </div>

          <div
            ref={cardRef}
            className="group"
            style={cardStyle}
          >
            <div
              className="relative overflow-hidden rounded-2xl bg-black/90 shadow-2xl transition-transform duration-150 ease-out after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(120deg,rgba(255,255,255,0.35),rgba(255,255,255,0)_45%)] after:opacity-0 after:transition-opacity after:duration-150 group-hover:after:opacity-100"
              style={{
                transform:
                  "rotateX(var(--y-rotation)) rotateY(var(--x-rotation)) scale(var(--hover-scale))",
                transformStyle: "preserve-3d"
              }}
            >
              <div
                className="h-36 w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://panagiotis2211.wordpress.com/wp-content/uploads/2026/01/lock-screen.jpg')"
                }}
              />

              <div className="flex items-center gap-3 px-4 py-4">
                <a
                  href="https://sarris.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0"
                >
                  <img
                    className="h-16 w-16 rounded-full border-2 border-primary object-cover"
                    src="https://0.gravatar.com/avatar/5ac5c683bd1d7bc0aca4d10d0c795f5481a398e0489f83c017051a09309c3e7a?s=256&d=initials"
                    alt="Avatar"
                  />
                </a>
                <a
                  href="https://sarris.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="space-y-0.5"
                >
                  <h4 className="text-sm font-semibold">Panagiotis Sarris</h4>
                  <p className="text-xs text-zinc-400">Greece</p>
                </a>
              </div>

              <div className="px-4 pb-4 text-sm">
                <p>Hey I'm Panagiotis, nice to meet ya!</p>
              </div>

              <div className="flex gap-3 px-4 pb-4">
                <a
                  href="https://github.com/panagiotissarr/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    className="h-7 w-7 invert"
                    src="https://s.gravatar.com/icons/github.svg"
                    alt="GitHub"
                  />
                </a>
                <a
                  href="https://pinterest.com/panagiotissarr/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    className="h-7 w-7 invert"
                    src="https://s.gravatar.com/icons/pinterest.svg"
                    alt="Pinterest"
                  />
                </a>
              </div>

              <div className="flex items-center justify-between bg-black px-4 py-3 text-xs text-zinc-300">
                <a
                  href="https://sarris.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  sarris.dev
                </a>
                <a
                  href="https://gravatar.com/panagiotissarr/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  View gravatar profile
                </a>
              </div>

              <div className="h-1 w-full bg-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
