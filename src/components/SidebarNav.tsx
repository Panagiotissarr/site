import React from "react";

const links = [
  { id: "home-nav", href: "#intro", label: "Home", icon: "home" },
  { id: "sitemap-nav", href: "#sitemap", label: "Sitemap", icon: "data_object" },
  { id: "about-nav", href: "#about-me", label: "About", icon: "face" },
  { id: "contact-nav", href: "#contact", label: "Contact", icon: "chat_bubble" }
];

export const SidebarNav: React.FC = () => {
  return (
    <>
      {/* Desktop sidebar */}
      <nav
        id="nav"
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:block"
      >
        <ul className="flex flex-col gap-1 rounded-magic-out bg-white/10 backdrop-blur-xl p-1">
          {links.map((link) => (
            <li key={link.id}>
              <a
                id={link.id}
                href={link.href}
                className="group flex size-12 flex-col items-center justify-center gap-0.5 rounded-magic-in text-xs text-zinc-200 transition hover:bg-primary hover:text-white"
                data-title={link.label}
              >
                <span className="material-symbols-rounded text-lg">
                  {link.icon}
                </span>
                <span className="opacity-70 group-hover:opacity-100">
                  {link.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
        <ul className="flex items-center justify-between rounded-full bg-zinc-900/90 px-3 py-2 shadow-xl shadow-black/60 backdrop-blur-xl border border-white/10">
          {links.map((link) => (
            <li key={`mobile-${link.id}`} className="flex-1">
              <a
                href={link.href}
                className="hover-state flex flex-col items-center justify-center gap-0.5 text-[10px] text-zinc-300"
                data-title={link.label}
              >
                <span className="material-symbols-rounded text-lg">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

