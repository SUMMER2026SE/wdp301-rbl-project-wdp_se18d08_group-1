import React from 'react';

export const TopNavBar = () => {
  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-outline-variant/15 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="text-primary-container font-headline text-2xl font-extrabold tracking-tighter">FCINEMA</span>
        <div className="hidden md:flex gap-6 items-center">
          <span className="text-on-surface font-label text-sm uppercase tracking-widest cursor-pointer hover:text-primary-container transition-colors">Movies</span>
          <span className="text-on-surface font-label text-sm uppercase tracking-widest cursor-pointer hover:text-primary-container transition-colors">Cinemas</span>
          <span className="text-on-surface font-label text-sm uppercase tracking-widest cursor-pointer hover:text-primary-container transition-colors">Offers</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-surface-container-lowest px-4 py-2 rounded-full flex items-center gap-2 border border-outline-variant/15">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
          <input
            className="bg-transparent border-none focus:outline-none text-sm w-48 text-on-surface"
            placeholder="Search"
            type="text"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-on-surface">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-container rounded-full"></span>
          </button>
          <img
            alt="User Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-primary-container/20"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzjZnHTMhxt0aD5wXnJ5vFh7k10EtwH2j2Ki6paNPn7wzgl3Hrn4H2nnQrKGEwhvDrU15TNr2q0XlkDMhjf54n0jMXwfbud2HvDLGJNI_Lv11Nb-2sR96H012J8FwEq6BrqAk1XRZraesIZqnVqMw95Jyh1k3bjoQw-ym_rGts0YUg7F0ufoGWOgQwk_rgEX0Swj6AZqPn2sWjoMyk3nQ9lWS-CtVx_cA6NoA3Ux7hClOY2TrMGZ5OPPKGqHMjRR6e-6eLiAVMTiQR"
          />
        </div>
      </div>
    </nav>
  );
};
