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
  onVelocityChange?: (velocity: THREE.Vector3) => void;
}

export const Player = forwardRef<THREE.Mesh, PlayerProps>(
  ({ onShoot, onVelocityChange }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);    const controls = useControls();
    const lastShotTime = useRef(0);
    const shootCooldown = 200; // milissegundos entre tiros    // Sistema de Física Newtoniana
    // Constantes físicas da nave
    const mass = 1.2; // Massa da nave (kg) - ajuste para sentir mais "pesada" ou "leve"
    const thrust = 18.0; // Força do propulsor (N) - potência dos motores
    const damping = 0.985; // Atrito espacial artificial (0.98-0.99 para controle, 1.0 para física pura)
    
    // Vetores de estado físico (persistem entre frames)
    const velocity = useRef(new THREE.Vector3()); // Velocidade atual (m/s)
    const force = useRef(new THREE.Vector3()); // Força aplicada (N)

    // Conecta a ref externa com a ref interna    React.useImperativeHandle(ref, () => meshRef.current!, []);

    // useFrame executa a cada quadro (frame) da animação
    useFrame((state, delta) => {
      if (!meshRef.current) return;

      // === SISTEMA FÍSICO NEWTONIANO ===
      
      // 1. RESETAR FORÇAS A CADA FRAME
      // As forças só existem enquanto há input do jogador
      force.current.set(0, 0, 0);

      // 2. APLICAR FORÇAS BASEADAS NO INPUT (1ª Lei - Uma força externa atua sobre o objeto)
      if (controls.w) force.current.z = -thrust; // Propulsor principal (frente)
      if (controls.s) force.current.z = thrust;  // Retropropulsores (trás)  
      if (controls.a) force.current.x = -thrust; // Propulsores laterais (esquerda)
      if (controls.d) force.current.x = thrust;  // Propulsores laterais (direita)

      // 3. CALCULAR ACELERAÇÃO (2ª Lei - F = m * a, logo a = F / m)
      const acceleration = force.current.clone().divideScalar(mass);

      // 4. ATUALIZAR VELOCIDADE (v = v₀ + a * t)
      // AQUI ACONTECE A INÉRCIA! A velocidade se acumula ao longo do tempo
      velocity.current.add(acceleration.multiplyScalar(delta));

      // 5. APLICAR ATRITO ESPACIAL ARTIFICIAL (para controle mais arcade)
      // Em física pura do vácuo, não haveria atrito, mas isso torna o jogo injogável
      const hasInput = controls.w || controls.s || controls.a || controls.d;
      if (!hasInput) {
        // Fator de frame-rate independente para atrito uniforme
        const dampingFactor = Math.pow(damping, delta * 60);
        velocity.current.multiplyScalar(dampingFactor);
      }

      // 6. ATUALIZAR POSIÇÃO (p = p₀ + v * t)
      meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta));      // 7. LIMITAR A POSIÇÃO DA NAVE NA TELA (com física realista)
      const { viewport } = state;
      const bounds = {
        x: viewport.width / 2 - 1,
        z: viewport.height / 2 - 1,
      };

      const playerPosition = meshRef.current.position;
      
      // Ao colidir com os limites, preserva a física: 
      // a velocidade é zerada naquele eixo (como colidir com uma parede)
      if (playerPosition.x >= bounds.x) {
        playerPosition.x = bounds.x;
        velocity.current.x = Math.min(0, velocity.current.x); // Remove velocidade positiva
      }
      if (playerPosition.x <= -bounds.x) {
        playerPosition.x = -bounds.x;
        velocity.current.x = Math.max(0, velocity.current.x); // Remove velocidade negativa
      }
      if (playerPosition.z >= bounds.z) {
        playerPosition.z = bounds.z;
        velocity.current.z = Math.min(0, velocity.current.z);
      }
      if (playerPosition.z <= -bounds.z) {
        playerPosition.z = -bounds.z;
        velocity.current.z = Math.max(0, velocity.current.z);
      }      // 8. ROTAÇÃO DINÂMICA (BANKING) BASEADA NA VELOCIDADE REAL
      const playerRotation = meshRef.current.rotation;
      
      // Inclinação lateral proporcional à velocidade horizontal
      const targetRotationZ = -velocity.current.x * 0.12;
      playerRotation.z = MathUtils.lerp(playerRotation.z, targetRotationZ, 0.1);
      
      // Inclinação frontal proporcional à velocidade vertical
      const targetRotationX = Math.PI / 2 + velocity.current.z * 0.04;
      playerRotation.x = MathUtils.lerp(playerRotation.x, targetRotationX, 0.08);

      // 9. COMUNICAR VELOCIDADE PARA COMPONENTES EXTERNOS (estrelas)
      if (onVelocityChange) {
        onVelocityChange(velocity.current.clone());
      }      // 10. SISTEMA DE TIRO (direção corrigida para frente)
      if (controls.space) {
        const currentTime = Date.now();
        if (currentTime - lastShotTime.current > shootCooldown) {
          // Direção para frente no espaço do jogo (eixo Z negativo)
          // Como a nave tem rotação inicial, vamos usar uma direção fixa para frente
          const shootDirection = new THREE.Vector3(0, 0, -1);

          // Posição ligeiramente à frente da nave para o projétil começar
          // Considerando que a nave aponta para frente (Z negativo)
          const shootPosition = meshRef.current.position
            .clone()
            .add(new THREE.Vector3(0, 0, -1.2));

          // Disparo sem afetar o movimento da nave (melhor para gameplay)
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
