'use client';

import { useState } from 'react';
import Menu from '@/components/menu';
import About from '@/components/about';
import Game from '@/components/game/game';
import { useGameStore } from '@/stores/gameStore';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    'menu' | 'playing' | 'about'
  >('menu');

  const startGame = useGameStore(state => state.startGame);
  const resetGame = useGameStore(state => state.resetGame);

  const handleStartGame = () => {
    resetGame(); // Reseta o estado do jogo
    startGame(); // Inicia o jogo
    setCurrentScreen('playing'); // Muda para a tela de jogo
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return (
          <Menu
            onStartGame={handleStartGame}
            onShowAbout={() => setCurrentScreen('about')}
          />
        );
      case 'about':
        return <About onBack={() => setCurrentScreen('menu')} />;
      case 'playing':
        return (
          <div className='relative w-full h-screen'>
            <Game onBackToMenu={() => setCurrentScreen('menu')} />
            {/* <button
              onClick={() => setCurrentScreen('menu')}
              className='absolute top-4 left-4 z-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors'
            >
              Voltar ao Menu
            </button> */}
            <div className='absolute top-4 right-4 z-10 text-white bg-black bg-opacity-70 p-3 rounded-lg border border-cyan-400'>
              <p className='font-bold text-cyan-400 mb-1'>Space Fighter</p>
              <div className='text-sm space-y-1'>
                <p>
                  <strong>WASD:</strong> Mover | <strong>SPACE:</strong>{' '}
                  Acelerar
                </p>
                <p>
                  <strong>MOUSE:</strong> Mirar | <strong>CLICK:</strong> Atirar
                </p>
                <p>
                  <strong>CTRL:</strong> Frear
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className='w-full h-screen'>{renderScreen()}</div>;
}
