'use client';

import { useGameStore } from '../../stores/gameStore';
import { useEffect, useRef } from 'react';

export function GameUI() {
  const score = useGameStore((state) => state.score);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const enemyCount = useGameStore((state) => state.enemies.length);
  const playerHealth = useGameStore((state) => state.playerHealth);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const isInvincible = useGameStore((state) => state.isInvincible);
  const isTakingDamage = useGameStore((state) => state.isTakingDamage);
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);

  // Refs para valores anteriores para detectar mudanças
  const prevHealthRef = useRef(playerHealth);
  const prevScoreRef = useRef(score);

  // Função para criar sons sintéticos usando Web Audio API
  const playSound = (frequency: number, duration: number, type: OscillatorType = 'square') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      // Envelope para suavizar o som
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

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
  }, [score]);

  // Tela de Game Over
  if (isGameOver) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-80 cursor-default">
        <div className="text-center text-white">
          <h1 className="text-8xl font-bold mb-6 text-red-500 animate-pulse">GAME OVER</h1>
          <h2 className="text-4xl text-yellow-400 mb-2">Pontuação Final</h2>
          <div className="text-6xl font-bold mb-8 text-white">{score}</div>
          <button
            onClick={resetGame}
            className="px-8 py-4 text-2xl font-bold bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            JOGAR NOVAMENTE
          </button>
        </div>
      </div>
    );
  }

  // Tela de início
  if (!gameStarted) {
    return (      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 text-blue-400">SPACE FIGHTER</h1>          <div className="text-xl mb-8 space-y-2">
            <p><strong>W/A/S/D</strong> - Mover Nave (Cima/Esquerda/Baixo/Direita)</p>
            <p><strong>SPACE</strong> - Acelerar</p>
            <p><strong>CTRL</strong> - Desacelerar/Frear</p>
            <p><strong>MOUSE</strong> - Mirar e Atirar (Clique Esquerdo)</p>
          </div>
          <button
            onClick={startGame}
            className="px-8 py-4 text-2xl font-bold bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            INICIAR JOGO
          </button>
        </div>
      </div>
    );
  }  // HUD do jogo
  return (
    <>
      {/* Flash de dano - overlay vermelho que cobre toda a tela */}
      <div
        className={`pointer-events-none absolute inset-0 bg-red-500 transition-opacity duration-150 ${
          isTakingDamage ? 'opacity-30' : 'opacity-0'
        }`}
      />
      
      <div className="absolute top-0 left-0 z-10 p-4 text-white pointer-events-none">
      <div className="bg-black bg-opacity-60 rounded-lg p-4 border border-blue-500">
        <div className="text-2xl font-bold mb-2">Score: <span className="text-yellow-400">{score}</span></div>
        
        {/* Barra de vida */}
        <div className="mb-2">
          <div className="text-lg mb-1">
            Vida: <span className={playerHealth > 50 ? "text-green-400" : playerHealth > 25 ? "text-yellow-400" : "text-red-400"}>{playerHealth}</span>
            {isInvincible && <span className="text-red-400 ml-2 animate-pulse">[INVENCÍVEL]</span>}
          </div>
          <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                playerHealth > 50 ? "bg-green-500" : 
                playerHealth > 25 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${playerHealth}%` }}
            />
          </div>
        </div>
        
        <div className="text-lg">Inimigos: <span className="text-red-400">{enemyCount}</span></div>
          <button
          onClick={resetGame}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors pointer-events-auto"
        >
          Reiniciar
        </button>
      </div>
    </div>
    </>
  );
}
