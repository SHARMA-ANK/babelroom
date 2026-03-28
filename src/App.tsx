import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Layout } from './components/Layout';
import { InitializeView } from './views/InitializeView';
import { SignupView } from './views/SignupView';
import { VerifyingView } from './views/VerifyingView';
import { CalibrationView } from './views/CalibrationView';
import { CommandView } from './views/CommandView';
import { LiveLinkView } from './views/LiveLinkView';
import { LogSummaryView } from './views/LogSummaryView';

export default function App() {
  const [currentView, setCurrentView] = useState('INITIALIZE');
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<string>('ja');
  const [roomId, setRoomId] = useState<string>('room-alpha');

  const renderView = () => {
    switch (currentView) {
      case 'INITIALIZE':
        return <InitializeView key="init" onNext={() => setCurrentView('SIGNUP')} />;
      case 'SIGNUP':
        return <SignupView key="signup" onNext={() => setCurrentView('VERIFYING')} />;
      case 'VERIFYING':
        return <VerifyingView key="verify" onNext={() => setCurrentView('CALIBRATION')} />;
      case 'CALIBRATION':
        return <CalibrationView key="calib" onNext={() => setCurrentView('COMMAND')} setVoiceId={setVoiceId} />;
      case 'COMMAND':
        return <CommandView key="cmd" onNext={() => setCurrentView('LIVE_LINK')} setTargetLang={setTargetLang} setRoomId={setRoomId} targetLang={targetLang} roomId={roomId} />;
      case 'LIVE_LINK':
        return <LiveLinkView key="live" onNext={() => setCurrentView('LOG_SUMMARY')} voiceId={voiceId} targetLang={targetLang} roomId={roomId} />;
      case 'LOG_SUMMARY':
        return <LogSummaryView key="log" onNext={() => setCurrentView('INITIALIZE')} />;
      default:
        return <InitializeView key="init" onNext={() => setCurrentView('SIGNUP')} />;
    }
  };

  if (currentView === 'INITIALIZE' || currentView === 'SIGNUP' || currentView === 'VERIFYING') {
    return (
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
    );
  }

  return (
    <Layout setView={setCurrentView} currentView={currentView}>
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
    </Layout>
  );
}
