import React from 'react';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';

interface Props {
  onNext: () => void;
  key?: React.Key;
}

export function LogSummaryView({ onNext }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="pt-28 px-6 pb-12 max-w-7xl mx-auto min-h-screen relative"
    >
      <header className="mb-12">
        <div className="font-mono text-primary-cyan text-sm tracking-[0.3em] mb-4 uppercase">TRANSMISSION_COMPLETE // 0X-4491</div>
        <h1 className="font-clash text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">LOG_SUMMARY</h1>
        <div className="flex items-center gap-4 font-mono text-slate-400 text-sm">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-cyan"></span> SESSION_STABLE</span>
          <span className="opacity-30">|</span>
          <span>DURATION: 44:12:09</span>
          <span className="opacity-30">|</span>
          <span>NODES: 14_ACTIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-7">
        {/* Neural Latency Metrics */}
        <section className="col-span-12 lg:col-span-8 bg-surface-low p-8 rounded-none border-l-2 border-primary-cyan relative overflow-hidden">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="font-space text-2xl font-bold uppercase tracking-wide mb-1">NEURAL_LATENCY_FEED</h3>
              <p className="font-mono text-xs text-slate-400 uppercase">Real-time packet processing stability</p>
            </div>
            <Activity className="text-primary-cyan" />
          </div>
          
          <div className="h-48 flex items-end gap-1 mb-6">
            <motion.div initial={{ height: 0 }} animate={{ height: '50%' }} className="flex-1 bg-primary-cyan/20"></motion.div>
            <motion.div initial={{ height: 0 }} animate={{ height: '66%' }} className="flex-1 bg-primary-cyan/40"></motion.div>
            <motion.div initial={{ height: 0 }} animate={{ height: '25%' }} className="flex-1 bg-primary-cyan/10"></motion.div>
            <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="flex-1 bg-primary-cyan/60"></motion.div>
            <motion.div initial={{ height: 0 }} animate={{ height: '50%' }} className="flex-1 bg-primary-cyan/30"></motion.div>
            <motion.div initial={{ height: 0 }} animate={{ height: '75%' }} className="flex-1 bg-primary-cyan/50"></motion.div>
            <motion.div initial={{ height: 0 }} animate={{ height: '50%' }} className="flex-1 bg-primary-purple/40"></motion.div>
            <motion.div initial={{ height: 0 }} animate={{ height: '66%' }} className="flex-1 bg-primary-purple/60"></motion.div>
            <motion.div initial={{ height: 0 }} animate={{ height: '25%' }} className="flex-1 bg-primary-purple/20"></motion.div>
            <motion.div initial={{ height: 0 }} animate={{ height: '66%' }} className="flex-1 bg-primary-cyan/40"></motion.div>
            <motion.div initial={{ height: 0 }} animate={{ height: '25%' }} className="flex-1 bg-primary-cyan/10"></motion.div>
            <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="flex-1 bg-primary-cyan/60"></motion.div>
            <motion.div initial={{ height: 0 }} animate={{ height: '50%' }} className="flex-1 bg-primary-cyan/30"></motion.div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 font-mono">
            <div className="p-4 bg-surface-high">
              <div className="text-[10px] text-slate-400 uppercase mb-1">Avg Jitter</div>
              <div className="text-xl text-primary-cyan">0.42ms</div>
            </div>
            <div className="p-4 bg-surface-high">
              <div className="text-[10px] text-slate-400 uppercase mb-1">Packet Loss</div>
              <div className="text-xl text-primary-cyan">0.00%</div>
            </div>
            <div className="p-4 bg-surface-high">
              <div className="text-[10px] text-slate-400 uppercase mb-1">Neural Drift</div>
              <div className="text-xl text-primary-cyan">-0.004s</div>
            </div>
          </div>
        </section>

        {/* Clone Accuracy Metrics */}
        <section className="col-span-12 lg:col-span-4 bg-surface-low p-8 relative">
          <h3 className="font-space text-xl font-bold uppercase tracking-wide mb-8">CLONE_ACCURACY</h3>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-slate-400">TIMBRE_MATCH</span>
                <span className="text-primary-cyan">99.8%</span>
              </div>
              <div className="w-full h-1 bg-surface-high">
                <motion.div initial={{ width: 0 }} animate={{ width: '99.8%' }} transition={{ duration: 1 }} className="h-full bg-primary-cyan"></motion.div>
              </div>
            </div>
            <div>
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-slate-400">PHONEME_RESOLUTION</span>
                <span className="text-primary-cyan">98.2%</span>
              </div>
              <div className="w-full h-1 bg-surface-high">
                <motion.div initial={{ width: 0 }} animate={{ width: '98.2%' }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-primary-cyan"></motion.div>
              </div>
            </div>
            <div>
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-slate-400">EMOTIONAL_PROSODY</span>
                <span className="text-primary-purple">94.5%</span>
              </div>
              <div className="w-full h-1 bg-surface-high">
                <motion.div initial={{ width: 0 }} animate={{ width: '94.5%' }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-primary-purple"></motion.div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-10 border-t border-white/5">
            <div className="bg-[#1f1f1f] p-4 flex items-center gap-4">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHMLQJQmLX4IhTZrGp_UYZBFheYOzyiymtQ6ig8WHFRfFQzU9PxXSGBB679KTH0kbX4gzJrulxvIh6guYGJfALmpok4AmFTKUrrXyycUaahOCJkBj0pIUXZQB-YL130xA3lObE_nlw7v31DVTBGWdNktAKatndC-3g1pOmvNd3m6Tnu3ISn-EmhBmuDjWsEQOMeFuVamw2ZQB4wlWYndYedq14VQvJm282vleeiQSBGzXJ8winPg3TjxsRJzZMJApVwzrG8rjlkYY" alt="Audio Spectrogram" className="w-12 h-12 object-cover rounded-sm grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
              <div>
                <div className="font-mono text-[10px] text-slate-400">VOICE_ID</div>
                <div className="font-mono text-xs">V-ALPHA_PRIME</div>
              </div>
            </div>
          </div>
        </section>

        {/* Matrix Terminal Data Grid */}
        <section className="col-span-12 bg-[#0e0e0e] border border-white/5 p-0 overflow-hidden">
          <div className="bg-surface-low px-6 py-4 flex justify-between items-center border-b border-white/5">
            <span className="font-mono text-xs tracking-widest text-slate-400">DECRYPTED_TRANSLATION_FEED</span>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-red-500/50 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-500/50 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500/50 rounded-full"></div>
            </div>
          </div>
          <div className="font-mono text-xs p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            <div className="flex gap-8 group">
              <span className="text-slate-400 shrink-0 w-32">[14:22:01.09]</span>
              <span className="text-primary-cyan shrink-0 w-24">SOURCE_JP</span>
              <span className="text-white">システムの整合性を確認しました。</span>
              <span className="text-slate-400 italic opacity-0 group-hover:opacity-100 transition-opacity">--- System integrity confirmed.</span>
            </div>
            <div className="flex gap-8 group">
              <span className="text-slate-400 shrink-0 w-32">[14:22:04.55]</span>
              <span className="text-primary-cyan shrink-0 w-24">TARGET_EN</span>
              <span className="text-white">ALL NEURAL PATHWAYS ALIGNED FOR UPLINK.</span>
            </div>
            <div className="flex gap-8 group">
              <span className="text-slate-400 shrink-0 w-32">[14:22:12.18]</span>
              <span className="text-primary-cyan shrink-0 w-24">SOURCE_JP</span>
              <span className="text-white">プロトコル4を開始します。</span>
              <span className="text-slate-400 italic opacity-0 group-hover:opacity-100 transition-opacity">--- Initiating Protocol 4.</span>
            </div>
            <div className="flex gap-8 group">
              <span className="text-slate-400 shrink-0 w-32">[14:23:01.44]</span>
              <span className="text-primary-purple shrink-0 w-24">SYST_LOG</span>
              <span className="text-primary-purple opacity-80">ENCRYPTION LAYER APPLIED: AES-256 QUANTUM-RESISTANT</span>
            </div>
            <div className="flex gap-8 group">
              <span className="text-slate-400 shrink-0 w-32">[14:24:55.01]</span>
              <span className="text-primary-cyan shrink-0 w-24">SOURCE_JP</span>
              <span className="text-white">データの転送は成功しました。</span>
              <span className="text-slate-400 italic opacity-0 group-hover:opacity-100 transition-opacity">--- Data transfer successful.</span>
            </div>
            <div className="flex gap-8 group">
              <span className="text-slate-400 shrink-0 w-32">[14:25:00.00]</span>
              <span className="text-[#00716a] shrink-0 w-24">UPLINK_OFF</span>
              <span className="text-[#00716a]">SESSION_TERMINATED_BY_OPERATOR</span>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-12 flex flex-col md:flex-row gap-6 items-center justify-between py-12 border-t border-white/5">
        <div className="text-left">
          <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-1">Final Status</div>
          <div className="font-space text-xl font-bold">TRANSMISSION_ARCHIVED_SECURELY</div>
        </div>
        <div className="flex flex-wrap gap-4">
          <button className="bg-surface p-[1px] rounded-none group">
            <span className="block px-8 py-3 bg-surface text-white font-mono text-sm uppercase tracking-widest group-hover:bg-surface-low transition-all">EXPORT_LOGS</span>
          </button>
          <button onClick={onNext} className="bg-white text-black px-10 py-3 font-clash font-black uppercase text-sm tracking-tighter hover:bg-primary-cyan hover:text-[#003733] active:scale-95 transition-all">
            CLOSE_SESSION
          </button>
        </div>
      </footer>
    </motion.div>
  );
}
