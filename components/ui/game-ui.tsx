'use client';

import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../lib/soundManager';

interface GameUIProps {
  onBackToMenu?: () => void;
}

export function GameUI({ onBackToMenu }: GameUIProps) {  const {
    currentGameState,
    playerHealth,
    score,
    isInvincible,
    isTakingDamage,
    deathCause,
    debugMode,
    collisionStats,
    setGameState,
    startGame,
    resetGame,
    toggleDebugMode,
  } = useGameStore(
    useShallow(state => ({
      currentGameState: state.currentGameState,
      playerHealth: state.playerHealth,
      score: state.score,
      isInvincible: state.isInvincible,
      isTakingDamage: state.isTakingDamage,
      deathCause: state.deathCause,
      debugMode: state.debugMode,
      collisionStats: state.collisionStats,
      setGameState: state.setGameState,
      startGame: state.startGame,
      resetGame: state.resetGame,
      toggleDebugMode: state.toggleDebugMode,
    }))
  );

  // Estado local para animações
  const [lastScore, setLastScore] = useState(score);
  const [scoreAnimation, setScoreAnimation] = useState(false);

  // Animação de pontuação
  useEffect(() => {
    if (score > lastScore) {
      setScoreAnimation(true);
      soundManager.play('score', 0.3);
      setTimeout(() => setScoreAnimation(false), 300);
    }
    setLastScore(score);
  }, [score, lastScore]);

  // Sons de dano
  useEffect(() => {
    if (isTakingDamage) {
      soundManager.play('damage', 0.5);
    }
  }, [isTakingDamage]);

  // Renderização condicional baseada no estado do jogo
  if (currentGameState === 'menu') {
    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            🚀 SPACE SHOOTER
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Destrua os inimigos e sobreviva o máximo possível!
          </p>
          
          <div className="space-y-4 text-gray-400">
            <p>🎮 <strong>WASD</strong> - Mover</p>
            <p>🖱️ <strong>Mouse</strong> - Mirar e Atirar</p>
            <p>🎯 <strong>Clique nos inimigos</strong> - Tiro direcionado</p>
          </div>

          <button
            onClick={() => {
              startGame();
              soundManager.play('start', 0.6);
            }}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold rounded-lg transition-colors"
          >
            INICIAR JOGO
          </button>

          <div className="mt-8">
            <button
              onClick={toggleDebugMode}
              className={`px-4 py-2 text-sm rounded ${
                debugMode ? 'bg-green-600' : 'bg-gray-600'
              } text-white`}
            >
              Debug: {debugMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentGameState === 'gameOver') {
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold text-red-500 mb-4">
            💀 GAME OVER
          </h1>
            <div className="space-y-2">
            <p className="text-2xl text-white">Pontuação Final: <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span></p>
            <p className="text-lg text-gray-300">Causa da Morte: {deathCause}</p>
            
            {/* Estatísticas de Colisão */}
            <div className="mt-4 p-4 bg-black/30 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-2">📊 Estatísticas da Partida</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-300">
                  <div>🎯 Tiros Disparados: <span className="text-white font-bold">{collisionStats.shotsFired}</span></div>
                  <div>💥 Inimigos Atingidos: <span className="text-green-400 font-bold">{collisionStats.projectileHits}</span></div>
                </div>
                <div className="text-gray-300">
                  <div>🔥 Total de Colisões: <span className="text-yellow-400 font-bold">{collisionStats.totalCollisions}</span></div>
                  <div>🎯 Precisão: <span className="text-blue-400 font-bold">{collisionStats.accuracy.toFixed(1)}%</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <button
              onClick={() => {
                resetGame();
                soundManager.play('start', 0.6);
              }}
              className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-lg transition-colors mr-4"
            >
              🔄 JOGAR NOVAMENTE
            </button>

            <button
              onClick={() => {
                resetGame();
                onBackToMenu?.();
              }}
              className="px-8 py-4 bg-gray-600 hover:bg-gray-500 text-white text-xl font-bold rounded-lg transition-colors"
            >
              📋 VOLTAR AO MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interface durante o jogo (currentGameState === 'playing')
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* HUD Superior */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        {/* Pontuação */}
        <div className={`bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg transition-all duration-300 ${scoreAnimation ? 'scale-110 bg-yellow-500/70' : ''}`}>
          <div className="text-2xl font-bold text-white">
            SCORE: <span className="text-yellow-400">{score.toLocaleString()}</span>
          </div>
        </div>

        {/* Vida do Jogador */}
        <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg">
          <div className="text-lg font-bold text-white mb-2">VIDA</div>
          <div className="w-48 h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                playerHealth > 60 ? 'bg-green-500' :
                playerHealth > 30 ? 'bg-yellow-500' : 'bg-red-500'
              } ${isTakingDamage ? 'animate-pulse' : ''}`}
              style={{ width: `${Math.max(0, playerHealth)}%` }}
            />
          </div>
          <div className="text-sm text-gray-300 mt-1">
            {Math.max(0, Math.round(playerHealth))}/100
          </div>
        </div>
      </div>

      {/* Estados Especiais */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        {isInvincible && (
          <div className="bg-red-500/80 text-white px-4 py-2 rounded-lg animate-pulse">
            🛡️ INVENCÍVEL
          </div>
        )}
      </div>

      {/* Aviso de Vida Baixa */}
      {playerHealth <= 25 && playerHealth > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-4 border-red-500 animate-pulse opacity-50" />
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-red-500 text-2xl font-bold animate-pulse">
            ⚠️ VIDA CRÍTICA ⚠️
          </div>
        </div>
      )}      {/* Controles */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm space-y-1">
          <div>🎮 WASD - Mover</div>
          <div>🖱️ Mouse - Mirar e Atirar</div>
          <div>🎯 Clique nos inimigos</div>
          
          {/* Estatísticas em Debug Mode */}
          {debugMode && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="text-xs text-gray-300">
                <div>📊 Tiros: {collisionStats.shotsFired} | Acertos: {collisionStats.projectileHits}</div>
                <div>🎯 Precisão: {collisionStats.accuracy.toFixed(1)}%</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botões de Controle */}
      <div className="absolute bottom-4 right-4 space-y-2 pointer-events-auto">
        <button
          onClick={toggleDebugMode}
          className={`px-3 py-1 text-xs rounded ${
            debugMode ? 'bg-green-600' : 'bg-gray-600'
          } text-white opacity-70 hover:opacity-100 transition-opacity`}
        >
          Debug: {debugMode ? 'ON' : 'OFF'}
        </button>
        
        <div>
          <button
            onClick={() => setGameState('menu')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors opacity-70 hover:opacity-100"
          >
            📋 Menu
          </button>
        </div>
      </div>

      {/* Efeito de Flash de Dano */}
      {isTakingDamage && (
        <div className="absolute inset-0 bg-red-500 opacity-30 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}