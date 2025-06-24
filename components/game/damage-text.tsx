'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DamageTextProps {
  damage: number;
  position: THREE.Vector3;
  onComplete: () => void;
}

export function DamageText({ damage, position, onComplete }: DamageTextProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [startTime] = useState(Date.now());
  const duration = 2000; // 2 segundos

  useFrame(() => {
    if (!meshRef.current) return;

    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Animação: move para cima e desaparece
    const offset = progress * 2; // Move 2 unidades para cima
    meshRef.current.position.set(
      position.x,
      position.y + offset,
      position.z + 0.1
    );

    // Fade out
    const opacity = 1 - progress;
    if (meshRef.current.material && 'opacity' in meshRef.current.material) {
      (meshRef.current.material as any).opacity = opacity;
    }
  });

  return (
    <mesh ref={meshRef} position={[position.x, position.y, position.z + 0.1]}>
      <planeGeometry args={[1, 0.5]} />
      <meshBasicMaterial 
        color="#ff4444"
        transparent 
        opacity={1}
      />
    </mesh>
  );
}
