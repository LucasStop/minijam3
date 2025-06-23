'use client';

import { useGameStore } from '../../stores/gameStore';
import { useEffect, useRef } from 'react';

interface GameUIProps {
  onBackToMenu?: () => void;
}

export function GameUI({ onBackToMenu }: GameUIProps = {}) {
  const score = useGameStore(state => state.score);
  const gameStarted = useGameStore(state => state.gameStarted);
  const enemyCount = useGameStore(state => state.enemies.length);
  const playerHealth = useGameStore(state => state.playerHealth);
  const isGameOver = useGameStore(state => state.isGameOver);
  const isGameWon = useGameStore(state => state.isGameWon);
  const isInvincible = useGameStore(state => state.isInvincible);
  const isTakingDamage = useGameStore(state => state.isTakingDamage);
  const startGame = useGameStore(state => state.startGame);
  const resetGame = useGameStore(state => state.resetGame);

  // Refs para valores anteriores para detectar mudanças
  const prevHealthRef = useRef(playerHealth);
  const prevScoreRef = useRef(score);

  // Função para criar sons sintéticos usando Web Audio API
  const playSound = (
    frequency: number,
    duration: number,
    type: OscillatorType = 'square'
  ) => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      // Envelope para suavizar o som
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      // Silenciosamente ignora erros de áudio
      console.log('Audio not supported');
    }
  };

  // Efeito para som de dano
  useEffect(() => {
    if (playerHealth < prevHealthRef.current && prevHealthRef.current > 0) {
      // Som de dano: frequência baixa e áspera
      playSound(150, 0.3, 'sawtooth');
    }
    prevHealthRef.current = playerHealth;
  }, [playerHealth]);

  // Efeito para som de pontuação
  useEffect(() => {
    if (score > prevScoreRef.current && prevScoreRef.current >= 0) {
      // Som de pontuação: frequência alta e agradável
      playSound(800, 0.2, 'sine');
      setTimeout(() => playSound(1000, 0.15, 'sine'), 100);
    }
    prevScoreRef.current = score;
  }, [score]); // Menu de Game Over ou Vitória
  if (isGameOver) {
    return (
      <div className='absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-80 cursor-default'>
        <div className='text-center text-white'>
          <h1 className='text-6xl font-bold mb-4 text-blue-400'>
            SPACE FIGHTER
          </h1>

          {/* Tela de Vitória */}
          {isGameWon ? (
            <>
              <h2 className='text-6xl text-yellow-400 mb-4 animate-bounce'>
                🎉 VITÓRIA! 🎉
              </h2>
              <h3 className='text-3xl text-green-400 mb-2'>
                Parabéns, Comandante!
              </h3>
              <h4 className='text-xl text-white mb-4'>
                Você defendeu a galáxia com sucesso!
              </h4>
              <div className='text-4xl font-bold mb-6 text-yellow-400'>
                Pontuação Final: {score}
              </div>
            </>
          ) : (
            /* Tela de Derrota */
            <>
              <h2 className='text-4xl text-red-500 mb-2 animate-pulse'>
                GAME OVER
              </h2>
              <h3 className='text-2xl text-yellow-400 mb-2'>Pontuação Final</h3>
              <div className='text-4xl font-bold mb-6 text-white'>{score}</div>
            </>
          )}

          <div className='space-y-4'>
            <button
              onClick={resetGame}
              className={`px-8 py-4 text-2xl font-bold rounded-lg transition-colors ${
                isGameWon
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isGameWon ? 'JOGAR NOVAMENTE' : 'JOGAR NOVAMENTE'}
            </button>

            {onBackToMenu && (
              <button
                onClick={onBackToMenu}
                className='px-8 py-4 text-2xl font-bold bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors'
              >
                MENU PRINCIPAL
              </button>
            )}
          </div>
        </div>
      </div>
    );
  } // HUD do jogo
  return (
    <>
      {/* Flash de dano - overlay vermelho que cobre toda a tela */}
      <div
        className={`pointer-events-none absolute inset-0 bg-red-500 transition-opacity duration-150 ${
          isTakingDamage ? 'opacity-30' : 'opacity-0'
        }`}
      />
      <div className='absolute top-0 left-0 z-10 p-4 text-white pointer-events-none'>
        <div className='bg-black bg-opacity-60 rounded-lg p-4 border border-blue-500'>
          <div className='text-2xl font-bold mb-2'>
            Score: <span className='text-yellow-400'>{score}</span>
            <span className='text-sm text-gray-300'> / 200</span>
          </div>

          {/* Barra de progresso para vitória */}
          <div className='mb-3'>
            <div className='text-sm mb-1 text-blue-400'>
              Progresso para Vitória
            </div>
            <div className='w-48 h-2 bg-gray-700 rounded-full overflow-hidden'>
              <div
                className='h-full bg-gradient-to-r from-blue-500 to-yellow-400 transition-all duration-500'
                style={{ width: `${Math.min((score / 200) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Barra de vida */}
          <div className='mb-2'>
            <div className='text-lg mb-1'>
              Vida:{' '}
              <span
                className={
                  playerHealth > 50
                    ? 'text-green-400'
                    : playerHealth > 25
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }
              >
                {playerHealth}
              </span>
              {isInvincible && (
                <span className='text-red-400 ml-2 animate-pulse'>
                  [INVENCÍVEL]
                </span>
              )}
            </div>
            <div className='w-48 h-3 bg-gray-700 rounded-full overflow-hidden'>
              <div
                className={`h-full transition-all duration-300 ${
                  playerHealth > 50
                    ? 'bg-green-500'
                    : playerHealth > 25
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${playerHealth}%` }}
              />
            </div>
          </div>
          <div className='text-lg'>
            Inimigos: <span className='text-red-400'>{enemyCount}</span>
          </div>
        </div>
      </div>
    </>
  );
}
