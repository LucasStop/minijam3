// src/App.js
'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './scene-v0';

export default function GameV0() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  );
}
