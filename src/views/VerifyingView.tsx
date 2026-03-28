import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle } from 'lucide-react';

interface Props {
  onNext: () => void;
  key?: React.Key;
}

export function VerifyingView({ onNext }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onNext, 500); // Transition after a short delay when reaching 100%
          return 100;
        }
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [onNext]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-surface text-white flex flex-col justify-center items-center relative overflow-hidden"
    >
      {/* Mesh Gradient Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-cyan/5 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary-purple/5 blur-[120px] pointer-events-none"></div>

      {/* Top Navigation Anchor */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 z-50 border-b border-primary-cyan/10 bg-surface">
        <div className="text-2xl font-black uppercase tracking-tighter text-primary-cyan font-clash">BABELROOM</div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] tracking-widest text-primary-cyan/40 uppercase hidden md:inline">System Status: Active</span>
          <HelpCircle size={24} className="text-primary-cyan cursor-pointer hover:text-white transition-colors" />
        </div>
      </header>

      {/* Main Content: Immersive Loading State */}
      <main className="relative z-20 flex flex-col items-center justify-center text-center px-4 w-full">
        {/* Loading Header */}
        <h1 className="font-clash text-4xl md:text-7xl font-black uppercase tracking-tighter mb-12 text-white">
          VERIFYING BIOMETRICS
        </h1>

        {/* Central Interactive Aura Area */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Background Aura Pulse Layers */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(0,255,240,0.2)_0%,_rgba(119,1,208,0.1)_50%,_rgba(19,19,19,0)_70%)] blur-[40px] scale-110"
          ></motion.div>
          <motion.div 
            animate={{ scale: [0.9, 1, 0.9], opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(0,255,240,0.2)_0%,_rgba(119,1,208,0.1)_50%,_rgba(19,19,19,0)_70%)] blur-[40px] scale-90"
          ></motion.div>

          {/* Distorted Glowing Cloud Effect */}
          <div className="absolute w-64 h-64 rounded-full bg-primary-cyan/20 blur-[60px]"></div>
          <div className="absolute w-48 h-48 rounded-full bg-primary-purple/30 blur-[40px]"></div>

          {/* Loading Percentage Text Container */}
          <div className="relative z-30 p-8">
            <p className="font-mono text-lg md:text-xl font-bold tracking-tighter shimmer-text">
              [ AUTH_PROTOCOL_ALPHA: {Math.min(progress, 100)}% ]
            </p>
            {/* Scanning Trace Lines */}
            <motion.div 
              animate={{ y: [-50, 50, -50] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute top-1/2 left-0 w-full h-[1px] bg-primary-cyan/30 blur-[2px]"
            ></motion.div>
          </div>

          {/* Decorative Frame Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-cyan/50"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary-cyan/50"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary-cyan/50"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-cyan/50"></div>
        </div>

        {/* System Logs / Metadata */}
        <div className="mt-16 max-w-lg w-full">
          <div className="bg-surface-low p-6 border border-white/5 backdrop-blur-xl relative">
            <div className="flex flex-col gap-2 text-left relative z-10">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-mono text-[10px] text-primary-cyan/40 uppercase">Origin</span>
                <span className="font-mono text-[10px] text-white uppercase">Satellite_Uplink_Node_04</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-mono text-[10px] text-primary-cyan/40 uppercase">Encryption</span>
                <span className="font-mono text-[10px] text-white uppercase">Quantum_2048_Bit</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-primary-cyan/40 uppercase">Latency</span>
                <span className="font-mono text-[10px] text-primary-cyan uppercase">12ms</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Visual Texture / Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <img 
          className="w-full h-full object-cover grayscale mix-blend-screen" 
          alt="Abstract deep space technical grid" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdDerKZ1fNVT9zkIbswj4eETObwAguBCdq2Kz6Xau3Q1tqFgrit3qVIikDXG9Aq6qNa95gyCWTh4U-43dcSQedKcyx95YIvevyzdSlCqYlaAio7BFCtQGB4i9964JWCfeRQygVhdXau3LqP2a9NYhW6PYIGsISJqYy_G73pl1QJNF_1IytSY2NJyyRiFOFCEAT906Z6jS8U60613020I4vrMuuubb0PXDFcEc17MKdcOpffLls7YriUkF7KNYCo4UFwEVjGa9Dmyc"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Footer Terminal Info */}
      <footer className="fixed bottom-0 w-full flex flex-col md:flex-row justify-between items-center px-8 py-4 z-50 border-t border-white/5 bg-surface gap-4 md:gap-0">
        <div className="font-mono text-[10px] tracking-widest uppercase text-slate-500">
          © 2024 BABELROOM TERMINAL. ALL RIGHTS RESERVED.
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          <a className="font-mono text-[10px] tracking-widest uppercase text-slate-500 hover:text-primary-cyan transition-colors cursor-pointer">Privacy Policy</a>
          <a className="font-mono text-[10px] tracking-widest uppercase text-slate-500 hover:text-primary-cyan transition-colors cursor-pointer">Terms of Service</a>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-cyan shadow-[0_0_8px_#00FFF0]"></div>
            <span className="font-mono text-[10px] tracking-widest uppercase text-primary-cyan">Security Status: Locked</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
