// components/player-v1.tsx
"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Hook customizado para detectar quais teclas estão pressionadas
const useControls = () => {
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, space: false });
  useEffect(() => {
    const keyMap = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', Space: 'space' };
    const onKeyDown = (e: KeyboardEvent) => setKeys((k) => ({ ...k, [keyMap[e.code as keyof typeof keyMap]]: true }));
    const onKeyUp = (e: KeyboardEvent) => setKeys((k) => ({ ...k, [keyMap[e.code as keyof typeof keyMap]]: false }));
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);
  return keys;
};

interface PlayerProps {
  onShoot: (position: THREE.Vector3, direction: THREE.Vector3) => void;
}

export const Player = React.forwardRef<THREE.Mesh, PlayerProps>((props, ref) => {
  const { onShoot } = props;
  const controls = useControls();
  const lastShotTime = useRef(0);
  const shootCooldown = 200; // milissegundos entre tiros
  
  // useFrame executa a cada quadro (frame) da animação
  useFrame((state, delta) => {
    if (!ref || typeof ref === 'function' || !ref.current) return;

    const moveSpeed = 10 * delta; // Multiplicar por 'delta' torna o movimento independente do framerate
    const rotationSpeed = 3 * delta;

    // Rotação (Yaw)
    if (controls.a) {
      ref.current.rotation.y += rotationSpeed;
    }
    if (controls.d) {
      ref.current.rotation.y -= rotationSpeed;
    }

    // Movimento para frente
    if (controls.w) {
      const forwardVector = new THREE.Vector3();
      // Pega a direção "para frente" local da nave e a converte para coordenadas globais
      ref.current.getWorldDirection(forwardVector);
      // Move a nave nessa direção
      ref.current.position.add(forwardVector.multiplyScalar(moveSpeed));
    }

    // Sistema de tiro
    if (controls.space) {
      const currentTime = Date.now();
      if (currentTime - lastShotTime.current > shootCooldown) {
        // Calcular posição da ponta da nave
        const forwardVector = new THREE.Vector3();
        ref.current.getWorldDirection(forwardVector);
        
        // Posição ligeiramente à frente da nave para o projétil começar
        const shootPosition = ref.current.position.clone().add(forwardVector.multiplyScalar(1.2));
        
        // Direção do tiro (mesma direção da nave)
        const shootDirection = new THREE.Vector3();
        ref.current.getWorldDirection(shootDirection);
        
        onShoot(shootPosition, shootDirection);
        lastShotTime.current = currentTime;
      }
    }
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[0.5, 2, 8]} />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
});

Player.displayName = 'Player';
