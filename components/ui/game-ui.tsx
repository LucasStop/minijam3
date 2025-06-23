'use client';

import { useGameStore } from '../../stores/gameStore';

export function GameUI() {
  const score = useGameStore((state) => state.score);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const enemyCount = useGameStore((state) => state.enemies.length);
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);

  if (!gameStarted) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 text-blue-400">SPACE FIGHTER</h1>
          <p className="text-xl mb-8">Use WASD para mover, SPACE para atirar</p>
          <button
            onClick={startGame}
            className="px-8 py-4 text-2xl font-bold bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            INICIAR JOGO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 z-10 p-4 text-white">
      <div className="bg-black bg-opacity-50 rounded-lg p-4">
        <div className="text-2xl font-bold mb-2">Score: {score}</div>
        <div className="text-lg">Inimigos: {enemyCount}</div>
        <button
          onClick={resetGame}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}
