'use client';

import React, { forwardRef, useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MathUtils } from 'three';
import { AimingReticle } from './aiming-reticle';
import { useGameStore } from '../../stores/gameStore';

// Hook customizado para detectar quais teclas estão pressionadas
const useControls = () => {
  const [keys, setKeys] = React.useState({
    w: false, // Cima
    a: false, // Esquerda
    s: false, // Baixodas
    d: false, // Direita
    space: false, // Acelerar (sem tiro)
    ctrl: false, // Retroceder
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
    const meshRef = useRef<THREE.Mesh>(null);
    const controls = useControls();
    const lastShotTime = useRef(0);
    const shootCooldown = 150; // Reduzido de 200ms para 150ms para tiro mais responsivo    // === ESTADO DO JOGO ===
    // Seletores apenas para estado visual e morte do jogador
    const isGameOver = useGameStore(state => state.isGameOver);
    const isInvincible = useGameStore(state => state.isInvincible);

    // === SISTEMA DE MIRA COM MOUSE ===
    const { camera, raycaster, pointer } = useThree();

    // Plano invisível no eixo Z=0 para calcular a intersecção do raio do mouse
    const aimingPlane = useMemo(
      () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      []
    );

    // Vetor para armazenar o ponto de mira 3D
    const aimTarget = useMemo(() => new THREE.Vector3(), []); // Sistema de Movimento 2D Cartesiano
    // Constantes físicas da nave
    const moveSpeed = 8.0; // Velocidade de movimento direto
    const acceleration = 12.0; // Aceleração para SPACE
    const maxSpeed = 15.0; // Velocidade máxima
    const damping = 0.985; // Atrito para parada gradual
    const deceleration = 8.0; // Desaceleração para CTRL    // Vetores de estado físico (persistem entre frames)
    const velocity = useRef(new THREE.Vector3()); // Velocidade atual
    const targetVelocity = useRef(new THREE.Vector3()); // Velocidade desejada

    // Conecta a ref externa com a ref interna    // useFrame executa a cada quadro (frame) da animação
    useFrame((state, delta) => {
      if (!meshRef.current) return;

      // Se o jogo acabou, congela o jogador no lugar
      if (isGameOver) {
        return;
      }

      // === EFEITO VISUAL DE INVENCIBILIDADE (PISCAR) ===
      if (isInvincible) {
        // Faz a nave piscar usando uma função seno sobre o tempo de jogo
        // A nave ficará visível quando o resultado for positivo, e invisível quando for negativo.
        // Frequência mais rápida para feedback visual mais claro
        meshRef.current.visible = Math.sin(state.clock.elapsedTime * 40) > 0;
      } else {
        // Garante que a nave esteja visível quando não estiver invencível
        meshRef.current.visible = true;
      }

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
      } // 2. CONTROLE DE ACELERAÇÃO E DESACELERAÇÃO
      if (controls.space) {
        // SPACE = Acelerar na direção atual do movimento
        if (velocity.current.length() > 0) {
          // Se já está se movendo, acelera na mesma direção
          const currentDirection = velocity.current.clone().normalize();
          const boost = currentDirection.multiplyScalar(acceleration * delta);
          velocity.current.add(boost);
        } else if (inputVector.length() > 0) {
          // Se não está se movendo mas tem input, acelera na direção do input
          const boost = inputVector
            .clone()
            .normalize()
            .multiplyScalar(acceleration * delta);
          velocity.current.add(boost);
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
      meshRef.current.rotation.z = MathUtils.lerp(
        meshRef.current.rotation.z,
        targetRotationZ,
        0.1
      ); // 8. COMUNICAR VELOCIDADE PARA COMPONENTES EXTERNOS (estrelas)
      if (onVelocityChange) {
        onVelocityChange(velocity.current.clone());
      }      // 9. SISTEMA DE MIRA OTIMIZADO COM MOUSE
      // Atualizar a posição do alvo baseado na posição do mouse com maior precisão
      raycaster.setFromCamera(pointer, camera);
      
      // Usar múltiplos planos para melhor precisão dependendo da profundidade
      const currentPlayerPosition = meshRef.current.position;
      const aimingPlaneDistance = -15; // Plano mais distante para melhor precisão
      const aimingPlaneUpdated = new THREE.Plane(new THREE.Vector3(0, 0, 1), aimingPlaneDistance);
      
      // Intersecção com o plano
      const intersectionPoint = new THREE.Vector3();
      const hasIntersection = raycaster.ray.intersectPlane(aimingPlaneUpdated, intersectionPoint);
      
      if (hasIntersection) {
        aimTarget.copy(intersectionPoint);
        
        // Garantir que o alvo não fique atrás da nave
        if (aimTarget.z > currentPlayerPosition.z) {
          aimTarget.z = currentPlayerPosition.z - 8;
        }
        
        // Limitar a distância da mira para evitar tiros muito distantes
        const maxAimDistance = 25;
        const aimDistance = aimTarget.distanceTo(currentPlayerPosition);
        if (aimDistance > maxAimDistance) {
          const direction = aimTarget.clone().sub(currentPlayerPosition).normalize();
          aimTarget.copy(currentPlayerPosition).add(direction.multiplyScalar(maxAimDistance));
        }
      } else {
        // Fallback: mira na frente da nave se não houver intersecção
        aimTarget.copy(currentPlayerPosition).add(new THREE.Vector3(0, 0, -10));
      }

      // 10. DETECÇÃO DE COLISÃO REMOVIDA - AGORA CENTRALIZADA EM SCENE.TSX
      // A lógica de colisão jogador-inimigo foi movida para Scene.tsx para evitar duplicação
    });

    // === FUNÇÃO DE TIRO OTIMIZADA COM FÍSICA APRIMORADA ===
    const handleShoot = () => {
      if (!meshRef.current || isGameOver) return;

      const currentTime = Date.now();
      if (currentTime - lastShotTime.current < shootCooldown) return;

      const playerPosition = meshRef.current.position.clone();
      
      // Calcular a direção do tiro com maior precisão
      const shootDirection = aimTarget.clone().sub(playerPosition).normalize();
      
      // Verificar se a direção é válida
      if (shootDirection.length() === 0) {
        // Fallback: atirar para frente
        shootDirection.set(0, 0, -1);
      }
      
      // Posição de spawn OTIMIZADA na frente da nave
      const spawnDistance = 1.2;
      const spawnOffset = shootDirection.clone().multiplyScalar(spawnDistance);
      const shootPosition = playerPosition.add(spawnOffset);

      // Física melhorada: combinar velocidade da nave com direção do tiro
      const playerVelocityContribution = velocity.current.clone().multiplyScalar(0.2);
      const finalDirection = shootDirection.clone().add(playerVelocityContribution).normalize();

      // Log menos verboso para performance
      console.log(`🎯 Tiro: ${finalDirection.x.toFixed(2)}, ${finalDirection.y.toFixed(2)}, ${finalDirection.z.toFixed(2)}`);

      onShoot(shootPosition, finalDirection);
      lastShotTime.current = currentTime;
    };

    // === EVENTO DE MOUSE OTIMIZADO PARA TIRO ===
    useEffect(() => {
      let isMouseDown = false;
      let shootInterval: NodeJS.Timeout | null = null;
      let animationFrame: number | null = null;

      const handleMouseDown = (event: MouseEvent) => {
        // Verifica se é clique esquerdo e não está em game over
        if (event.button === 0 && !isGameOver) {
          event.preventDefault(); // Previne comportamentos padrão
          isMouseDown = true;
          
          // Tiro imediato com feedback
          handleShoot();
          
          // Configurar tiro contínuo mais suave usando requestAnimationFrame
          let lastShot = Date.now();
          
          const continuousShoot = () => {
            if (isMouseDown && !isGameOver) {
              const now = Date.now();
              if (now - lastShot >= shootCooldown) {
                handleShoot();
                lastShot = now;
              }
              animationFrame = requestAnimationFrame(continuousShoot);
            }
          };
          
          animationFrame = requestAnimationFrame(continuousShoot);
        }
      };

      const handleMouseUp = (event: MouseEvent) => {
        if (event.button === 0) {
          event.preventDefault();
          isMouseDown = false;
          
          // Limpar tiro contínuo
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
          }
          if (shootInterval) {
            clearInterval(shootInterval);
            shootInterval = null;
          }
        }
      };

      // Parar tiro em várias situações
      const stopShooting = () => {
        isMouseDown = false;
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        if (shootInterval) {
          clearInterval(shootInterval);
          shootInterval = null;
        }
      };

      // Eventos mais abrangentes para controle preciso
      const handleContextMenu = (event: MouseEvent) => {
        event.preventDefault(); // Previne menu do botão direito
      };

      const handleMouseLeave = () => stopShooting();
      const handleVisibilityChange = () => {
        if (document.hidden) stopShooting();
      };

      // Adicionar listeners
      window.addEventListener('mousedown', handleMouseDown, { passive: false });
      window.addEventListener('mouseup', handleMouseUp, { passive: false });
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup
      return () => {
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        stopShooting();
      };
    }, [isGameOver, shootCooldown]); // Dependências otimizadas

    return isGameOver ? null : (
      <>
        <mesh ref={meshRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.5, 2, 8]} />
          <meshStandardMaterial
            color={isInvincible ? 'red' : 'royalblue'}
            transparent
            opacity={isInvincible ? 0.5 : 1.0}
          />
        </mesh>
        {/* Mira visual - só aparece se não estiver morto */}
        <AimingReticle target={aimTarget} />
      </>
    );
  }
);

Player.displayName = 'Player';
