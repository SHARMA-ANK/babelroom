import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Share2, Languages, ChevronRight } from 'lucide-react';
import { Joyride, STATUS, Step } from 'react-joyride';

interface Props {
  onNext: () => void;
  setTargetLang: (lang: string) => void;
  setRoomId: (id: string) => void;
  targetLang: string;
  roomId: string;
  userProfile?: any;
  key?: React.Key;
}

export function CommandView({ onNext, setTargetLang, setRoomId, targetLang, roomId, userProfile }: Props) {
  const [inputRoomId, setInputRoomId] = useState(roomId || '');

  const handleJoin = () => {
    if (!inputRoomId.trim()) return;
    setRoomId(inputRoomId.trim().toUpperCase());
    onNext();
  };

  const handleInstant = () => {
    const newId = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    setRoomId(newId);
    onNext();
  };

  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('babelroom_tour_cmd')) {
      localStorage.setItem('babelroom_tour_cmd', 'true');
      setTimeout(() => setRunTour(true), 1000);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      localStorage.setItem('babelroom_tour_cmd', 'true');
      setRunTour(false);
    }
  };

  const steps: any[] = [
    {
      target: '.tour-target-lang',
      content: 'First, select YOUR native language. The other person\'s voice will be captured and entirely translated into this language so you can understand them natively.',
      disableBeacon: true,
    },
    {
      target: '.tour-instant-link',
      content: 'Click here to instantly launch a brand new call. You will be given a secure Room ID to share with your friend.',
      disableBeacon: true,
    },
    {
      target: '.tour-secure-join',
      content: 'Or, if your friend already generated a Room ID, simply paste it here and click JOIN to connect directly to their neural bridge.',
      disableBeacon: true,
    }
  ];

  const tourStyles = {
    options: {
      backgroundColor: '#1E1E1E',
      arrowColor: '#1E1E1E',
      textColor: '#FFFFFF',
      overlayColor: 'rgba(0, 0, 0, 0.85)',
      primaryColor: '#00FFF0',
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: '0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontFamily: 'Inter, sans-serif',
    },
    buttonNext: {
      backgroundColor: '#00FFF0',
      color: '#003733',
      borderRadius: '0',
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 'bold',
      textTransform: 'uppercase' as any,
    },
    buttonBack: {
      color: '#94a3b8',
      fontFamily: '"Space Grotesk", sans-serif',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-12 px-6 max-w-[1600px] mx-auto mesh-gradient min-h-screen"
    >
      {/* @ts-ignore - React Joyride prop typings mismatch */}
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        styles={tourStyles}
        callback={handleJoyrideCallback}
      />
      <div className="mb-12">
        <h1 className="font-clash text-5xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white opacity-90">COMMAND</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="w-12 h-[2px] bg-primary-cyan"></span>
          <span className="font-mono text-primary-cyan text-sm tracking-[0.5em]">SYSTEM_READY // 0xAF229</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Left Column - Hero Stream Card */}
        <div className="flex-[2] relative group overflow-hidden rounded-xl bg-surface-low border border-white/5">
          <div className="bg-surface-low h-full w-full p-8 flex flex-col justify-between relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs text-primary-cyan border border-primary-cyan/30 px-2 py-1 mb-4 inline-block">LIVE_RECEPTION</span>
                <h3 className="font-clash text-4xl font-bold text-white max-w-md uppercase">Universal Quantum Neural Bridge</h3>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-slate-500">BANDWIDTH</p>
                <p className="font-mono text-xl text-primary-cyan">1.4 GB/S</p>
              </div>
            </div>

            <div className="mt-8 flex-1 relative min-h-[160px]">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-cyan via-transparent to-transparent"></div>
              <div className="flex items-end gap-1 h-24 absolute bottom-0 left-0 w-full">
                <motion.div animate={{ height: ['40%', '60%', '40%'] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex-1 bg-primary-cyan"></motion.div>
                <motion.div animate={{ height: ['70%', '50%', '70%'] }} transition={{ repeat: Infinity, duration: 1.2 }} className="flex-1 bg-primary-cyan"></motion.div>
                <motion.div animate={{ height: ['100%', '80%', '100%'] }} transition={{ repeat: Infinity, duration: 1.8 }} className="flex-1 bg-primary-purple"></motion.div>
                <motion.div animate={{ height: ['60%', '90%', '60%'] }} transition={{ repeat: Infinity, duration: 1.4 }} className="flex-1 bg-primary-cyan"></motion.div>
                <motion.div animate={{ height: ['85%', '65%', '85%'] }} transition={{ repeat: Infinity, duration: 1.6 }} className="flex-1 bg-primary-cyan"></motion.div>
                <motion.div animate={{ height: ['45%', '75%', '45%'] }} transition={{ repeat: Infinity, duration: 1.3 }} className="flex-1 bg-primary-purple"></motion.div>
                <motion.div animate={{ height: ['75%', '55%', '75%'] }} transition={{ repeat: Infinity, duration: 1.7 }} className="flex-1 bg-primary-cyan"></motion.div>
                <motion.div animate={{ height: ['30%', '50%', '30%'] }} transition={{ repeat: Infinity, duration: 1.1 }} className="flex-1 bg-primary-cyan"></motion.div>
              </div>
            </div>

            <div className="flex flex-col gap-6 mt-6 md:mt-8">

              {/* Global Settings */}
              <div className="tour-target-lang flex flex-col gap-2 w-full">
                <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Select Your Target Reception Language</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 p-3 font-space text-lg text-white uppercase tracking-widest focus:border-primary-cyan outline-none transition-colors"
                >
                  <option value="en">ENGLISH (EN)</option>
                  <option value="es">SPANISH (ES)</option>
                  <option value="fr">FRENCH (FR)</option>
                  <option value="de">GERMAN (DE)</option>
                  <option value="it">ITALIAN (IT)</option>
                  <option value="pt">PORTUGUESE (PT)</option>
                  <option value="hi">HINDI (HI)</option>
                  <option value="ja">JAPANESE (JP)</option>
                  <option value="ko">KOREAN (KR)</option>
                  <option value="zh">CHINESE (CN)</option>
                </select>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Instant Link Action */}
                <div className="tour-instant-link bg-white/5 border border-white/10 p-4 md:p-6 flex flex-col justify-between group hover:border-primary-cyan/50 transition-colors">
                  <div>
                    <h4 className="font-space text-xl md:text-2xl font-bold text-white mb-2 uppercase">Instant Link</h4>
                    <p className="font-inter text-xs text-white/50 mb-6 font-light">Generate a secure cryptographic channel and instantly enter the room.</p>
                  </div>
                  <button onClick={handleInstant} className="bg-primary-cyan text-[#003733] px-6 py-4 font-mono text-xs font-black hover:bg-white transition-colors w-full uppercase tracking-widest">
                    START NEW CALL
                  </button>
                </div>

                {/* Secure Join Action */}
                <div className="tour-secure-join bg-white/5 border border-white/10 p-4 md:p-6 flex flex-col justify-between group hover:border-primary-purple/50 transition-colors">
                  <div>
                    <h4 className="font-space text-xl md:text-2xl font-bold text-white mb-2 uppercase">Secure Join</h4>
                    <p className="font-inter text-xs text-white/50 mb-6 font-light">Enter an existing channel ID to intercept the transmission.</p>
                  </div>
                  <div className="flex bg-black/50 border border-white/10 focus-within:border-primary-purple transition-colors">
                    <input
                      type="text"
                      value={inputRoomId}
                      onChange={(e) => setInputRoomId(e.target.value)}
                      className="bg-transparent text-white font-mono text-sm px-4 py-4 w-full focus:outline-none uppercase tracking-wider"
                      placeholder="ENTER ID (e.g. AB12-XY89)"
                    />
                    <button onClick={handleJoin} className="bg-white text-black px-6 font-mono text-xs font-black hover:bg-primary-purple hover:text-white transition-colors">
                      JOIN
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="flex-[1] flex flex-col gap-6">

          {/* Latency Card */}
          <div className="bg-surface-low rounded-xl p-6 border border-white/5 hover:border-primary-cyan/30 transition-all flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-6">
              <Share2 className="text-primary-purple" size={20} />
              <span className="font-mono text-[10px] text-slate-500 uppercase">Latency</span>
            </div>
            <div className="font-clash text-5xl font-bold text-white mb-2">12<span className="text-sm font-mono text-primary-cyan ml-2">MS</span></div>
            <div className="w-full bg-white/5 h-1">
              <div className="bg-primary-purple h-full w-[85%]"></div>
            </div>
            <p className="font-mono text-[10px] text-slate-500 mt-4">STABLE ACROSS 14 NODES</p>
          </div>

          {/* Language Distribution Card */}
          <div className="bg-surface-low rounded-xl p-6 border border-white/5 hover:border-primary-cyan/30 transition-all flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-4">
              <Languages className="text-primary-cyan" size={20} />
              <span className="font-mono text-[10px] text-slate-500 uppercase">Active Bridges</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-white">EN_US <span className="text-slate-500">→</span> JP_TYO</span>
                <span className="text-primary-cyan">42%</span>
              </div>
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-white">ZH_CN <span className="text-slate-500">→</span> DE_BER</span>
                <span className="text-primary-cyan">28%</span>
              </div>
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-white">ES_MAD <span className="text-slate-500">→</span> FR_PAR</span>
                <span className="text-primary-cyan">15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Nodes (Full Width Area Below) */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-clash text-4xl font-bold uppercase text-white">Recent_Nodes</h2>
            <span className="font-mono text-xs text-slate-500">SCANNING_HISTORY...</span>
          </div>
          <div className="space-y-4">
            {[
              { id: '01', name: 'Project_Aion_Review', participants: 4, duration: '01:24:12', accuracy: '99.8%', color: 'border-primary-cyan', text: 'text-primary-cyan' },
              { id: '02', name: 'Neo-Tokyo_Summit_2024', participants: 128, duration: '03:45:00', accuracy: '98.2%', color: 'border-transparent hover:border-primary-purple', text: 'text-primary-purple' },
              { id: '03', name: 'Internal_Sync_Theta', participants: 2, duration: '00:15:22', accuracy: '100%', color: 'border-transparent hover:border-primary-cyan', text: 'text-primary-cyan' },
            ].map((node) => (
              <div key={node.id} className={`flex items-center justify-between p-6 bg-surface-low border-l-2 ${node.color} hover:bg-surface transition-all group cursor-pointer`}>
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 bg-surface-high flex items-center justify-center font-mono ${node.text} border border-white/5`}>
                    {node.id}
                  </div>
                  <div>
                    <h4 className="font-space text-lg font-bold text-white uppercase tracking-wider">{node.name}</h4>
                    <p className="font-mono text-xs text-slate-500">{node.participants} PARTICIPANTS • DURATION: {node.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="hidden md:block">
                    <p className="font-mono text-[10px] text-slate-500 text-right">ACCURACY</p>
                    <p className="font-mono text-sm text-primary-cyan">{node.accuracy}</p>
                  </div>
                  <ChevronRight className="text-slate-500 group-hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
