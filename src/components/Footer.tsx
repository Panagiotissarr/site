import React from "react";

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 py-6">
      <p className="text-center text-sm text-zinc-500">
        &copy; {year} Panagiotis Sarris. All rights reserved.
      </p>
    </footer>
  );
};
