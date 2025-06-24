'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface AimingReticleProps {
  target: THREE.Vector3; // Recebe o vetor de mira como prop
}

export function AimingReticle({ target }: AimingReticleProps) {
  const reticleRef = useRef<THREE.Group>(null);
  const { camera, raycaster, pointer } = useThree();

  // Estado para detectar se há um inimigo sob o cursor
  const isTargetingEnemy = useRef(false);

  useFrame(state => {
    if (reticleRef.current) {
      // Interpolação suave da posição para movimento mais fluido
      reticleRef.current.position.lerp(target, 0.8);

      // Detecção de inimigo sob o cursor
      raycaster.setFromCamera(pointer, camera);
      const scene = camera.parent;

      if (scene) {
        const intersects = raycaster.intersectObjects(scene.children, true);
        const enemyHit = intersects.find(intersect => {
          const obj = intersect.object;
          return (
            obj.userData?.isEnemy === true &&
            obj.type === 'Mesh' &&
            (obj as THREE.Mesh).geometry?.type !== 'SphereGeometry'
          );
        });

        isTargetingEnemy.current = !!enemyHit;
      }

      // Ajustar visual baseado se está mirando em um inimigo
      const pulseSpeed = isTargetingEnemy.current ? 12 : 6;
      const pulseScale = isTargetingEnemy.current
        ? 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.15
        : 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.08;

      reticleRef.current.scale.setScalar(pulseScale);

      // Rotação mais rápida quando mirando em inimigo
      const rotationSpeed = isTargetingEnemy.current ? 0.02 : 0.01;
      reticleRef.current.rotation.z += rotationSpeed;
    }
  });

  return (
    <group ref={reticleRef}>
      {/* Círculo externo principal - cor muda quando mira em inimigo */}
      <mesh>
        <ringGeometry args={[0.18, 0.22, 16]} />
        <meshBasicMaterial
          color={isTargetingEnemy.current ? '#ff4444' : '#00ff00'}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Ponto central mais proeminente */}
      <mesh>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial
          color={isTargetingEnemy.current ? '#ff4444' : '#00ff00'}
          transparent
          opacity={1.0}
        />
      </mesh>

      {/* Círculo interno para precisão */}
      <mesh>
        <ringGeometry args={[0.04, 0.06, 12]} />
        <meshBasicMaterial
          color='#ffffff'
          transparent
          opacity={isTargetingEnemy.current ? 1.0 : 0.8}
        />
      </mesh>

      {/* Indicador especial quando mirando em inimigo */}
      {isTargetingEnemy.current && (
        <mesh>
          <ringGeometry args={[0.25, 0.28, 8]} />
          <meshBasicMaterial color='#ff4444' transparent opacity={0.6} />
        </mesh>
      )}

      {/* Linhas cruzadas otimizadas */}
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[0.45, 0.025]} />
        <meshBasicMaterial
          color={isTargetingEnemy.current ? '#ff4444' : '#00ff00'}
          transparent
          opacity={0.7}
        />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.45, 0.025]} />
        <meshBasicMaterial
          color={isTargetingEnemy.current ? '#ff4444' : '#00ff00'}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}
