// src/components/Player.js
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Hook customizado para detectar quais teclas estão pressionadas
const useControls = () => {
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
  });
  useEffect(() => {
    const keyMap = {
      KeyW: 'w',
      KeyA: 'a',
      KeyS: 's',
      KeyD: 'd',
      Space: 'space',
    };
    const onKeyDown = (e: KeyboardEvent) =>
      setKeys(k => ({ ...k, [keyMap[e.code as keyof typeof keyMap]]: true }));
    const onKeyUp = (e: KeyboardEvent) =>
      setKeys(k => ({ ...k, [keyMap[e.code as keyof typeof keyMap]]: false }));
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);
  return keys;
};

export const Player = React.forwardRef<THREE.Mesh>((props: any, ref) => {
  const controls = useControls();

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
  });

  return (
    <mesh ref={ref} {...props}>
      <coneGeometry args={[0.5, 2, 8]} />
      <meshStandardMaterial color='royalblue' />
    </mesh>
  );
});

Player.displayName = 'Player';
