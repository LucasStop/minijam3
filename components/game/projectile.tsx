'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ProjectileProps {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  onRemove: (id: string) => void;
}

export function Projectile({
  id,
  position,
  direction,
  onRemove,
}: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const speed = 0.5;
  const maxDistance = 100;
  const startPosition = position.clone();

  useFrame(() => {
    if (meshRef.current) {
      // Move o projétil na direção especificada
      meshRef.current.position.add(direction.clone().multiplyScalar(speed));

      // Remove o projétil se ele estiver muito longe
      const distance = meshRef.current.position.distanceTo(startPosition);
      if (distance > maxDistance) {
        onRemove(id);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color='yellow' />
    </mesh>
  );
}
