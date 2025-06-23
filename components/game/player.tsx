'use client';

import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MathUtils } from 'three';

// Hook customizado para detectar quais teclas estão pressionadas
const useControls = () => {
  const [keys, setKeys] = React.useState({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
  });
  React.useEffect(() => {
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

interface PlayerProps {
  onShoot: (position: THREE.Vector3, direction: THREE.Vector3) => void;
}

export const Player = forwardRef<THREE.Mesh, PlayerProps>(
  ({ onShoot }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const controls = useControls();
    const lastShotTime = useRef(0);
    const shootCooldown = 200; // milissegundos entre tiros

    // Vetores para movimento suave
    const velocity = useRef(new THREE.Vector3());
    const targetVelocity = useRef(new THREE.Vector3());
    
    // Configurações de movimento
    const speed = 8;
    const deceleration = 0.92; // Fator de desaceleração (ajuste para mais ou menos "deslize")
    const acceleration = 0.15; // Velocidade de interpolação para aceleração

    // Conecta a ref externa com a ref interna
    React.useImperativeHandle(ref, () => meshRef.current!, []);    // useFrame executa a cada quadro (frame) da animação
    useFrame((state, delta) => {
      if (!meshRef.current) return;

      // 1. Definir a velocidade alvo com base no input
      targetVelocity.current.set(0, 0, 0);
      
      if (controls.w) targetVelocity.current.z = -speed; // Frente
      if (controls.s) targetVelocity.current.z = speed;  // Trás
      if (controls.a) targetVelocity.current.x = -speed; // Esquerda
      if (controls.d) targetVelocity.current.x = speed;  // Direita

      // 2. Interpolar a velocidade atual em direção à velocidade alvo
      velocity.current.lerp(targetVelocity.current, acceleration);

      // 3. Aplicar desaceleração gradual quando não há input
      const hasInput = controls.w || controls.s || controls.a || controls.d;
      if (!hasInput) {
        velocity.current.multiplyScalar(deceleration);
      }

      // 4. Atualizar a posição do jogador
      meshRef.current.position.addScaledVector(velocity.current, delta);

      // 5. Limitar a posição da nave na tela
      const { viewport } = state;
      const bounds = {
        x: viewport.width / 2 - 1, // Margem de segurança
        z: viewport.height / 2 - 1, // Usando Z em vez de Y para este jogo
      };

      const playerPosition = meshRef.current.position;

      // Restringe o eixo X (horizontal)
      playerPosition.x = Math.max(-bounds.x, Math.min(bounds.x, playerPosition.x));
      
      // Restringe o eixo Z (vertical no jogo)
      playerPosition.z = Math.max(-bounds.z, Math.min(bounds.z, playerPosition.z));

      // 6. Adicionar rotação sutil (banking) ao mover
      const playerRotation = meshRef.current.rotation;
      
      // Inclinação lateral baseada na velocidade horizontal
      const targetRotationZ = -velocity.current.x * 0.15;
      playerRotation.z = MathUtils.lerp(playerRotation.z, targetRotationZ, 0.1);
      
      // Leve inclinação para frente/trás baseada na velocidade vertical
      const targetRotationX = Math.PI / 2 + velocity.current.z * 0.05;
      playerRotation.x = MathUtils.lerp(playerRotation.x, targetRotationX, 0.08);

      // Sistema de tiro
      if (controls.space) {
        const currentTime = Date.now();
        if (currentTime - lastShotTime.current > shootCooldown) {
          // Calcular posição da ponta da nave
          const forwardVector = new THREE.Vector3(0, 0, -1);
          forwardVector.applyQuaternion(meshRef.current.quaternion);

          // Posição ligeiramente à frente da nave para o projétil começar
          const shootPosition = meshRef.current.position
            .clone()
            .add(forwardVector.multiplyScalar(1.2));

          // Direção do tiro (sempre para frente da nave)
          const shootDirection = new THREE.Vector3(0, 0, -1);
          shootDirection.applyQuaternion(meshRef.current.quaternion);

          onShoot(shootPosition, shootDirection);
          lastShotTime.current = currentTime;
        }
      }
    });

    return (
      <mesh ref={meshRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, 2, 8]} />
        <meshStandardMaterial color='royalblue' />
      </mesh>
    );
  }
);

Player.displayName = 'Player';
