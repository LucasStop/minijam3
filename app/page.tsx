'use client';

import { useState } from 'react';
import Menu from '@/components/menu';
import About from '@/components/about';
import Game from '@/components/game';
import GameV0 from '@/components/game-v0';
import GameV1 from '@/components/game-v1';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    'menu' | 'playing' | 'about' | 'gameOver' | 'v0' | 'v1'
  >('menu');
  const [finalScore, setFinalScore] = useState(0);

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setCurrentScreen('gameOver');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return (
          <Menu
            onStartGame={() => setCurrentScreen('playing')}
            onShowAbout={() => setCurrentScreen('about')}
            onStartV0={() => setCurrentScreen('v0')}
            onStartV1={() => setCurrentScreen('v1')}
          />
        );
      case 'about':
        return <About onBack={() => setCurrentScreen('menu')} />;
      case 'playing':
        return <Game onGameOver={handleGameOver} />;
      case 'v0':
        return (
          <div className='relative w-full h-screen'>
            <GameV0 />
            <button
              onClick={() => setCurrentScreen('menu')}
              className='absolute top-4 left-4 z-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors'
            >
              Voltar ao Menu
            </button>
            <div className='absolute top-4 right-4 z-10 text-white bg-black bg-opacity-50 p-2 rounded'>
              <p>V0 - Voo Livre</p>
              <p>W: Frente | A/D: Girar</p>
            </div>
          </div>
        );
      case 'v1':
        return (
          <div className='relative w-full h-screen'>
            <GameV1 />
            <button
              onClick={() => setCurrentScreen('menu')}
              className='absolute top-4 left-4 z-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors'
            >
              Voltar ao Menu
            </button>
            <div className='absolute top-4 right-4 z-10 text-white bg-black bg-opacity-50 p-2 rounded'>
              <p>V1 - Sistema de Tiro</p>
              <p>W: Frente | A/D: Girar | ESPAÇO: Atirar</p>
            </div>
          </div>
        );
      case 'gameOver':
        return (
          <div className='fixed inset-0 bg-black flex items-center justify-center'>
            <div className='text-center text-white'>
              <h1 className='text-6xl font-bold mb-4 text-red-500'>
                GAME OVER
              </h1>
              <p className='text-2xl mb-2'>Pontuação Final: {finalScore}</p>
              <p className='text-lg mb-8'>
                Obrigado por jogar Defensor Galáctico!
              </p>
              <button
                onClick={() => setCurrentScreen('menu')}
                className='px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors'
              >
                Voltar ao Menu
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className='w-full h-screen'>{renderScreen()}</div>;
}
