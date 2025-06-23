'use client';

import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useShallow } from 'zustand/react/shallow';

export function DebugPanel() {
  const { 
    enemies, 
    debugMode, 
    toggleDebugMode 
  } = useGameStore(
    useShallow(state => ({
      enemies: state.enemies,
      debugMode: state.debugMode,
      toggleDebugMode: state.toggleDebugMode,
    }))
  );

  if (!debugMode) return null;

  return (
    <div className="absolute top-4 left-4 z-20 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono pointer-events-none">
      <h3 className="text-yellow-400 font-bold mb-2">🔍 DEBUG MODE</h3>
      <div className="space-y-1">
        <p>Inimigos ativos: <span className="text-cyan-400">{enemies.length}</span></p>
        <p>Hitboxes visuais: <span className="text-green-400">ATIVAS</span></p>
        <p className="text-gray-400 mt-2">Hitboxes:</p>
        <p className="text-cyan-400">• Projéteis: Azul</p>
        <p className="text-red-400">• Inimigos: Vermelho</p>
        <p className="text-gray-400 mt-2">Console: Logs de colisão ativos</p>
      </div>
    </div>
  );
}
