import React from "react";
import { Link } from "react-router-dom";

const devices = [
  {
    id: "laptop",
    title: "Microsoft Surface Go 3 Laptop",
    img: "/assets/img/edc/Laptop.png",
    specs: [
      "CPU: 12-core Intel i5",
      "Memory: 8GB",
      "Storage: 256GB Samsung NVMe",
      "OS: Windows 11 25H2",
      "Color: Silver Gray"
    ]
  },
  {
    id: "ipad",
    title: "Apple iPad 9th gen",
    img: "/assets/img/edc/iPad.png",
    specs: [
      "Specs:",
      "Memory: 3 GB",
      "Storage: 256 GB",
      "OS: iPadOS 27 - Developer Beta",
      "Color: Space black"
    ]
  },
  {
    id: "keyboard",
    title: "NuPhy Air60 60%",
    img: "/assets/img/edc/Keyboard.png",
    specs: [
      "Switches: nSA PC Keycaps (White)",
      "Keycaps: Red 2.0",
      "Backlight: RGB backlight",
      "Connectivity: Wired, Wireless"
    ]
  },
  {
    id: "headphones",
    title: "JBL Tune 150bt",
    img: "/assets/img/edc/Headphones.png",
    specs: [
      "Connectivity: Bluetooth 5.0",
      "Charging: USB-C",
      "Color: White"
    ]
  }
];

export const EdcSetupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-900 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 md:px-8">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/img/Thums/edc.jpeg"
                alt="EDC logo"
                className="h-14 w-14 rounded-2xl border border-white/20 bg-white/10 p-1.5"
              />
              <div>
                <h1 className="font-display text-3xl md:text-4xl">
                  <span className="text-primary">EDC</span> Setup
                </h1>
                <p className="text-xs text-zinc-300">
                  All my Everyday Carry & setup details together so you can get
                  inspired or improve your own setup.
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

        <section className="relative space-y-8">

          {devices.map((device) => (
            <article
              key={device.id}
              className="relative grid gap-6 rounded-3xl border border-white/15 bg-zinc-900/70 p-5 shadow-md shadow-black/60 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)]"
            >
              <div className="flex items-center justify-center">
                <img
                  src={device.img}
                  alt={device.title}
                  className="max-h-56 w-full max-w-xs rounded-2xl border border-white/15 bg-black/40 object-contain p-4"
                />
              </div>
              <div className="flex flex-col justify-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{device.title}</h2>
                  <p className="mt-1 text-xs text-zinc-400">
                    Daily essentials, tuned for comfort and flow.
                  </p>
                </div>
                <ul className="grid gap-2 text-sm text-zinc-200">
                  {device.specs.map((spec) => (
                    <li key={spec} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>

        <p className="text-left text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Panagiotis Sarris. All rights reserved.
        </p>
      </div>
    </div>
  );
};
