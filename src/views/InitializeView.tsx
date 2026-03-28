import React from 'react';
import { motion } from 'motion/react';

interface Props {
  onNext: () => void;
  key?: React.Key;
}

export function InitializeView({ onNext }: Props) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      <div className="mesh-gradient absolute inset-0"></div>
      
      <main className="relative z-20 flex flex-col items-center text-center px-6 max-w-7xl w-full">
        <motion.div 
          initial={{ filter: 'blur(12px)', opacity: 0, y: 10 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-12"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] text-primary-cyan/60 uppercase">
            System Status: Active // Protocol 0-0-1
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="font-clash text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter text-white uppercase relative mb-8"
        >
          SPEAK GLOBAL.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-cyan to-primary-purple">SOUND LOCAL.</span>
        </motion.h1>

        <motion.p 
          initial={{ filter: 'blur(12px)', opacity: 0, y: 10 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl text-lg md:text-xl text-slate-300 font-inter mb-16 leading-relaxed"
        >
          The world's first neural translation layer that preserves your unique vocal signature while bridging 140+ linguistic barriers in real-time.
        </motion.p>

        <motion.div 
          initial={{ filter: 'blur(12px)', opacity: 0, y: 10 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <button 
            onClick={onNext}
            className="group relative px-12 py-5 bg-[#0e0e0e] overflow-hidden transition-all duration-500 active:scale-95"
          >
            <span className="relative z-10 font-mono text-sm tracking-widest text-white font-bold group-hover:tracking-[0.3em] transition-all duration-500">
              INITIALIZE SEQUENCE
            </span>
            <div className="absolute inset-0 bg-primary-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>
        </motion.div>

        {/* Decorative Data Elements */}
        <div className="fixed bottom-12 left-12 hidden lg:flex flex-col space-y-2 font-mono text-[9px] text-slate-600 text-left uppercase">
          <div>Latitude: 40.7128° N</div>
          <div>Longitude: 74.0060° W</div>
          <div>Packet Loss: 0.0003%</div>
        </div>
        <div className="fixed bottom-12 right-12 hidden lg:flex flex-col space-y-2 font-mono text-[9px] text-slate-600 text-right uppercase">
          <div className="flex items-center justify-end gap-2">
            <span className="w-1 h-1 bg-primary-cyan animate-pulse"></span>
            Encryption: AES-256 Quantum
          </div>
          <div>Neural Load: 12.4 TFLOPS</div>
          <div>Version: 2.0.4-Stable</div>
        </div>
      </main>

      {/* Side Decoration */}
      <div className="fixed top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-primary-cyan/20 to-transparent"></div>
      <div className="fixed top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-primary-purple/20 to-transparent"></div>
    </div>
  );
}
