'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';

interface EnemyProps {
  position: THREE.Vector3;
}

export default function Enemy({ position }: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(state => {
    if (!meshRef.current) return;

    meshRef.current.position.copy(position);
    meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.8]} />
      <meshStandardMaterial color='#ff4444' emissive='#440000' />
    </mesh>
  );
}