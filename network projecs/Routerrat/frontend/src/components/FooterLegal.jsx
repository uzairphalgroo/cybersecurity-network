import React from 'react';

export default function FooterLegal({ onOpenLegal }) {
  return (
    <footer className="mt-12 py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#475569] z-50 relative">
      <div className="flex items-center gap-2">
        <span className="text-[#00f3ff] font-bold tracking-wider">ROUTERRAT</span> © {new Date().getFullYear()}
      </div>
      <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
        <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors uppercase tracking-widest">Terms of Service</button>
        <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors uppercase tracking-widest">Privacy Policy</button>
        <button onClick={() => onOpenLegal('license')} className="hover:text-white transition-colors uppercase tracking-widest">Open Source License</button>
        <button onClick={() => onOpenLegal('disclaimer')} className="hover:text-[#ff0055] transition-colors flex items-center gap-1 uppercase tracking-widest font-bold">
          Disclaimer
        </button>
      </div>
    </footer>
  );
}
