import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic } from 'lucide-react';
import { Joyride, STATUS, Step } from 'react-joyride';

interface Props {
  onNext: () => void;
  setVoiceId: (id: string) => void;
  key?: React.Key;
}

const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels = [];
  const sampleRate = buffer.sampleRate;
  let offset = 0, pos = 0;

  const setUint16 = (data: number) => { view.setUint16(offset, data, true); offset += 2; };
  const setUint32 = (data: number) => { view.setUint32(offset, data, true); offset += 4; };

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));

  while (pos < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(offset, sample, true); // write 16-bit sample
      offset += 2;
    }
    pos++;
  }
  return new Blob([bufferArr], { type: "audio/wav" });
};

export function CalibrationView({ onNext, setVoiceId }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('babelroom_tour_calib')) {
      localStorage.setItem('babelroom_tour_calib', 'true');
      setTimeout(() => setRunTour(true), 100);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      localStorage.setItem('babelroom_tour_calib', 'true');
      setRunTour(false);
    }
  };

  const steps: any[] = [
    {
      target: '.tour-record-btn',
      content: 'Press and HOLD this core to record an audio sample. We need about 5-10 seconds of clear speech to synthesize your neural voice clone.',
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

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        try {
          const webmBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          const audioContext = new AudioContext();
          const arrayBuffer = await webmBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const wavBlob = audioBufferToWav(audioBuffer);

          await handleVoiceCloning(wavBlob);
        } catch (e) {
          console.error("WAV Encoding Error:", e);
          setError("Failed to encode audio into WAV format for cloning.");
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleVoiceCloning = async (audioBlob: Blob) => {
    setIsCloning(true);
    setProgress(10);

    // Simulate progress while uploading
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 90));
    }, 500);

    try {
      const workerUrl = import.meta.env.VITE_WORKER_URL;
      if (!workerUrl) {
        console.warn("VITE_WORKER_URL not set. Mocking voice cloning for local development.");
        setTimeout(() => {
          clearInterval(interval);
          setProgress(100);
          setVoiceId("mock_voice_id_123");
          setTimeout(onNext, 1000);
        }, 2000);
        return;
      }

      const formData = new FormData();
      formData.append('name', `BabelRoom_User_${Math.floor(Math.random() * 1000)}`);
      formData.append('files', audioBlob, 'calibration.wav');
      formData.append('description', 'BabelRoom instant clone');

      const response = await fetch(`${workerUrl}/api/clone-voice`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      clearInterval(interval);
      setProgress(100);

      if (data.voice_id) {
        setVoiceId(data.voice_id);
        setTimeout(onNext, 1000);
      } else {
        const errorMsg = data.detail?.message || data.error?.message || JSON.stringify(data);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsCloning(false);
      setProgress(0);
      setError(err.message || "An error occurred during voice cloning");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-12 px-6 mesh-gradient min-h-screen"
    >
      {/* @ts-ignore - React Joyride prop typings mismatch */}
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        styles={tourStyles}
        callback={handleJoyrideCallback}
      />
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-30">
          <img
            className="w-full h-full object-cover mix-blend-screen"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7NQR7rPnhZeCa7_PdtKcSwSpOzA_4ME3WIGb-AeBp6V3BpRNweXqaUTTIBmaQO_C5KKabo4gmvOC_rR1yktSd7cLXHlsnzBaaIRt1mllRlPbFWqRP1BCjTTFvntIWRQFuhnmIakoTVRloe2O4SN0kIrJwEucbVsSLQ4-NhoSBkVaiJ3NOlovQmSAls7HKy4Enu_MbTCy993zRzV2GOEejHnjtDtCZhcvNG-8cEMQ7MPg7eerot0UmMCg8bzjyMqnVB1ZDeS4myII"
            alt="Nebula"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex items-center justify-center min-h-0 md:min-h-[700px] mt-12 md:mt-0">
        <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-12 relative overflow-hidden shadow-[0_0_100px_rgba(0,255,240,0.05)] rounded-xl">
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-cyan opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-cyan opacity-50"></div>

          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-16 gap-4">
            <div>
              <h2 className="font-clash text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">CALIBRATION_ACTIVE</h2>
              <p className="font-mono text-[10px] md:text-xs tracking-widest text-primary-cyan/60 uppercase">System: Neural_Link // Extraction Mode: Deep_Clone</p>
            </div>
            <div className="text-left md:text-right">
              <div className="font-mono text-xl text-white">[ ACTIVE ]</div>
              <div className="font-mono text-[10px] text-slate-500">PING: 14MS</div>
            </div>
          </div>

          {/* Liquid Visualizer Cell */}
          <div className="relative h-64 w-full bg-[#0e0e0e] flex items-center justify-center mb-16 rounded-lg overflow-hidden border border-white/5">
            {!isRecording && !isCloning ? (
              <svg className="w-full h-full opacity-80" viewBox="0 0 800 200">
                <path className="liquid-wave" d="M 0 100 Q 100 20 200 100 T 400 100 T 600 100 T 800 100" fill="none" stroke="#00FFF0" strokeWidth="2"></path>
                <path className="liquid-wave" d="M 0 100 Q 100 180 200 100 T 400 100 T 600 100 T 800 100" fill="none" stroke="#7701D0" strokeWidth="1.5" style={{ animationDelay: '-1s' }}></path>
                <path className="liquid-wave" d="M 0 100 Q 100 50 200 100 T 400 100 T 600 100 T 800 100" fill="none" stroke="#FFFFFF" strokeWidth="0.5" style={{ animationDelay: '-2s', opacity: 0.3 }}></path>
              </svg>
            ) : (
              <div className="text-center p-4 md:p-8">
                <p className="font-mono text-xs md:text-sm text-slate-400 mb-2 md:mb-4">{isCloning ? "Processing neural signature..." : "Please read the following sentence clearly:"}</p>
                <p className="font-space text-lg md:text-2xl text-white italic">"The quick brown fox jumps over the lazy dog, establishing a stable neural link across the global network."</p>
              </div>
            )}
            <div className="absolute inset-0 flex justify-around items-center px-12 pointer-events-none">
              <div className="h-32 w-[1px] bg-gradient-to-b from-transparent via-primary-cyan/20 to-transparent"></div>
              <div className="h-48 w-[1px] bg-gradient-to-b from-transparent via-primary-cyan/40 to-transparent"></div>
              <div className="h-32 w-[1px] bg-gradient-to-b from-transparent via-primary-cyan/20 to-transparent"></div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-6">
            <div className="flex justify-between font-mono text-sm uppercase tracking-tighter">
              {isCloning ? (
                <span className="shimmer-text font-bold">[ {progress}% ... EXTRACTING VOCAL TIMBRE ]</span>
              ) : isRecording ? (
                <span className="text-primary-cyan font-bold animate-pulse">[ RECORDING NEURAL SIGNATURE... ]</span>
              ) : (
                <span className="text-slate-400 font-bold">[ AWAITING VOCAL INPUT ]</span>
              )}
              <span className="text-white/40">EST_COMPLETE: 00:42S</span>
            </div>
            <div className="h-2 w-full bg-surface-high relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute left-0 top-0 h-full bg-primary-cyan shadow-[0_0_15px_rgba(0,255,240,0.5)]"
              ></motion.div>
            </div>
            {error && <p className="font-mono text-xs text-red-400 mt-2">ERROR: {error}</p>}

            {/* Bento Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-surface-low p-4 border-l-2 border-primary-cyan/30">
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Frequency Mapping</div>
                <div className="text-lg font-space text-white">44.1 KHZ</div>
              </div>
              <div className="bg-surface-low p-4 border-l-2 border-primary-purple/30">
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Neural Overlap</div>
                <div className="text-lg font-space text-white">99.8%</div>
              </div>
              <div className="bg-surface-low p-4 border-l-2 border-white/30">
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Source Health</div>
                <div className="text-lg font-space text-white">OPTIMAL</div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-12 flex justify-center gap-6">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isCloning}
              className={`tour-record-btn px-10 py-4 flex items-center gap-4 font-space font-bold uppercase tracking-tighter transition-all transform active:scale-95 ${isRecording ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-white text-black hover:bg-primary-cyan hover:text-[#003733]'
                } ${isCloning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Mic size={20} className={isRecording ? 'animate-pulse' : ''} />
              <span className="text-sm md:text-base">{isRecording ? 'RELEASE TO CLONE' : isCloning ? 'CLONING...' : 'HOLD TO RECORD'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Content Hints */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-8 opacity-40 hover:opacity-100 transition-opacity duration-700 relative z-10">
        <div className="col-span-1 space-y-4">
          <div className="h-[1px] w-full bg-gradient-to-r from-primary-cyan to-transparent"></div>
          <div className="font-mono text-[10px] tracking-widest text-primary-cyan">DATA_STREAM_001</div>
          <p className="font-inter text-xs text-slate-400 leading-relaxed">System processing incoming biometric vocal patterns. Decoding harmonic distortion and resonant frequencies.</p>
        </div>
        <div className="col-span-1 space-y-4">
          <div className="h-[1px] w-full bg-gradient-to-r from-primary-purple to-transparent"></div>
          <div className="font-mono text-[10px] tracking-widest text-primary-purple">NEURAL_SYNC_002</div>
          <p className="font-inter text-xs text-slate-400 leading-relaxed">Matching source timbre to target linguistic framework. Calibration stability verified by operator.</p>
        </div>
        <div className="md:col-span-2 relative h-32 rounded-lg overflow-hidden border border-white/5">
          <img
            className="w-full h-full object-cover grayscale opacity-30"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiXOSyNMHzfvEzeUq9-byxASns9kT1tICPkNS2XcIvR_xtjuHoslGdrt0tHJE_4UH0_HmZWckLEZ_Rk4s32cdg4af47t04X5dqs3f3-sg2t5jlJRouq3QhYilt_VweP_NCD3fr_YkQO9OjgonDK0mYarmB5AGcMvlVF-QVgS0F4j3qmTzrQt7nxwUDAjIKroABrkLW5_cfxisv1ieskgy5yGf_IZ-XMLVH6u1HOqEZN8n4ygrqg58L8Wf63Tq0P22otrFQnCUmGo4"
            alt="Hardware"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-[0.5em] bg-black/40">HARDWARE_STATUS_NOMINAL</div>
        </div>
      </div>
    </motion.div>
  );
}
