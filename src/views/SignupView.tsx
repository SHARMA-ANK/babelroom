import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle } from 'lucide-react';

interface Props {
  onNext: () => void;
  key?: React.Key;
}

export function SignupView({ onNext }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-surface text-white flex flex-col items-center justify-center relative overflow-hidden selection:bg-primary-cyan/30 selection:text-primary-cyan"
    >
      <div className="mesh-gradient absolute inset-0 pointer-events-none z-0"></div>
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 z-50 border-b border-primary-cyan/10 bg-surface/40 backdrop-blur-md">
        <div className="text-2xl font-black uppercase tracking-tighter text-primary-cyan font-clash">BABELROOM</div>
        <div className="flex items-center gap-4 text-slate-500 font-inter">
          <HelpCircle size={24} className="cursor-pointer hover:text-white transition-colors" />
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center justify-center">
        {/* Center Identity Card */}
        <motion.div 
          initial={{ filter: 'blur(20px)', opacity: 0, scale: 0.98 }}
          animate={{ filter: 'blur(0px)', opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-white/5 backdrop-blur-2xl p-12 md:p-24 rounded-none border border-white/5 flex flex-col items-center text-center space-y-12"
        >
          <div className="space-y-4">
            <h1 className="font-clash text-5xl md:text-8xl font-bold tracking-tighter leading-none text-white uppercase">
              INITIALIZE IDENTITY
            </h1>
            <p className="font-inter text-slate-400 text-lg md:text-xl max-w-xl mx-auto tracking-wide">
              Link your neural signature via Google to begin transmission.
            </p>
          </div>

          {/* Massive CTA Button */}
          <button 
            onClick={onNext}
            className="group relative flex items-center justify-center gap-6 px-12 py-8 w-full max-w-md transition-all duration-500 active:scale-95 bg-surface"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-sm shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
              </svg>
            </div>
            <span className="font-inter font-bold text-xl md:text-2xl text-white tracking-[0.05em] uppercase group-hover:tracking-[0.15em] transition-all duration-500">
              CONTINUE WITH GOOGLE
            </span>
          </button>

          {/* Decorative Data Trace */}
          <div className="w-full flex items-center justify-between font-mono text-[10px] text-primary-cyan opacity-40 uppercase tracking-[0.2em] pt-8 border-t border-white/10">
            <span>PROTOCOL: SECURE_AUTH_V4</span>
            <span>STATUS: READY_FOR_UPLINK</span>
            <span>LATENCY: 12ms</span>
          </div>
        </motion.div>

        {/* Translation engine visualization snippet (Bento logic) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-1 mt-1 w-full"
        >
          <div className="bg-surface-low p-4 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            <span className="text-primary-cyan mr-2">01</span> Neural_Encryption_Active
          </div>
          <div className="bg-surface-low p-4 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            <span className="text-primary-cyan mr-2">02</span> Bio_Metric_Sync_Waiting
          </div>
          <div className="bg-surface-low p-4 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            <span className="text-primary-cyan mr-2">03</span> Quantum_Key_Generated
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full flex flex-col md:flex-row justify-between items-center px-8 py-4 z-50 border-t border-white/5 bg-surface/60 backdrop-blur-sm gap-4 md:gap-0">
        <div className="font-mono text-[10px] tracking-widest uppercase text-slate-500 text-center md:text-left">
          By proceeding, you agree to the Protocol Terms of Service.
        </div>
        <div className="flex gap-8 font-mono text-[10px] tracking-widest uppercase">
          <a className="text-slate-500 hover:text-primary-cyan transition-colors cursor-pointer">Privacy Policy</a>
          <a className="text-slate-500 hover:text-primary-cyan transition-colors cursor-pointer">Security Status</a>
        </div>
        <div className="hidden md:block font-mono text-[10px] text-slate-500">
          © 2024 BABELROOM TERMINAL. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </motion.div>
  );
}
