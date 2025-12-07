import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CanvasStage } from './components/CanvasStage';
import { MainMenu } from './components/MainMenu';
import { SettingsPage } from './components/SettingsPage';

type ViewState = 'menu' | 'game' | 'settings';
type GameMode = 'classic' | 'laser';

function App() {
  const [view, setView] = useState<ViewState>('menu');
  const [mode, setMode] = useState<GameMode>('classic');

  // Settings State with Persistence
  const [audioEnabled, setAudioEnabled] = useState(() => {
    const stored = localStorage.getItem('cat_engage_audio');
    return stored !== null ? JSON.parse(stored) : true;
  });

  const [hapticsEnabled, setHapticsEnabled] = useState(() => {
    const stored = localStorage.getItem('cat_engage_haptics');
    return stored !== null ? JSON.parse(stored) : true;
  });

  useEffect(() => {
    localStorage.setItem('cat_engage_audio', JSON.stringify(audioEnabled));
  }, [audioEnabled]);

  useEffect(() => {
    localStorage.setItem('cat_engage_haptics', JSON.stringify(hapticsEnabled));
  }, [hapticsEnabled]);

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setView('game');
  };

  const endGame = (_score: number) => {
    // Stats are now handled by CanvasStage auto-save mechanism
    setView('menu');
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative font-sans select-none text-white">
      <AnimatePresence mode='wait'>
        {view === 'menu' && (
          <MainMenu
            key="menu"
            onStartGame={startGame}
            onSettings={() => setView('settings')}
          />
        )}

        {view === 'settings' && (
          <SettingsPage
            key="settings"
            audioEnabled={audioEnabled}
            hapticsEnabled={hapticsEnabled}
            onToggleAudio={() => setAudioEnabled(!audioEnabled)}
            onToggleHaptics={() => setHapticsEnabled(!hapticsEnabled)}
            onBack={() => setView('menu')}
          />
        )}

        {view === 'game' && (
          <div key="game" className="absolute inset-0 z-50">
            <CanvasStage
              mode={mode}
              onExit={endGame}
              audioEnabled={audioEnabled}
              hapticsEnabled={hapticsEnabled}
            />

            {/* Invisible Exit Area (Top Right) - Fallback or Dev shortcut */}
            <div
              className="absolute top-0 right-0 w-24 h-24 z-50 opacity-0 hidden" // Hidden now, using long-press UI
              onDoubleClick={() => endGame(0)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
