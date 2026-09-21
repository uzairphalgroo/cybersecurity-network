import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, GraduationCap, Map, Network, Zap, ShieldCheck } from 'lucide-react';

export default function EducationalGuide() {
  const [activeTab, setActiveTab] = useState('how-to');

  const terms = [
    {
      term: "BGP (Border Gateway Protocol)",
      emoji: "🗺️",
      simple: "The Internet's Post Office Map.",
      explanation: "Imagine the internet is a giant city, and networks (like your internet provider) are different neighborhoods. BGP is the map that mailmen use to figure out the fastest way to deliver your mail (data) from one neighborhood to another."
    },
    {
      term: "ASN (Autonomous System Number)",
      emoji: "🏠",
      simple: "A Neighborhood Zip Code (e.g. AS37721).",
      explanation: "Just like every town has a unique zip code so mail doesn't get lost, every big network on the internet has a unique ASN. Google has one (AS15169), Cloudflare has one (AS13335), and smaller ISPs might be AS37721. It helps BGP know exactly where to send the data."
    },
    {
      term: "Route Flapping",
      emoji: "🦋",
      simple: "A Confused GPS.",
      explanation: "Have you ever used Google Maps and it keeps switching between two different roads every second? That's route flapping! It happens when a network's connection is unstable, so it keeps telling the internet 'I'm here!', then 'No I'm not!', then 'I'm here again!'"
    },
    {
      term: "Prefix Hijacking",
      emoji: "🦹",
      simple: "Stealing someone's mail route.",
      explanation: "Imagine a bad guy puts up a fake road sign that says 'Disney World this way!' and tricks all the cars to go to his house instead. On the internet, a hacker can announce they own a network they don't, stealing all the data meant for the real owner!"
    },
    {
      term: "RPKI & ROA",
      emoji: "🛡️",
      simple: "The Digital Passport.",
      explanation: "RPKI (Resource Public Key Infrastructure) and ROA (Route Origin Authorization) act like a passport and visa. They cryptographically prove that an ASN is actually allowed to announce a specific IP route, preventing hijacks from succeeding!"
    },
    {
      term: "Blast Radius",
      emoji: "💥",
      simple: "How many people got lost?",
      explanation: "If a bridge breaks on the highway, a certain number of cars will get stuck. The blast radius calculates exactly how many networks and users are affected when a route flaps or gets hijacked."
    }
  ];

  return (
    <div className="glass-panel p-8 mt-12 relative overflow-hidden group">
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff00ff]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#ff00ff]/10 transition-colors duration-1000"></div>

      <div className="flex flex-col md:flex-row items-center gap-8 mb-8 relative z-10 border-b border-white/10 pb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-syne font-bold flex items-center gap-3 text-white mb-2">
            <BookOpen className="w-6 h-6 text-[#ff00ff]" />
            NOC Training Manual
          </h2>
          <p className="text-sm font-mono text-[#94a3b8]">Interactive learning module for Network Operations Center operators.</p>
        </div>

        <div className="flex bg-[#02040a]/80 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('how-to')}
            className={`px-6 py-2 rounded-lg font-mono text-sm transition-colors ${activeTab === 'how-to' ? 'bg-[#ff00ff]/20 text-[#ff00ff]' : 'text-[#94a3b8] hover:text-white'}`}
          >
            How to Use RouterRat
          </button>
          <button 
            onClick={() => setActiveTab('bgp-101')}
            className={`px-6 py-2 rounded-lg font-mono text-sm flex items-center gap-2 transition-colors ${activeTab === 'bgp-101' ? 'bg-[#ff007f]/20 text-[#ff007f]' : 'text-[#94a3b8] hover:text-white'}`}
          >
            <GraduationCap className="w-4 h-4" /> 
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{
                backgroundSize: '200% auto',
                backgroundImage: 'linear-gradient(to right, #ff007f, #00f3ff, #ff00ff, #ff007f)',
                WebkitBackgroundClip: 'text',
                color: activeTab === 'bgp-101' ? 'transparent' : 'inherit',
              }}
            >
              BGP Basics
            </motion.span>
          </button>
        </div>
      </div>

      <div className="relative z-10 min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'how-to' && (
            <motion.div
              key="how-to"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#00f3ff]/50 transition-colors">
                <Network className="w-8 h-8 text-[#00f3ff] mb-4" />
                <h3 className="font-syne font-bold text-white text-lg mb-2">1. Threat Map & Topology</h3>
                <p className="text-sm font-mono text-[#94a3b8] leading-relaxed">
                  Use the dropdown at the top right to select a target network. The 3D Earth globe will plot physical geographical traffic routes, and the AS-Path Topology graph will show the hop-by-hop logical path.
                </p>
              </div>

              <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#ff007f]/50 transition-colors">
                <Zap className="w-8 h-8 text-[#ff007f] mb-4" />
                <h3 className="font-syne font-bold text-white text-lg mb-2">2. Outage Replay Mode</h3>
                <p className="text-sm font-mono text-[#94a3b8] leading-relaxed">
                  Click Flap, Surge, or Hijack! Use the Playback Scrubber at the bottom of the screen to rewind and fast-forward through historical BGP outages. Watch the globe arcs and stability charts change in real-time.
                </p>
              </div>

              <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#ff00ff]/50 transition-colors">
                <ShieldCheck className="w-8 h-8 text-[#ff00ff] mb-4" />
                <h3 className="font-syne font-bold text-white text-lg mb-2">3. Cyber Audio Controls</h3>
                <p className="text-sm font-mono text-[#94a3b8] leading-relaxed">
                  The dashboard features immersive, synthesized cyberpunk audio effects built directly into the UI! You can easily toggle the master sound on or off using the speaker button in the top navigation bar.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'bgp-101' && (
            <motion.div
              key="bgp-101"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {terms.map((item, idx) => (
                <div key={idx} className="p-5 bg-[#02040a]/60 rounded-xl border border-[#ff007f]/20 hover:bg-[#ff007f]/5 transition-colors flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-[#ff007f]/10 text-3xl">
                    {item.emoji}
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-white text-xl flex items-center gap-3">
                      {item.term}
                      <span className="px-3 py-1 rounded-full bg-[#00f3ff]/10 text-[#00f3ff] text-xs font-mono tracking-widest uppercase">
                        {item.simple}
                      </span>
                    </h3>
                    <p className="text-sm font-mono text-[#94a3b8] mt-3 leading-relaxed max-w-4xl">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
