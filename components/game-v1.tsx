// components/game-v1.tsx
'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './scene-v1';

export default function GameV1() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  );
}
