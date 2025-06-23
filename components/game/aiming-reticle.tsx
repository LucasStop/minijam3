'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface AimingReticleProps {
  target: THREE.Vector3; // Recebe o vetor de mira como prop
}

export function AimingReticle({ target }: AimingReticleProps) {
  const reticleRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reticleRef.current) {
      // Interpolação suave da posição para movimento mais fluido
      reticleRef.current.position.lerp(target, 0.8);
      
      // Efeito de pulsação mais suave baseado no tempo
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.08;
      reticleRef.current.scale.setScalar(pulseScale);
      
      // Rotação sutil para dinamismo
      reticleRef.current.rotation.z += 0.01;
    }
  });

  return (
    <group ref={reticleRef}>
      {/* Círculo externo principal */}
      <mesh>
        <ringGeometry args={[0.18, 0.22, 16]} />
        <meshBasicMaterial color='#00ff00' transparent opacity={0.9} />
      </mesh>

      {/* Ponto central mais proeminente */}
      <mesh>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color='#00ff00' transparent opacity={1.0} />
      </mesh>
      
      {/* Círculo interno para precisão */}
      <mesh>
        <ringGeometry args={[0.04, 0.06, 12]} />
        <meshBasicMaterial color='#ffffff' transparent opacity={0.8} />
      </mesh>

      {/* Linhas cruzadas otimizadas */}
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[0.45, 0.025]} />
        <meshBasicMaterial color='#00ff00' transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.45, 0.025]} />
        <meshBasicMaterial color='#00ff00' transparent opacity={0.85} />
      </mesh>
      
      {/* Pontos nos cantos para melhor referência */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, index) => (
        <mesh
          key={index}
          position={[
            Math.cos(angle) * 0.3,
            Math.sin(angle) * 0.3,
            0
          ]}
        >
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshBasicMaterial color='#00ff00' transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}
