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
        <p>Hitboxes integradas: <span className="text-green-400">ATIVAS</span></p>
        <p className="text-gray-400 mt-2">Hitboxes seguem os objetos:</p>
        <p className="text-cyan-400">• Projéteis: Esferas azuis</p>
        <p className="text-red-400">• Inimigos: Esferas vermelhas</p>
        <p className="text-gray-400 mt-2">✅ Sincronizadas com movimento</p>
        <p className="text-gray-400">🎯 Console: Logs de colisão</p>
      </div>
    </div>
  );
}
