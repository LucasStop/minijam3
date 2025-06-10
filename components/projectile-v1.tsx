// components/projectile-v1.tsx
"use client"

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ProjectileProps {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  onRemove: (id: string) => void;
}

export function Projectile({ id, position, direction, onRemove }: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const maxLifetime = 5000; // 5 segundos
  const speed = 20;

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Move o projétil para frente
    const velocity = direction.clone().multiplyScalar(speed * delta);
    meshRef.current.position.add(velocity);

    // Remove o projétil após um tempo ou se for muito longe
    const currentTime = Date.now();
    const lifetime = currentTime - startTime.current;
    const distanceFromOrigin = meshRef.current.position.length();

    if (lifetime > maxLifetime || distanceFromOrigin > 100) {
      onRemove(id);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial emissive="yellow" color="yellow" />
    </mesh>
  );
}
