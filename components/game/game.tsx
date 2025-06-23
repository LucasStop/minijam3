'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './scene';
import { GameUI } from '../ui/game-ui';

export default function Game() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      {/* Interface do usuário sobreposta */}
      <GameUI />
      
      {/* Canvas 3D */}
      <Canvas camera={{ position: [0, 1, 10], fov: 75 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
