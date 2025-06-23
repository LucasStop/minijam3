'use client';

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ProjectileProps {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  onRemove: (id: string) => void;
}

export const Projectile = forwardRef<THREE.Mesh, ProjectileProps>(
  ({ id, position, direction, onRemove }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    // Expose the mesh ref to the parent component
    useImperativeHandle(ref, () => meshRef.current!);
    const speed = 0.8; // Velocidade otimizada para gameplay
    const maxDistance = 100;
    const startPosition = position.clone();
    useFrame(() => {
      if (meshRef.current) {
        // Move o projétil na direção especificada
        meshRef.current.position.add(direction.clone().multiplyScalar(speed));

        // Remove o projétil se ele estiver muito longe
        const distance = meshRef.current.position.distanceTo(startPosition);
        if (distance > maxDistance) {
          console.log(
            `🗑️ Removendo projétil ${id} por distância: ${distance.toFixed(2)}`
          );
          onRemove(id);
        }
      }
    });
    return (
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.15, 8, 8]} />
        {/* Tamanho otimizado para colisão */}
        <meshStandardMaterial
          color='#ffff00'
          emissive='#ffff00'
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
    );
  }
);

Projectile.displayName = 'Projectile';
