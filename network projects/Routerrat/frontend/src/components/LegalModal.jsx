import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, FileText, Lock, AlertTriangle } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'terms' }) {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  React.useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'license', label: 'Open Source License', icon: ShieldAlert },
    { id: 'disclaimer', label: 'Liability Disclaimer', icon: AlertTriangle }
  ];

  const content = {
    terms: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">Terms of Service</h3>
        <p>Welcome to RouterRat. By accessing this platform, you agree to comply with these terms.</p>
        <p>This tool is provided "as is" for network observability and educational purposes only.</p>
      </div>
    ),
    privacy: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">Security & Privacy Policy</h3>
        <p>RouterRat processes public BGP routing data (RIS Live). No personal user data is collected, stored, or sold.</p>
        <p>Telemetry data is transient and visualized solely for real-time monitoring.</p>
      </div>
    ),
    license: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">MIT License (Open Source)</h3>
        <p>Copyright (c) 2026 RouterRat</p>
        <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
        <p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
        <p className="uppercase text-white/50">THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...</p>
      </div>
    ),
    disclaimer: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#ff0055] mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Strict Liability Disclaimer
        </h3>
        <p className="text-white">RouterRat is an open-source educational tool designed for analyzing Border Gateway Protocol (BGP) anomalies.</p>
        <div className="p-4 bg-[#ff0055]/10 border border-[#ff0055]/30 rounded-lg">
          <p className="text-[#ff0055] font-bold uppercase tracking-wider leading-relaxed">
            The creators, contributors, and maintainers of RouterRat are NOT responsible for any misuse of this software.
          </p>
        </div>
        <p>This tool shall not be used for malicious network reconnaissance, attacking infrastructure, or illegal monitoring. Users are solely liable for their actions and legal compliance.</p>
      </div>
    )
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#02040a]/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col border border-white/20 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-syne font-bold text-white">Legal & Compliance</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-64 border-r border-white/10 bg-black/20 p-2 flex flex-row md:flex-col gap-1 overflow-x-auto custom-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm font-mono whitespace-nowrap transition-colors ${
                    isActive 
                      ? tab.id === 'disclaimer' 
                        ? 'bg-[#ff0055]/20 text-[#ff0055]' 
                        : 'bg-[#00f3ff]/20 text-[#00f3ff]'
                      : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar text-[#94a3b8] font-mono text-sm leading-relaxed">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {content[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
