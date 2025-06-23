'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface AimingReticleProps {
  target: THREE.Vector3; // Recebe o vetor de mira como prop
}

export function AimingReticle({ target }: AimingReticleProps) {
  const reticleRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (reticleRef.current) {
      // A cada frame, posiciona a mira no local do alvo
      reticleRef.current.position.copy(target);
    }
  });

  return (
    <group ref={reticleRef}>
      {/* Círculo externo */}
      <mesh>
        <ringGeometry args={[0.15, 0.2, 16]} />
        <meshBasicMaterial color='red' transparent opacity={0.6} />
      </mesh>

      {/* Ponto central */}
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color='red' transparent opacity={0.8} />
      </mesh>

      {/* Linhas cruzadas */}
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[0.4, 0.02]} />
        <meshBasicMaterial color='red' transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.4, 0.02]} />
        <meshBasicMaterial color='red' transparent opacity={0.7} />
      </mesh>
    </group>
  );
}
