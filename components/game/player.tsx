'use client';

import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MathUtils } from 'three';

// Hook customizado para detectar quais teclas estão pressionadas
const useControls = () => {
  const [keys, setKeys] = React.useState({
    w: false,      // Cima
    a: false,      // Esquerda
    s: false,      // Baixo
    d: false,      // Direita
    space: false,  // Acelerar
    ctrl: false,   // Retroceder
  });
  
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          setKeys(k => ({ ...k, w: true }));
          break;
        case 'KeyA':
          setKeys(k => ({ ...k, a: true }));
          break;
        case 'KeyS':
          setKeys(k => ({ ...k, s: true }));
          break;
        case 'KeyD':
          setKeys(k => ({ ...k, d: true }));
          break;
        case 'Space':
          e.preventDefault(); // Evita scroll da página
          setKeys(k => ({ ...k, space: true }));
          break;
        case 'ControlLeft':
        case 'ControlRight':
          setKeys(k => ({ ...k, ctrl: true }));
          break;
      }
    };
    
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          setKeys(k => ({ ...k, w: false }));
          break;
        case 'KeyA':
          setKeys(k => ({ ...k, a: false }));
          break;
        case 'KeyS':
          setKeys(k => ({ ...k, s: false }));
          break;
        case 'KeyD':
          setKeys(k => ({ ...k, d: false }));
          break;
        case 'Space':
          setKeys(k => ({ ...k, space: false }));
          break;
        case 'ControlLeft':
        case 'ControlRight':
          setKeys(k => ({ ...k, ctrl: false }));
          break;
      }
    };

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
  onVelocityChange?: (velocity: THREE.Vector3) => void;
}

export const Player = forwardRef<THREE.Mesh, PlayerProps>(
  ({ onShoot, onVelocityChange }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);    const controls = useControls();
    const lastShotTime = useRef(0);
    const shootCooldown = 200; // milissegundos entre tiros    // Sistema de Movimento 2D Cartesiano
    // Constantes físicas da nave
    const moveSpeed = 8.0; // Velocidade de movimento direto
    const acceleration = 12.0; // Aceleração para SPACE
    const maxSpeed = 15.0; // Velocidade máxima
    const damping = 0.985; // Atrito para parada gradual
    const deceleration = 8.0; // Desaceleração para CTRL
    
    // Vetores de estado físico (persistem entre frames)
    const velocity = useRef(new THREE.Vector3()); // Velocidade atual
    const targetVelocity = useRef(new THREE.Vector3()); // Velocidade desejada
    
    // Conecta a ref externa com a ref interna    // useFrame executa a cada quadro (frame) da animação
    useFrame((state, delta) => {
      if (!meshRef.current) return;

      // === SISTEMA DE MOVIMENTO CARTESIANO 2D ===
      
      // 1. CALCULAR MOVIMENTO BASEADO EM WASD
      const inputVector = new THREE.Vector3(0, 0, 0);
      
      if (controls.w) {
        inputVector.y += 1; // Cima
      }
      if (controls.s) {
        inputVector.y -= 1; // Baixo
      }
      if (controls.a) {
        inputVector.x -= 1; // Esquerda
      }
      if (controls.d) {
        inputVector.x += 1; // Direita
      }
      
      // Normalizar o vetor de input para movimento diagonal consistente
      if (inputVector.length() > 0) {
        inputVector.normalize();
        targetVelocity.current.copy(inputVector.multiplyScalar(moveSpeed));
      } else {
        // Sem input - aplicar damping
        targetVelocity.current.multiplyScalar(0);
      }

      // 2. CONTROLE DE ACELERAÇÃO E DESACELERAÇÃO
      if (controls.space) {
        // SPACE = Acelerar na direção atual do movimento
        if (velocity.current.length() > 0) {
          // Se já está se movendo, acelera na mesma direção
          const currentDirection = velocity.current.clone().normalize();
          const boost = currentDirection.multiplyScalar(acceleration * delta);
          velocity.current.add(boost);
        } else if (inputVector.length() > 0) {
          // Se não está se movendo mas tem input, acelera na direção do input
          const boost = inputVector.clone().normalize().multiplyScalar(acceleration * delta);
          velocity.current.add(boost);
        }
        
        // Sistema de tiro (com cooldown)
        const currentTime = Date.now();
        if (currentTime - lastShotTime.current > shootCooldown) {
          // Direção de tiro sempre para frente (eixo Z negativo)
          const shootDirection = new THREE.Vector3(0, 0, -1);
          
          // Posição de spawn à frente da nave
          const shootPosition = meshRef.current.position
            .clone()
            .add(shootDirection.multiplyScalar(1.2));

          onShoot(shootPosition, shootDirection);
          lastShotTime.current = currentTime;
        }
      } else if (controls.ctrl) {
        // CTRL = Desacelerar/Frear
        velocity.current.multiplyScalar(Math.pow(0.9, delta * 60));
      } else {
        // Aplicar damping suave quando não há input de aceleração
        velocity.current.multiplyScalar(Math.pow(damping, delta * 60));
      }

      // 3. INTERPOLAR VELOCIDADE PARA MOVIMENTO SUAVE
      velocity.current.lerp(targetVelocity.current, 0.15);

      // 4. LIMITAR VELOCIDADE MÁXIMA
      if (velocity.current.length() > maxSpeed) {
        velocity.current.normalize().multiplyScalar(maxSpeed);
      }

      // 5. APLICAR MOVIMENTO
      const deltaPosition = velocity.current.clone().multiplyScalar(delta);
      meshRef.current.position.add(deltaPosition);

      // 6. LIMITAR A POSIÇÃO DA NAVE NA TELA
      const { viewport } = state;
      const bounds = {
        x: viewport.width / 2 - 1,
        y: viewport.height / 2 - 1,
        z: 10, // Limite de profundidade
      };

      const playerPosition = meshRef.current.position;
      
      // Manter a nave dentro dos limites da tela
      if (playerPosition.x >= bounds.x) {
        playerPosition.x = bounds.x;
        velocity.current.x = Math.min(velocity.current.x, 0); // Para movimento para direita
      }
      if (playerPosition.x <= -bounds.x) {
        playerPosition.x = -bounds.x;
        velocity.current.x = Math.max(velocity.current.x, 0); // Para movimento para esquerda
      }
      if (playerPosition.y >= bounds.y) {
        playerPosition.y = bounds.y;
        velocity.current.y = Math.min(velocity.current.y, 0); // Para movimento para cima
      }
      if (playerPosition.y <= -bounds.y) {
        playerPosition.y = -bounds.y;
        velocity.current.y = Math.max(velocity.current.y, 0); // Para movimento para baixo
      }
      if (playerPosition.z >= bounds.z) {
        playerPosition.z = bounds.z;
        velocity.current.z = Math.min(velocity.current.z, 0);
      }
      if (playerPosition.z <= -bounds.z) {
        playerPosition.z = -bounds.z;
        velocity.current.z = Math.max(velocity.current.z, 0);
      }

      // 7. EFEITO VISUAL DE INCLINAÇÃO BASEADO NA VELOCIDADE
      const bankingFactor = 0.5;
      const targetRotationZ = -velocity.current.x * bankingFactor;
      meshRef.current.rotation.z = MathUtils.lerp(meshRef.current.rotation.z, targetRotationZ, 0.1);

      // 8. COMUNICAR VELOCIDADE PARA COMPONENTES EXTERNOS (estrelas)
      if (onVelocityChange) {
        onVelocityChange(velocity.current.clone());
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
