import React from "react";

export const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="space-y-6">
      <div className="inline-flex items-center rounded-magic-out bg-white/5 px-4 py-2 text-sm text-primary shadow-md shadow-primary/20">
        <span className="material-symbols-rounded mr-2 text-base">mail</span>
        Contact
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <p className="text-sm text-zinc-300">
          Want to say hi or collaborate on something interesting?
        </p>
        <a
          id="email-btn"
          href="mailto:mail@sarris.dev"
          className="inline-flex items-center gap-2 rounded-magic-out border border-white/20 bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/40 transition hover:-translate-y-0.5 hover:bg-primary/90"
          data-title="Send an email"
        >
          <span className="material-symbols-rounded text-base">email</span>
          <span>Send an email</span>
        </a>
      </div>
      <p className="text-left text-xs text-zinc-500">
        &copy; {new Date().getFullYear()} Panagiotis Sarris. All rights reserved.
      </p>
    </section>
  );
};

