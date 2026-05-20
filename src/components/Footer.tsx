import React from "react";

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-6">
      <p className="text-left text-xs text-zinc-500">
        &copy; {year} Panagiotis Sarris. All rights reserved.
      </p>
    </footer>
  );
};
