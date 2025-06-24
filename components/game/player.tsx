'use client';

import React, { forwardRef, useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { MathUtils } from 'three';
import { AimingReticle } from './aiming-reticle';
import { DamageText } from './damage-text';
import { DebugHitbox } from './debug-hitbox';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../lib/soundManager';

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
  onHitboxUpdate?: (hitboxInfo: {
    position: THREE.Vector3;
    circularRadius: number;
    rectangularBounds: { width: number; height: number };
    isAlive: boolean;
    isInvincible: boolean;
  }) => void;
  onPlayerCollision?: (enemyId: number, enemyType: string) => void;
}

export const Player = forwardRef<THREE.Mesh, PlayerProps>(
  ({ onShoot, onVelocityChange, onHitboxUpdate, onPlayerCollision }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const controls = useControls();
    const lastShotTime = useRef(0);
    const shootCooldown = 150; // Reduzido de 200ms para 150ms para tiro mais responsivo

    // Estado para texto de dano
    const [damageTexts, setDamageTexts] = useState<
      Array<{
        id: string;
        damage: number;
        position: THREE.Vector3;
      }>
    >([]);

    // Ref para controlar o último dano recebido
    const lastDamageRef = useRef(0);

    // Carregar textura da nave
    const naveTexture = useLoader(THREE.TextureLoader, '/img/nave.png');    // === ESTADO DO JOGO ===
    // Seletores para estado visual, morte do jogador e ações necessárias
    const currentGameState = useGameStore(state => state.currentGameState);
    const isInvincible = useGameStore(state => state.isInvincible);
    const isTakingDamage = useGameStore(state => state.isTakingDamage);    const playerHealth = useGameStore(state => state.playerHealth);
    const debugMode = useGameStore(state => state.debugMode);
    const recordShot = useGameStore(state => state.recordShot);// === HITBOX E SISTEMA DE COLISÃO ===
    // Configurações de hitbox mais precisas para a nave
    const baseHitboxRadius = 0.8; // Raio base menor para maior precisão (reduzido de 1.2)
    const hitboxScale = 1.5; // Scale aplicado ao mesh (mesmo valor do scale do mesh)
    const effectiveHitboxRadius = baseHitboxRadius * hitboxScale; // Raio efetivo considerando scale

    // Hitbox retangular para maior precisão (baseada na forma da nave)
    // Dimensões ajustadas para corresponder melhor à forma visual da nave
    const hitboxWidth = 1.6 * hitboxScale; // Largura da nave (aproximadamente 80% da geometria)
    const hitboxHeight = 2.0 * hitboxScale; // Altura da nave (aproximadamente 100% da geometria)

    const maxHealth = 100; // Função para verificar se o player está vivo
    const isPlayerAlive = playerHealth > 0;    // === FUNÇÕES DE UTILITÁRIO PARA HITBOX ===
    // Função para verificar colisão circular (mais performática)
    const checkCircularCollision = (
      playerPos: THREE.Vector3,
      enemyPos: THREE.Vector3,
      enemyRadius: number
    ) => {
      const distance = playerPos.distanceTo(enemyPos);
      return distance < effectiveHitboxRadius + enemyRadius;
    };

    // Função para verificar colisão retangular (mais precisa)
    const checkRectangularCollision = (
      playerPos: THREE.Vector3,
      enemyPos: THREE.Vector3,
      enemySize: { width: number; height: number }
    ) => {
      const dx = Math.abs(playerPos.x - enemyPos.x);
      const dy = Math.abs(playerPos.y - enemyPos.y);

      return (
        dx < hitboxWidth / 2 + enemySize.width / 2 &&
        dy < hitboxHeight / 2 + enemySize.height / 2
      );
    };

    // Função para obter informações da hitbox do player
    const getPlayerHitboxInfo = () => {
      if (!meshRef.current) return null;

      return {
        position: meshRef.current.position.clone(),
        circularRadius: effectiveHitboxRadius,
        rectangularBounds: {
          width: hitboxWidth,
          height: hitboxHeight,
        },
        isAlive: isPlayerAlive,
        isInvincible: isInvincible,
      };
    };

    // === FUNÇÕES EXPOSTAS PARA O SISTEMA DE COLISÃO ===
    // Função para verificar se o player pode receber dano
    const canTakeDamage = () => {
      return isPlayerAlive && !isInvincible && currentGameState === 'playing';
    };

    // Função para obter o mesh do player para colisões
    const getPlayerMesh = () => {
      return meshRef.current;
    };    // Função para verificar se uma posição está dentro da hitbox do player
    const isPositionInHitbox = (position: THREE.Vector3) => {
      if (!meshRef.current) return false;
      
      const playerPos = meshRef.current.position;
      const distance = playerPos.distanceTo(position);
      return distance <= effectiveHitboxRadius;
    };

    // === SISTEMA DE FEEDBACK DE COLISÃO ===
    // Função para aplicar efeito visual quando o player é atingido
    const applyHitEffect = (damage: number, hitPosition?: THREE.Vector3) => {
      if (!meshRef.current) return;

      // Efeito visual de flash
      const mesh = meshRef.current;
      if (mesh.material && 'color' in mesh.material) {
        const originalColor = (mesh.material as any).color?.clone?.();
        (mesh.material as any).color.setHex(0xff4444); // Flash vermelho
        setTimeout(() => {
          if (originalColor && mesh.material && 'color' in mesh.material) {
            (mesh.material as any).color.copy(originalColor);
          }
        }, 150);
      }

      // Criar texto de dano se uma posição foi fornecida
      if (hitPosition) {
        const newDamageText = {
          id: Math.random().toString(36).substr(2, 9),
          damage: damage,
          position: hitPosition.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            1
          )),
        };
        setDamageTexts(prev => [...prev, newDamageText]);
      }

      console.log(`💥 Efeito de dano aplicado: -${damage}`);
    };

    // Função para calcular a posição da barra de vida
    const getHealthBarPosition = (playerPosition: THREE.Vector3) => {
      return new THREE.Vector3(
        playerPosition.x,
        playerPosition.y + 2.5, // Acima do player
        playerPosition.z
      );
    };

    // === SISTEMA DE TEXTO DE DANO ===
    useEffect(() => {
      // Detectar quando o player recebe dano
      if (
        isTakingDamage &&
        playerHealth < lastDamageRef.current &&
        meshRef.current
      ) {
        const damageAmount = lastDamageRef.current - playerHealth;
        const playerPosition = meshRef.current.position.clone();

        // Criar novo texto de dano
        const newDamageText = {
          id: Math.random().toString(36).substr(2, 9),
          damage: damageAmount,
          position: new THREE.Vector3(
            playerPosition.x + (Math.random() - 0.5) * 2, // Posição aleatória ao redor do player
            playerPosition.y + (Math.random() - 0.5) * 2,
            playerPosition.z + 1
          ),
        };

        setDamageTexts(prev => [...prev, newDamageText]);

        console.log(
          `💥 Texto de dano criado: -${damageAmount} na posição (${newDamageText.position.x.toFixed(1)}, ${newDamageText.position.y.toFixed(1)})`
        );
      }

      // Atualizar referência da vida anterior
      lastDamageRef.current = playerHealth;
    }, [isTakingDamage, playerHealth]);

    // Função para remover texto de dano
    const removeDamageText = (id: string) => {
      setDamageTexts(prev => prev.filter(text => text.id !== id));
    };

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
      if (currentGameState !== 'playing') {
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
      }      // 9. COMUNICAR INFORMAÇÕES DA HITBOX PARA COMPONENTES EXTERNOS
      if (onHitboxUpdate) {
        const hitboxInfo = getPlayerHitboxInfo();
        if (hitboxInfo) {
          onHitboxUpdate(hitboxInfo);
        }
      }

      // 10. DETECTAR COLISÕES PRÓXIMAS (SISTEMA DE ALERTA)
      // Esta seção pode ser usada para detectar inimigos muito próximos
      // e ativar sistemas de alerta ou auto-defesa (opcional)
      if (debugMode && onPlayerCollision) {
        // Placeholder para detecção proativa de ameaças
        // Pode ser implementado se necessário para recursos avançados
      }      // 11. SISTEMA DE MIRA OTIMIZADO COM MOUSE
      // Atualizar a posição do alvo baseado na posição do mouse com maior precisão
      raycaster.setFromCamera(pointer, camera);

      // Usar múltiplos planos para melhor precisão dependendo da profundidade
      const currentPlayerPosition = meshRef.current.position;
      const aimingPlaneDistance = -15; // Plano mais distante para melhor precisão
      const aimingPlaneUpdated = new THREE.Plane(
        new THREE.Vector3(0, 0, 1),
        aimingPlaneDistance
      );

      // Intersecção com o plano
      const intersectionPoint = new THREE.Vector3();
      const hasIntersection = raycaster.ray.intersectPlane(
        aimingPlaneUpdated,
        intersectionPoint
      );

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
          const direction = aimTarget
            .clone()
            .sub(currentPlayerPosition)
            .normalize();
          aimTarget
            .copy(currentPlayerPosition)
            .add(direction.multiplyScalar(maxAimDistance));
        }
      } else {
        // Fallback: mira na frente da nave se não houver intersecção
        aimTarget.copy(currentPlayerPosition).add(new THREE.Vector3(0, 0, -10));
      }

      // 12. DETECÇÃO DE COLISÃO REMOVIDA - AGORA CENTRALIZADA EM SCENE.TSX
      // A lógica de colisão jogador-inimigo foi movida para Scene.tsx para evitar duplicação
    });

    // === FUNÇÃO DE TIRO COM DETECÇÃO DE ALVO ===
    const handleShoot = (targetPosition?: THREE.Vector3) => {
      if (!meshRef.current || currentGameState !== 'playing') return;

      const currentTime = Date.now();
      if (currentTime - lastShotTime.current < shootCooldown) return;

      const playerPosition = meshRef.current.position.clone();

      let shootDirection: THREE.Vector3;

      if (targetPosition) {
        // Tiro direcionado para alvo específico
        shootDirection = targetPosition.clone().sub(playerPosition).normalize();
        console.log(`🎯 Tiro direcionado para inimigo`);
      } else {
        // Tiro na direção da mira (fallback)
        shootDirection = aimTarget.clone().sub(playerPosition).normalize();

        if (shootDirection.length() === 0) {
          shootDirection.set(0, 0, -1);
        }
      }

      // Posição de spawn na frente da nave
      const spawnDistance = 1.2;
      const spawnOffset = shootDirection.clone().multiplyScalar(spawnDistance);
      const shootPosition = playerPosition.add(spawnOffset);

      // Física melhorada: combinar velocidade da nave com direção do tiro
      const playerVelocityContribution = velocity.current
        .clone()
        .multiplyScalar(0.1);
      const finalDirection = shootDirection
        .clone()
        .add(playerVelocityContribution)
        .normalize();      onShoot(shootPosition, finalDirection);
      lastShotTime.current = currentTime;
      
      // Registrar estatísticas do tiro
      recordShot();
      
      console.log(`📊 Tiro registrado! Estatísticas atualizadas.`);
    };

    // === EVENTO DE MOUSE COM DETECÇÃO DE INIMIGOS APRIMORADA ===
    useEffect(() => {
      const handleMouseDown = (event: MouseEvent) => {
        // Verifica se é clique esquerdo e não está em game over
        if (event.button === 0 && currentGameState === 'playing') {
          event.preventDefault();

          // Atualizar posição do mouse usando o pointer existente
          const rect = (event.target as HTMLElement).getBoundingClientRect();
          const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

          // Criar um novo Vector2 para o raycaster
          const mouseVector = new THREE.Vector2(mouseX, mouseY);
          raycaster.setFromCamera(mouseVector, camera);

          // Buscar todos os objetos na cena através do objeto parent
          const scene = camera.parent;
          if (scene) {
            // Raycasting com maior profundidade
            const intersects = raycaster.intersectObjects(scene.children, true);

            // Filtrar apenas inimigos principais (não hitboxes de debug)
            const enemyHit = intersects.find(intersect => {
              const obj = intersect.object;
              // Verificar se é o mesh principal do inimigo
              return (
                obj.userData?.isEnemy === true &&
                obj.type === 'Mesh' &&
                (obj as THREE.Mesh).geometry?.type !== 'SphereGeometry'
              ); // Excluir hitboxes de debug
            });

            if (enemyHit) {
              // Obter posição correta do inimigo
              let enemyPosition = enemyHit.object.position.clone();

              // Se o objeto é filho de um grupo, somar a posição do pai
              if (
                enemyHit.object.parent &&
                enemyHit.object.parent.type === 'Mesh'
              ) {
                enemyPosition.add(enemyHit.object.parent.position);
              }

              console.log(
                `🎯 INIMIGO CLICADO! Tipo: ${enemyHit.object.userData.enemyType}, Posição: (${enemyPosition.x.toFixed(2)}, ${enemyPosition.y.toFixed(2)}, ${enemyPosition.z.toFixed(2)})`
              );
              soundManager.play('targetLock', 0.4);

              // Tiro direcionado com feedback visual
              handleShoot(enemyPosition);

              // Adicionar efeito visual temporário no inimigo (flash)
              const mesh = enemyHit.object as THREE.Mesh;
              if (mesh.material && 'color' in mesh.material) {
                const originalColor = (mesh.material as any).color?.clone?.();
                (mesh.material as any).color.setHex(0xffffff); // Flash branco
                setTimeout(() => {
                  if (
                    originalColor &&
                    mesh.material &&
                    'color' in mesh.material
                  ) {
                    (mesh.material as any).color.copy(originalColor);
                  }
                }, 100);
              }
            } else {
              // Tiro normal na direção da mira
              console.log(`🎯 Tiro normal na direção da mira`);
              soundManager.play('shot', 0.3);
              handleShoot();
            }
          } else {
            // Fallback: tiro normal
            console.log(`🎯 Fallback: tiro normal`);
            soundManager.play('shot', 0.3);
            handleShoot();
          }
        }
      };

      const handleMouseUp = (event: MouseEvent) => {
        // Verifica se é clique esquerdo e não está em game over
        if (event.button === 0 && currentGameState === 'playing') {
          event.preventDefault();
          // Aqui você pode adicionar lógica para liberar o tiro ou outra ação
        }
      };
      // Adicionar eventos de mouse
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        // Remover eventos de mouse
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [currentGameState, camera, raycaster, aimTarget, onShoot]);
    // Adicionar lógica para liberar o tiro ou outra ação
    // === RENDERIZAÇÃO DO PLAYER E COMPONENTES ===
    return (
      <>
        {' '}
        {/* Player Mesh */}
        <mesh
          ref={meshRef}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={[1.5, 1.5, 1.5]}          userData={{
            type: 'player',
            isPlayer: true,
            id: 'player-1', // ID único do player
            radius: effectiveHitboxRadius,
            baseRadius: baseHitboxRadius,
            hitboxWidth: hitboxWidth,
            hitboxHeight: hitboxHeight,
            health: playerHealth,
            maxHealth: maxHealth,
            isAlive: isPlayerAlive,
            isInvincible: isInvincible,
            // Funções auxiliares para o sistema de colisão
            canTakeDamage: canTakeDamage(),
            scale: hitboxScale,
          }}
        >
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial
            map={naveTexture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
            opacity={isTakingDamage ? 0.8 : isInvincible ? 0.5 : 1.0}
            color={
              isTakingDamage ? '#ffffff' : isInvincible ? '#ff4444' : '#ffffff'
            }
          />
        </mesh>{' '}
        {/* Aiming Reticle */}
        <AimingReticle target={aimTarget} />
        {/* Debug Hitbox - Visualização circular */}
        {debugMode && meshRef.current && (
          <DebugHitbox
            position={meshRef.current.position}
            radius={effectiveHitboxRadius}
            color='#ff0000'
            visible={true}
          />
        )}
        {/* Debug Hitbox - Visualização retangular */}
        {debugMode && meshRef.current && (
          <mesh position={meshRef.current.position}>
            <boxGeometry args={[hitboxWidth, hitboxHeight, 0.1]} />
            <meshBasicMaterial
              color='#00ff00'
              wireframe
              transparent
              opacity={0.3}
            />
          </mesh>
        )}
        {/* Damage Texts */}
        {damageTexts.map(text => (
          <DamageText
            key={text.id}
            damage={text.damage}
            position={text.position}
            onComplete={() => removeDamageText(text.id)}
          />
        ))}{' '}
        {/* Health Bar */}
        {isPlayerAlive && meshRef.current && (
          <group position={getHealthBarPosition(meshRef.current.position)}>
            {/* Fundo da barra de vida */}
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[3, 0.3]} />
              <meshBasicMaterial color='#333333' transparent opacity={0.8} />
            </mesh>

            {/* Barra de vida atual */}
            <mesh position={[(playerHealth / maxHealth - 1) * 1.5, 0, 0.02]}>
              <planeGeometry args={[3 * (playerHealth / maxHealth), 0.25]} />
              <meshBasicMaterial
                color={
                  playerHealth > 30
                    ? '#4CAF50'
                    : playerHealth > 15
                      ? '#FFC107'
                      : '#F44336'
                }
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Borda da barra de vida */}
            <mesh position={[0, 0, 0.03]}>
              <planeGeometry args={[3.1, 0.35]} />
              <meshBasicMaterial
                color='#ffffff'
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}
      </>
    );
  }
);
