import React from 'react';
import { Terminal, Database, Network, Lock, Settings, UserCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  setView: (view: string) => void;
  currentView: string;
}

export function Layout({ children, setView, currentView }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface text-gray-200 font-inter selection:bg-primary-cyan/30 selection:text-primary-cyan">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 py-3 bg-surface-low/60 backdrop-blur-2xl rounded-xl mt-4 mx-auto max-w-5xl border border-white/10 shadow-[0_0_20px_rgba(0,255,240,0.1)]">
        <div className="font-clash font-black tracking-tighter text-2xl text-primary-cyan cursor-pointer" onClick={() => setView('INITIALIZE')}>
          BABELROOM
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <button onClick={() => setView('COMMAND')} className={`font-space uppercase tracking-widest text-sm transition-colors ${currentView === 'COMMAND' ? 'text-primary-cyan border-b-2 border-primary-cyan pb-1' : 'text-slate-400 hover:text-white'}`}>TRANSMIT</button>
          <button onClick={() => setView('LOG_SUMMARY')} className={`font-space uppercase tracking-widest text-sm transition-colors ${currentView === 'LOG_SUMMARY' ? 'text-primary-cyan border-b-2 border-primary-cyan pb-1' : 'text-slate-400 hover:text-white'}`}>HISTORY</button>
          <button className="font-space uppercase tracking-widest text-sm text-slate-400 hover:text-white transition-colors">NODES</button>
        </nav>
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-primary-cyan transition-colors">
            <Settings size={20} />
          </button>
          <button className="text-slate-400 hover:text-primary-cyan transition-colors">
            <UserCircle size={20} />
          </button>
        </div>
      </header>

      {/* Side Navigation */}
      <aside className="fixed left-0 top-0 h-full flex flex-col pt-24 pb-8 w-64 border-r border-white/5 bg-surface z-30 hidden xl:flex">
        <div className="px-6 mb-12">
          <h2 className="font-clash text-xl font-bold text-white uppercase tracking-tight">OPERATOR_01</h2>
          <p className="font-mono text-[10px] text-primary-cyan/60 tracking-widest mt-1">V-LEVEL ACCESS</p>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          <button onClick={() => setView('COMMAND')} className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-300 font-mono text-xs uppercase ${currentView === 'COMMAND' ? 'bg-surface-low text-primary-cyan border-l-4 border-primary-cyan' : 'text-slate-500 hover:bg-surface-low hover:text-slate-200 border-l-4 border-transparent'}`}>
            <Terminal size={18} /> Terminal
          </button>
          <button onClick={() => setView('LOG_SUMMARY')} className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-300 font-mono text-xs uppercase ${currentView === 'LOG_SUMMARY' ? 'bg-surface-low text-primary-cyan border-l-4 border-primary-cyan' : 'text-slate-500 hover:bg-surface-low hover:text-slate-200 border-l-4 border-transparent'}`}>
            <Database size={18} /> Archive
          </button>
          <button onClick={() => setView('LIVE_LINK')} className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-300 font-mono text-xs uppercase ${currentView === 'LIVE_LINK' ? 'bg-surface-low text-primary-cyan border-l-4 border-primary-cyan' : 'text-slate-500 hover:bg-surface-low hover:text-slate-200 border-l-4 border-transparent'}`}>
            <Network size={18} /> Network
          </button>
          <button onClick={() => setView('CALIBRATION')} className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-300 font-mono text-xs uppercase ${currentView === 'CALIBRATION' ? 'bg-surface-low text-primary-cyan border-l-4 border-primary-cyan' : 'text-slate-500 hover:bg-surface-low hover:text-slate-200 border-l-4 border-transparent'}`}>
            <Lock size={18} /> Secure
          </button>
        </nav>
        <div className="px-6">
          <button onClick={() => setView('INITIALIZE')} className="w-full bg-primary-cyan text-[#003733] py-3 font-mono text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
            INITIATE_LINK
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="xl:ml-64 min-h-screen relative">
        {children}
      </main>
    </div>
  );
}
