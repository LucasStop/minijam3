'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../stores/gameStore';
import * as THREE from 'three';

interface EnemyManagerProps {
  difficulty?: number; // 1 = fácil, 2 = médio, 3 = difícil
}

export function EnemyManager({ difficulty = 1 }: EnemyManagerProps) {
  const spawnEnemy = useGameStore((state) => state.spawnEnemy);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const score = useGameStore((state) => state.score);
  
  // Timers para diferentes tipos de inimigos
  const basicTimer = useRef(0);
  const fastTimer = useRef(0);
  const heavyTimer = useRef(0);
  
  // Intervalos baseados na dificuldade
  const getSpawnIntervals = () => {
    const baseDifficulty = Math.max(0.5, 1 - (score * 0.001)); // Fica mais difícil com o score
    
    return {
      basic: (3 - difficulty) * baseDifficulty + 1, // 1-3 segundos
      fast: (6 - difficulty) * baseDifficulty + 2,  // 2-5 segundos
      heavy: (10 - difficulty) * baseDifficulty + 5, // 5-12 segundos
    };
  };

  useFrame((state, delta) => {
    if (!gameStarted) return;

    const intervals = getSpawnIntervals();
    const { viewport } = state;
    
    // Atualizar timers
    basicTimer.current += delta;
    fastTimer.current += delta;
    heavyTimer.current += delta;

    // Spawnar inimigo básico
    if (basicTimer.current >= intervals.basic) {
      basicTimer.current = 0;
      spawnBasicEnemy(viewport);
    }

    // Spawnar inimigo rápido (menos frequente)
    if (fastTimer.current >= intervals.fast) {
      fastTimer.current = 0;
      spawnFastEnemy(viewport);
    }

    // Spawnar inimigo pesado (raro)
    if (heavyTimer.current >= intervals.heavy && score > 50) {
      heavyTimer.current = 0;
      spawnHeavyEnemy(viewport);
    }
  });

  const spawnBasicEnemy = (viewport: any) => {
    const spawnX = (Math.random() - 0.5) * viewport.width;
    const spawnY = Math.random() * (viewport.height * 0.3) + (viewport.height * 0.2);
    const spawnZ = -25;
    
    spawnEnemy(new THREE.Vector3(spawnX, spawnY, spawnZ), 'basic');
  };

  const spawnFastEnemy = (viewport: any) => {
    // Inimigos rápidos aparecem mais nas laterais
    const side = Math.random() < 0.5 ? -1 : 1;
    const spawnX = side * (viewport.width * 0.6 + Math.random() * viewport.width * 0.3);
    const spawnY = (Math.random() - 0.5) * viewport.height * 0.5;
    const spawnZ = -20;
    
    spawnEnemy(new THREE.Vector3(spawnX, spawnY, spawnZ), 'fast');
  };

  const spawnHeavyEnemy = (viewport: any) => {
    // Inimigos pesados aparecem no centro, mais ameaçadores
    const spawnX = (Math.random() - 0.5) * viewport.width * 0.4;
    const spawnY = viewport.height * 0.3 + Math.random() * viewport.height * 0.2;
    const spawnZ = -30;
    
    spawnEnemy(new THREE.Vector3(spawnX, spawnY, spawnZ), 'heavy');
  };

  return null; // Este componente não renderiza nada visível
}
