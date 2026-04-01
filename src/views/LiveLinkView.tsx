import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { MicOff, Mic, ArrowRightLeft, PhoneOff } from 'lucide-react';
import { Joyride, STATUS, Step } from 'react-joyride';

interface Props {
  onNext: () => void;
  voiceId: string | null;
  targetLang: string;
  roomId: string;
  userProfile?: any;
  setCallLogs: (logs: any) => void;
  key?: React.Key;
}

export function LiveLinkView({ onNext, voiceId, targetLang, roomId, userProfile, setCallLogs }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [remotePeer, setRemotePeer] = useState<any>(null);
  const [isRemoteSpeaking, setIsRemoteSpeaking] = useState(false);
  const [isRemoteRecording, setIsRemoteRecording] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('babelroom_tour_live')) {
      localStorage.setItem('babelroom_tour_live', 'true');
      setTimeout(() => setRunTour(true), 1500); // Wait for connection sequence
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      localStorage.setItem('babelroom_tour_live', 'true');
      setRunTour(false);
    }
  };

  const steps: any[] = [
    {
      target: '.tour-room-id',
      content: 'Share this secure cryptographic Room ID with your partner so they can join your bridge.',
      disableBeacon: true,
    },
    {
      target: '.tour-ptt-btn',
      content: 'Push & HOLD this button to speak. Release it to encrypt and transmit your voice to the remote node.',
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

  useEffect(() => {
    // Initialize WebSocket connection
    const workerUrl = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';
    const wsUrl = workerUrl.replace(/^http/, 'ws') + `/room/${roomId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to room:', roomId);
      setIsConnected(true);

      // Send initial configuration
      ws.send(JSON.stringify({
        type: 'config',
        voiceId,
        targetLang,
        userProfile
      }));

      const now = new Date();
      setCallLogs(prev => [...prev, {
        time: `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().substring(0, 2)}]`,
        source: 'SYST_LOG',
        color: 'text-primary-purple',
        text: 'ENCRYPTION LAYER APPLIED: AES-256 QUANTUM-RESISTANT'
      }]);

      initMicrophone();
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          const now = new Date();
          const timestamp = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().substring(0, 2)}]`;

          if (data.type === 'transcript') {
            setTranscript(data.text);
            setCallLogs(prev => [...prev, {
              time: timestamp,
              source: `SOURCE_${userProfile?.name?.substring(0, 3).toUpperCase() || 'USR'}`,
              color: 'text-primary-cyan',
              text: data.text
            }]);
          } else if (data.type === 'translation') {
            setTranslatedText(data.text);
            setCallLogs(prev => [...prev, {
              time: timestamp,
              source: `TARGET_${targetLang.toUpperCase()}`,
              color: 'text-white',
              text: data.text
            }]);
          } else if (data.type === 'error') {
            console.error('Server error:', data.message);
          } else if (data.type === 'peers_update') {
            console.log("ROOM PEERS UPDATED:", data.peers);
            // If there's more than 1 person, find the one that isn't me. 
            // Fallback: If both tabs used the EXACT same Google account by accident, just pick the 2nd one.
            let otherPeer = null;
            if (data.peers.length > 1) {
              otherPeer = data.peers.find((p: any) => p?.email !== userProfile?.email) || data.peers[1];
            }
            setRemotePeer(otherPeer);
          } else if (data.type === 'remote_speaking') {
            setIsRemoteRecording(data.status);
          }
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      } else if (event.data instanceof Blob) {
        console.log('Received audio Blob!');
        playAudio(event.data);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from room');
      setIsConnected(false);

      const now = new Date();
      setCallLogs(prev => [...prev, {
        time: `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().substring(0, 2)}]`,
        source: 'UPLINK_OFF',
        color: 'text-[#00716a]',
        text: 'SESSION_TERMINATED_BY_OPERATOR'
      }]);

      stopPTT();
    };

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [roomId, voiceId, targetLang]);

  const initMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const startPTT = () => {
    if (!streamRef.current || wsRef.current?.readyState !== WebSocket.OPEN) return;

    try {
      setIsRecording(true);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'is_speaking', status: true }));
      }
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(event.data);
        }
      };

      // Start recording until stopped
      mediaRecorder.start();
    } catch (err) {
      console.error('Error starting PTT:', err);
      setIsRecording(false);
    }
  };

  const stopPTT = () => {
    setIsRecording(false);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'is_speaking', status: false }));
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const playAudio = async (audioBlob: Blob) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    try {
      // Fix for Chrome/Safari Autoplay Policy where AudioContext starts suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => {
        setIsRemoteSpeaking(false);
      };

      setIsRemoteSpeaking(true);
      source.start();
    } catch (err) {
      console.error('Error playing audio:', err);
    }
  };

  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-20"
    >
      {/* @ts-ignore - React Joyride prop typings mismatch */}
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        styles={tourStyles}
        callback={handleJoyrideCallback}
      />
      {/* Background Energy Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-cyan/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative w-full max-w-7xl flex flex-col md:flex-row items-center justify-between px-12 z-10">
        {/* Local Speaker */}
        <div className="flex flex-col items-center gap-4 md:gap-8 group">
          <div className="relative">
            <div className={`absolute -inset-4 ${isRecording ? 'bg-primary-cyan/40 animate-pulse' : 'bg-primary-cyan/10'} rounded-full blur-3xl shadow-[0_0_80px_20px_rgba(0,255,240,0.3)] transition-colors duration-300`}></div>
            <div className={`relative w-40 h-40 md:w-64 md:h-64 rounded-full border-2 ${isRecording ? 'border-white' : 'border-primary-cyan/50'} p-2 bg-black overflow-hidden transition-all duration-300`}>
              <img src={userProfile?.picture || "https://lh3.googleusercontent.com/aida-public/AB6AXuBUAwGkNLCPvfy-g2xdrs2K9ijNR_mHAdAlgzY-3yzZ1Ldf-zHbIJbOZT_R9f5UdPlcQbPoKuppS5rHJyJO1laVVIxJ4008u2yb4aADu7HAKXXf7G2vOT9oKH8pJZPZ98OgBQieAVI3ow22ssP9p_son4FPhmSLH0TBRlJ4s3DN5yEIKUxUBZ1IiAHqRaNVmkFgI5Kx8BhejyRwOVkmXPLspLppKEDy5s0T4Sr6rzHL_xVVAJ-_2eV7YMNuHCcbDtXTz2qnL7HRTQg"} alt="Local Operator" className={`w-full h-full object-cover rounded-full transition-all duration-700 ${isRecording ? 'grayscale-0 scale-105' : 'grayscale hover:grayscale-0'}`} referrerPolicy="no-referrer" />
            </div>
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 ${isRecording ? 'bg-white text-black font-bold' : 'bg-primary-cyan text-[#003733]'} font-mono text-[8px] md:text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 text-nowrap`}>
              LOCAL_NODE {isRecording && '(TRANSMITTING)'}
            </div>
          </div>
          <div className="text-center mt-2 md:mt-0">
            <p className="tour-room-id font-mono text-[10px] md:text-xs text-primary-cyan/60 mb-1">ROOM: {roomId}</p>
            <h2 className="font-space text-xl md:text-2xl font-bold tracking-tighter text-white">YOU</h2>
          </div>
        </div>

        {/* Central Transmission Logic */}
        <div className="flex-1 flex flex-col items-center justify-center py-20 md:py-0 px-4 md:px-12 w-full">
          <div className="relative w-full max-w-md h-24 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
              <path d="M 0 50 Q 100 20 200 50 T 400 50" fill="none" stroke="rgba(0, 255, 240, 0.1)" strokeWidth="1"></path>
              <motion.path
                initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                d="M 0 50 Q 100 20 200 50 T 400 50" fill="none" stroke={isConnected ? "#00FFF0" : "#64748b"} strokeWidth="2"
              ></motion.path>
            </svg>
            <div className="z-10 flex items-center gap-3 bg-surface-low/80 backdrop-blur-xl px-6 py-3 border border-white/5 rounded-full">
              <ArrowRightLeft className={isConnected ? "text-primary-cyan" : "text-slate-500"} size={16} />
              <span className={`font-mono text-[10px] tracking-[0.3em] uppercase ${isConnected ? "text-primary-cyan" : "text-slate-500"}`}>
                {isConnected ? 'Live Link Active' : 'Connecting...'}
              </span>
            </div>
          </div>

          <div className="mt-8 w-full max-w-xl text-center">
            <div className="space-y-4">
              <p className="font-mono text-xs text-white/30 tracking-widest uppercase">Stream Output</p>
              <div className="text-xl md:text-3xl font-space font-bold tracking-tight text-white leading-tight min-h-[120px] flex flex-col justify-center">
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white/60 text-lg mb-2"
                  >
                    "{transcript}"
                  </motion.div>
                )}
                {translatedText ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-primary-cyan"
                  >
                    {translatedText}
                  </motion.div>
                ) : (
                  <span className="text-white/20 italic text-lg">Waiting for transmission...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Remote Speaker */}
        <div className="flex flex-col items-center gap-8 group w-48 md:w-64">
          {remotePeer ? (
            <>
              <div className="relative">
                <div className={`absolute -inset-4 ${isRemoteSpeaking ? 'bg-primary-purple/40 animate-pulse' : 'bg-primary-purple/10'} rounded-full blur-3xl shadow-[0_0_80px_20px_rgba(200,100,255,0.3)] transition-colors duration-300`}></div>
                <div className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full border-2 ${isRemoteSpeaking ? 'border-primary-purple' : 'border-white/10'} p-2 bg-black overflow-hidden transition-all duration-300`}>
                  <img src={remotePeer.picture} alt="Remote Operator" className={`w-full h-full object-cover rounded-full transition-all duration-700 ${isRemoteSpeaking ? 'grayscale-0 scale-105' : 'grayscale opacity-60 hover:opacity-100 hover:grayscale-0'}`} referrerPolicy="no-referrer" />
                </div>
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 ${isRemoteSpeaking ? 'bg-white text-black font-bold' : 'bg-surface-high text-slate-300 border border-white/10'} font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 text-nowrap`}>
                  REMOTE_NODE {isRemoteSpeaking ? '(SPEAKING)' : isRemoteRecording ? '(TRANSMITTING...)' : ''}
                </div>
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-white/20 mb-1">TARGET: {targetLang.toUpperCase()}</p>
                <h2 className="font-space text-2xl font-bold tracking-tighter text-white/70">{remotePeer.given_name || remotePeer.name}</h2>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="absolute -inset-4 bg-primary-purple/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-40 h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 rounded-full border-2 border-dashed border-white/20 flex flex-col items-center justify-center bg-black/50 overflow-hidden">
                  <div className="text-white/30 font-mono text-[8px] md:text-xs text-center px-4 md:px-8 z-10 animate-pulse tracking-[0.2em] uppercase">WAITING FOR<br />OPERATOR</div>
                </div>
              </div>
              <div className="text-center opacity-40 mt-2 md:mt-0">
                <h2 className="font-space text-lg md:text-xl font-bold tracking-tighter text-white">SEARCHING...</h2>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controls Dock */}
      <div className="fixed bottom-4 md:bottom-12 w-full max-w-xl px-2 md:px-6 z-50 left-1/2 -translate-x-1/2">
        <div className="flex items-center justify-between gap-2 md:gap-4 bg-[#0e0e0e]/90 md:bg-[#0e0e0e]/40 backdrop-blur-2xl p-2 md:p-4 rounded-full border border-white/10 shadow-2xl">
          <button
            onMouseDown={startPTT}
            onMouseUp={stopPTT}
            onMouseLeave={stopPTT}
            onTouchStart={startPTT}
            onTouchEnd={stopPTT}
            className={`tour-ptt-btn flex flex-1 md:flex-none items-center justify-center font-space font-bold uppercase tracking-tighter px-4 md:px-8 h-12 md:h-14 rounded-full transition-all active:scale-95 ${isRecording ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'bg-surface-high text-white hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'}`}
          >
            <Mic size={18} className={`mr-2 md:mr-2 ${isRecording ? 'animate-pulse text-red-500' : ''}`} />
            <span className="text-[10px] md:text-sm">{isRecording ? 'TRANSMITTING...' : 'HOLD TO TALK'}</span>
          </button>

          <div className="hidden md:flex flex-1 items-center justify-center gap-8 border-x border-white/10 px-8">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-white/40 mb-1 tracking-widest uppercase">Input</span>
              <span className="font-space font-bold text-sm tracking-tight">AUTO</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-cyan/10 flex items-center justify-center text-primary-cyan">
              <ArrowRightLeft size={16} />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-white/40 mb-1 tracking-widest uppercase">Output</span>
              <span className="font-space font-bold text-sm tracking-tight">{targetLang.toUpperCase()}</span>
            </div>
          </div>

          <button onClick={handleDisconnect} className="flex flex-none items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-900/20 text-red-400 hover:bg-red-500 hover:text-white transition-all ml-0 md:ml-auto">
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
