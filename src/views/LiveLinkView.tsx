import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { MicOff, Mic, ArrowRightLeft, PhoneOff } from 'lucide-react';

interface Props {
  onNext: () => void;
  voiceId: string | null;
  targetLang: string;
  roomId: string;
  key?: React.Key;
}

export function LiveLinkView({ onNext, voiceId, targetLang, roomId }: Props) {
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
        targetLang
      }));
      
      startRecording();
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'transcript') {
            setTranscript(data.text);
          } else if (data.type === 'translation') {
            setTranslatedText(data.text);
          } else if (data.type === 'error') {
            console.error('Server error:', data.message);
          }
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      } else if (event.data instanceof Blob) {
        // Handle incoming audio
        playAudio(event.data);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from room');
      setIsConnected(false);
      stopRecording();
    };

    return () => {
      stopRecording();
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId, voiceId, targetLang]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN && !isMuted) {
          wsRef.current.send(event.data);
        }
      };

      // Send audio chunks every 1 second
      mediaRecorder.start(1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const playAudio = async (audioBlob: Blob) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (err) {
      console.error('Error playing audio:', err);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // If currently muted, enable it. If not muted, disable it.
      });
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
      {/* Background Energy Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-cyan/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative w-full max-w-7xl flex flex-col md:flex-row items-center justify-between px-12 z-10">
        {/* Local Speaker */}
        <div className="flex flex-col items-center gap-8 group">
          <div className="relative">
            <div className={`absolute -inset-4 ${isMuted ? 'bg-red-500/20' : 'bg-primary-cyan/20'} rounded-full blur-3xl shadow-[0_0_80px_20px_rgba(0,255,240,0.3)] transition-colors duration-300`}></div>
            <div className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full border-2 ${isMuted ? 'border-red-500' : 'border-primary-cyan'} p-2 bg-black overflow-hidden transition-colors duration-300`}>
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUAwGkNLCPvfy-g2xdrs2K9ijNR_mHAdAlgzY-3yzZ1Ldf-zHbIJbOZT_R9f5UdPlcQbPoKuppS5rHJyJO1laVVIxJ4008u2yb4aADu7HAKXXf7G2vOT9oKH8pJZPZ98OgBQieAVI3ow22ssP9p_son4FPhmSLH0TBRlJ4s3DN5yEIKUxUBZ1IiAHqRaNVmkFgI5Kx8BhejyRwOVkmXPLspLppKEDy5s0T4Sr6rzHL_xVVAJ-_2eV7YMNuHCcbDtXTz2qnL7HRTQg" alt="Local Operator" className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
            </div>
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 ${isMuted ? 'bg-red-500 text-white' : 'bg-primary-cyan text-[#003733]'} font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-300`}>
              LOCAL_NODE {isMuted && '(MUTED)'}
            </div>
          </div>
          <div className="text-center">
            <p className="font-mono text-xs text-primary-cyan/60 mb-1">ROOM: {roomId}</p>
            <h2 className="font-space text-2xl font-bold tracking-tighter text-white">YOU</h2>
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
        <div className="flex flex-col items-center gap-8 group">
          <div className="relative">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-white/10 p-2 bg-black overflow-hidden">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQ_vB165pQLmrOhYRkgo369e3_nJJ1o6BjpCIKbIa_dbFxsrw89jNRwte9_tKeDMVgU7BZPjqYUb319R8ZeK6OEIJqW1Qc3fvsBly83f0J9PTMPIzAw_4gl8M2jwAZJAytlQWzeNYnAp0anwJ_sLZAi2qfZfEMARV8ZrWwInFfwD8kiDJ8eP7xxJmbIfZFwkf0aCFdjBI-13Xnb85qe8Qv7XatRx8hK0JwKjiyIDzbEZLSvUTKPhQdyCjHcX5ICVkou-z5Noeozrk" alt="Remote Operator" className="w-full h-full object-cover rounded-full grayscale opacity-40 hover:opacity-100 transition-all duration-700" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-surface-high text-slate-300 font-mono text-[10px] tracking-[0.2em] uppercase">
              REMOTE_NODE
            </div>
          </div>
          <div className="text-center">
            <p className="font-mono text-xs text-white/20 mb-1">TARGET: {targetLang.toUpperCase()}</p>
            <h2 className="font-space text-2xl font-bold tracking-tighter text-white/40">REMOTE_ID_992</h2>
          </div>
        </div>
      </div>

      {/* Controls Dock */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6">
        <div className="flex items-center justify-between gap-4 bg-[#0e0e0e]/40 backdrop-blur-2xl p-4 rounded-full border border-white/5 shadow-2xl">
          <button 
            onClick={toggleMute}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-surface-high text-white hover:bg-white hover:text-black'}`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <div className="flex-1 flex items-center justify-center gap-8 border-x border-white/10 px-8">
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
          <button onClick={handleDisconnect} className="flex items-center justify-center w-14 h-14 rounded-full bg-red-900/20 text-red-400 hover:bg-red-500 hover:text-white transition-all">
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
