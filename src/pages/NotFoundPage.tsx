import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
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
    <div className="min-h-screen bg-[radial-gradient(800px_400px_at_10%_10%,rgba(56,189,248,0.18),transparent),radial-gradient(800px_400px_at_90%_90%,rgba(167,139,250,0.18),transparent)]">
      <div className="flex min-h-screen items-center justify-center bg-[url('/assets/img/web-preview.png')] bg-cover bg-center px-4">
        <div
          ref={cardRef}
          className="group"
          style={cardStyle}
        >
          <div
            className="relative w-[360px] overflow-hidden rounded-2xl bg-black/90 text-center text-white shadow-2xl transition-transform duration-150 ease-out after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(120deg,rgba(255,255,255,0.35),rgba(255,255,255,0)_45%)] after:opacity-0 after:transition-opacity after:duration-150 group-hover:after:opacity-100"
            style={{
              transform:
                "rotateX(var(--y-rotation)) rotateY(var(--x-rotation)) scale(var(--hover-scale))",
              transformStyle: "preserve-3d"
            }}
          >
            <div className="relative px-6 py-10">
              <div
                className="text-[96px] font-extrabold leading-none"
                style={{
                  backgroundImage: "url('/assets/img/seal.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent"
                }}
              >
                404
              </div>
              <p className="mt-2 text-sm text-zinc-300">Page not found</p>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/40 hover:bg-primary/90"
                >
                  Go home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
