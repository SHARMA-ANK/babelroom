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
import { LoginView } from './views/LoginView';

export default function App() {
  const [userProfile, setUserProfile] = useState<any>(() => {
    const saved = localStorage.getItem('babelroom_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [voiceId, setVoiceId] = useState<string | null>(() => {
    return localStorage.getItem('babelroom_voiceId');
  });

  const [currentView, setCurrentView] = useState(() => {
    const savedUser = localStorage.getItem('babelroom_user');
    const savedVoice = localStorage.getItem('babelroom_voiceId');
    if (savedUser && savedVoice) return 'COMMAND';
    if (savedUser) return 'VERIFYING';
    return 'INITIALIZE';
  });

  const [targetLang, setTargetLang] = useState<string>('en');
  const [roomId, setRoomId] = useState<string>('room-alpha');

  const handleLoginSuccess = (profile: any) => {
    localStorage.setItem('babelroom_user', JSON.stringify(profile));
    setUserProfile(profile);
    setCurrentView('VERIFYING');
  };

  const clearSession = () => {
    localStorage.removeItem('babelroom_user');
    localStorage.removeItem('babelroom_voiceId');
    setUserProfile(null);
    setVoiceId(null);
    setCurrentView('INITIALIZE');
  };

  const handleSetVoiceId = (id: string) => {
    localStorage.setItem('babelroom_voiceId', id);
    setVoiceId(id);
  };

  const renderView = () => {
    switch (currentView) {
      case 'LOGIN':
        return <LoginView key="login" onLoginSuccess={handleLoginSuccess} />;
      case 'INITIALIZE':
        return <InitializeView key="init" onNext={() => setCurrentView(userProfile ? 'VERIFYING' : 'LOGIN')} />;
      case 'SIGNUP':
        return <SignupView key="signup" onNext={() => setCurrentView('VERIFYING')} />;
      case 'VERIFYING':
        return <VerifyingView key="verify" onNext={() => setCurrentView('CALIBRATION')} />;
      case 'CALIBRATION':
        return <CalibrationView key="calib" onNext={() => setCurrentView('COMMAND')} setVoiceId={handleSetVoiceId} />;
      case 'COMMAND':
        return <CommandView key="cmd" onNext={() => setCurrentView('LIVE_LINK')} setTargetLang={setTargetLang} setRoomId={setRoomId} targetLang={targetLang} roomId={roomId} userProfile={userProfile} />;
      case 'LIVE_LINK':
        return <LiveLinkView key="live" onNext={() => setCurrentView('LOG_SUMMARY')} voiceId={voiceId} targetLang={targetLang} roomId={roomId} userProfile={userProfile} />;
      case 'LOG_SUMMARY':
        return <LogSummaryView key="log" onNext={() => setCurrentView('INITIALIZE')} />;
      default:
        return <LoginView key="login" onLoginSuccess={handleLoginSuccess} />;
    }
  };

  if (currentView === 'LOGIN' || currentView === 'INITIALIZE' || currentView === 'SIGNUP' || currentView === 'VERIFYING') {
    return (
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
    );
  }

  return (
    <Layout setView={setCurrentView} currentView={currentView} userProfile={userProfile} clearSession={clearSession}>
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
    </Layout>
  );
}
