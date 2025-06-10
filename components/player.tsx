'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerProps {
  onShoot: (position: THREE.Vector3) => void;
}

export default function Player({ onShoot }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const position = useRef(new THREE.Vector3(0, -8, 0));
  const keys = useRef({
    left: false,
    right: false,
    space: false,
  });
  const lastShot = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'Space':
          event.preventDefault();
          keys.current.space = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'Space':
          keys.current.space = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(state => {
    if (!meshRef.current) return;

    const speed = 0.3;
    const now = state.clock.elapsedTime;

    // Movimento horizontal
    if (keys.current.left && position.current.x > -9) {
      position.current.x -= speed;
      meshRef.current.rotation.z = 0.2; // Inclinação para a esquerda
    } else if (keys.current.right && position.current.x < 9) {
      position.current.x += speed;
      meshRef.current.rotation.z = -0.2; // Inclinação para a direita
    } else {
      meshRef.current.rotation.z = THREE.MathUtils.lerp(
        meshRef.current.rotation.z,
        0,
        0.1
      );
    }

    // Tiro
    if (keys.current.space && now - lastShot.current > 0.2) {
      onShoot(position.current.clone());
      lastShot.current = now;
    }

    meshRef.current.position.copy(position.current);
  });

  return (
    <mesh ref={meshRef} position={[0, -8, 0]}>
      <coneGeometry args={[0.8, 2, 3]} />
      <meshStandardMaterial color='#00ff88' emissive='#004422' />
    </mesh>
  );
}
