'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ThrusterEffectsProps {
  playerRef: React.RefObject<THREE.Mesh>;
  force: THREE.Vector3;
  isActive: boolean;
}

export function ThrusterEffects({ playerRef, force, isActive }: ThrusterEffectsProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 50;

  // Gerar posições iniciais das partículas
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  // Inicializar partículas
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0; 
    positions[i * 3 + 2] = 0;
    
    velocities[i * 3] = (Math.random() - 0.5) * 0.1;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
    velocities[i * 3 + 2] = Math.random() * 0.2 + 0.1;
    
    sizes[i] = Math.random() * 0.05 + 0.02;
  }

  useFrame((state, delta) => {
    if (!particlesRef.current || !playerRef.current || !isActive) return;

    // Posicionar as partículas atrás da nave
    const navePosition = playerRef.current.position;
    
    // Atualizar posições das partículas
    for (let i = 0; i < particleCount; i++) {
      // Adicionar movimento baseado na força aplicada
      positions[i * 3] += velocities[i * 3] * delta;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      // Reset partículas que foram muito longe
      if (positions[i * 3 + 2] > 2) {
        positions[i * 3] = navePosition.x + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 1] = navePosition.y + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 2] = navePosition.z + 1;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!isActive) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ff6600"
        transparent
        opacity={0.8}
        sizeAttenuation={true}
      />
    </points>
  );
}
