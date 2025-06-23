'use client';

import { useGameStore } from '../../stores/gameStore';

export function GameUI() {
  const score = useGameStore((state) => state.score);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const enemyCount = useGameStore((state) => state.enemies.length);
  const playerHealth = useGameStore((state) => state.playerHealth);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const isInvincible = useGameStore((state) => state.isInvincible);
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);

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
  }
  // HUD do jogo
  return (
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
  );
}
