'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './scene';
import { GameUI } from '../ui/game-ui';
import { DebugPanel } from './debug-panel';

interface GameProps {
  onBackToMenu?: () => void;
}

export default function Game({ onBackToMenu }: GameProps) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'black',
        cursor: 'crosshair',
      }}
    >
      {/* Interface do usuário sobreposta */}
      <GameUI onBackToMenu={onBackToMenu} />
      
      {/* Painel de debug */}
      <DebugPanel />

      {/* Canvas 3D */}
      <Canvas camera={{ position: [0, 1, 10], fov: 75 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
