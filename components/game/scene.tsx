'use client';

import React, { useRef, useState, useEffect, createRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useShallow } from 'zustand/react/shallow';
import { Player } from './player';
import { Projectile } from './projectile';
import { Stars } from './stars';
import { Enemy } from './enemy';
import { EnemySpawner } from './enemy-spawner';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../lib/soundManager';
import * as THREE from 'three';

export function Scene() {
  const playerRef = useRef<THREE.Mesh>(null);
  const [playerVelocity, setPlayerVelocity] = useState(new THREE.Vector3());

  // Estado para debug de colisões em tempo real
  const [collisionDebugInfo, setCollisionDebugInfo] = useState<{
    playerEnemyCollisions: number;
    projectileEnemyCollisions: number;
    lastCollisionTime: number;
  }>({
    playerEnemyCollisions: 0,
    projectileEnemyCollisions: 0,
    lastCollisionTime: 0,
  });
  // Refs para os objetos da cena - aqui está a chave da solução!
  const enemyRefs = useRef<{
    [key: string]: React.RefObject<THREE.Mesh | null>;
  }>({});
  const projectileRefs = useRef<{
    [key: string]: React.RefObject<THREE.Mesh | null>;
  }>({}); // Estado dos inimigos, projéteis e do jogo via Zustand com useShallow para evitar re-renders desnecessários
  const {
    enemies,
    projectiles,
    currentGameState,
    isInvincible,
    removeEnemy,
    addProjectile,
    removeProjectile,
    addScore,
    takeDamage,
    debugMode,
    recordShot,
    recordHit,
    recordCollision,
  } = useGameStore(
    useShallow(state => ({
      enemies: state.enemies,
      projectiles: state.projectiles,
      currentGameState: state.currentGameState,
      isInvincible: state.isInvincible,
      removeEnemy: state.removeEnemy,
      addProjectile: state.addProjectile,
      removeProjectile: state.removeProjectile,
      addScore: state.addScore,
      takeDamage: state.takeDamage,
      debugMode: state.debugMode,
      recordShot: state.recordShot,
      recordHit: state.recordHit,
      recordCollision: state.recordCollision,
    }))
  );

  // Garante que os refs sejam criados para cada novo objeto
  useEffect(() => {
    // Criar refs para novos inimigos
    enemies.forEach(enemy => {
      if (!enemyRefs.current[enemy.id]) {
        enemyRefs.current[enemy.id] = createRef<THREE.Mesh>();
      }
    });

    // Criar refs para novos projéteis
    projectiles.forEach(projectile => {
      if (!projectileRefs.current[projectile.id]) {
        projectileRefs.current[projectile.id] = createRef<THREE.Mesh>();
      }
    });

    // Limpar refs de objetos removidos
    Object.keys(enemyRefs.current).forEach(id => {
      if (!enemies.some(e => e.id.toString() === id)) {
        delete enemyRefs.current[id];
      }
    });

    Object.keys(projectileRefs.current).forEach(id => {
      if (!projectiles.some(p => p.id === id)) {
        delete projectileRefs.current[id];
      }
    });
  }, [enemies, projectiles]);
  // Função para adicionar um novo projétil
  const handleShoot = (position: THREE.Vector3, direction: THREE.Vector3) => {
    const newProjectile = {
      id: Math.random().toString(36).substr(2, 9),
      position: position.clone(),
      direction: direction.clone().normalize(),
    };

    console.log(
      `🚀 TIRO! Criando projétil ${newProjectile.id} na posição:`,
      `(${newProjectile.position.x.toFixed(1)}, ${newProjectile.position.y.toFixed(1)}, ${newProjectile.position.z.toFixed(1)})`
    );
    console.log(
      `🎯 Direção do projétil:`,
      `(${newProjectile.direction.x.toFixed(2)}, ${newProjectile.direction.y.toFixed(2)}, ${newProjectile.direction.z.toFixed(2)})`
    );

    // Registrar tiro nas estatísticas
    recordShot();

    // Usar o estado global
    addProjectile(newProjectile);
    console.log(`📊 Total de projéteis: ${projectiles.length + 1}`);
  };

  // Função para atualizar a velocidade do jogador
  const handleVelocityChange = (velocity: THREE.Vector3) => {
    setPlayerVelocity(velocity);
  };
  // === SISTEMA DE COLISÃO BASEADO EM EVENTOS ===
  // === SISTEMA DE COLISÃO MELHORADO ===

  // Função de detecção de colisão circular otimizada
  const checkCircularCollision = (obj1: THREE.Mesh, obj2: THREE.Mesh) => {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const dz = obj1.position.z - obj2.position.z;

    // Usar distanceToSquared para melhor performance (evita sqrt)
    const distanceSquared = dx * dx + dy * dy + dz * dz;

    const radius1 = obj1.userData.radius || 0.5;
    const radius2 = obj2.userData.radius || 0.5;
    const minDistanceSquared = (radius1 + radius2) * (radius1 + radius2);

    return {
      hasCollision: distanceSquared < minDistanceSquared,
      distance: Math.sqrt(distanceSquared),
      distanceSquared,
      radius1,
      radius2,
    };
  };

  // Função de detecção de colisão retangular (mais precisa para player)
  const checkRectangularCollision = (
    playerMesh: THREE.Mesh,
    enemyMesh: THREE.Mesh
  ) => {
    const playerData = playerMesh.userData;
    const enemyData = enemyMesh.userData;

    // Usar hitbox retangular do player se disponível
    if (playerData.rectangularBounds) {
      const dx = Math.abs(playerMesh.position.x - enemyMesh.position.x);
      const dy = Math.abs(playerMesh.position.y - enemyMesh.position.y);
      const dz = Math.abs(playerMesh.position.z - enemyMesh.position.z);

      const playerHalfWidth = playerData.rectangularBounds.width / 2;
      const playerHalfHeight = playerData.rectangularBounds.height / 2;
      const enemyRadius = enemyData.radius || 0.8;

      const hasCollision =
        dx < playerHalfWidth + enemyRadius &&
        dy < playerHalfHeight + enemyRadius &&
        dz < 1.0; // Tolerância no eixo Z

      if (debugMode && hasCollision) {
        console.log('🎯 COLISÃO RETANGULAR DETECTADA:', {
          dx: dx.toFixed(2),
          dy: dy.toFixed(2),
          dz: dz.toFixed(2),
          playerHalfWidth: playerHalfWidth.toFixed(2),
          playerHalfHeight: playerHalfHeight.toFixed(2),
          enemyRadius: enemyRadius.toFixed(2),
        });
      }

      return {
        hasCollision,
        distance: Math.sqrt(dx * dx + dy * dy + dz * dz),
        type: 'rectangular',
      };
    }

    // Fallback para colisão circular
    return checkCircularCollision(playerMesh, enemyMesh);
  };

  // ...existing code...

  const handleCollision = (object1: THREE.Mesh, object2: THREE.Mesh) => {
    const userData1 = object1.userData;
    const userData2 = object2.userData;

    // Verificar se são objetos válidos para colisão
    if (!userData1 || !userData2) return;

    console.log('Colisão detectada:', userData1.type, 'vs', userData2.type); // Debug

    // Player vs Enemy - CORRIGIR LÓGICA DE INVENCIBILIDADE
    if (
      (userData1.type === 'player' && userData2.type === 'enemy') ||
      (userData1.type === 'enemy' && userData2.type === 'player')
    ) {
      const playerData = userData1.type === 'player' ? userData1 : userData2;
      const enemyData = userData1.type === 'enemy' ? userData1 : userData2;

      // VERIFICAR SE PLAYER PODE RECEBER DANO
      if (!playerData.isInvincible && !isInvincible) {
        console.log('🩸 APLICANDO DANO AO PLAYER:', enemyData.damage || 25);
        takeDamage(enemyData.damage || 25);
        recordCollision();

        // Atualizar stats de debug
        setCollisionDebugInfo(prev => ({
          ...prev,
          playerEnemyCollisions: prev.playerEnemyCollisions + 1,
          lastCollisionTime: Date.now(),
        }));
      } else {
        console.log('🛡️ Player invencível - dano ignorado');
      }
    }

    // Projectile vs Enemy
    if (
      (userData1.type === 'projectile' && userData2.type === 'enemy') ||
      (userData1.type === 'enemy' && userData2.type === 'projectile')
    ) {
      const projectileData =
        userData1.type === 'projectile' ? userData1 : userData2;
      const enemyData = userData1.type === 'enemy' ? userData1 : userData2;

      console.log('💥 Projétil atingiu inimigo:', enemyData.id);

      // Remover projétil
      removeProjectile(projectileData.id);

      // Destruir inimigo e dar pontos
      removeEnemy(enemyData.id || enemyData.enemyId);
      addScore(enemyData.points || 10);

      recordHit();
      recordCollision();

      // Som de explosão
      soundManager.play('explosion', 0.4);

      // Atualizar stats de debug
      setCollisionDebugInfo(prev => ({
        ...prev,
        projectileEnemyCollisions: prev.projectileEnemyCollisions + 1,
      }));
    }
  };

  // LÓGICA CENTRALIZADA DE COLISÃO - SISTEMA BASEADO EM EVENTOS
  useFrame(({ camera, clock }) => {
    if (currentGameState !== 'playing') return;

    const playerMesh = playerRef.current;
    if (!playerMesh) return; // Atualizar userData do jogador com hitboxes sincronizadas
    if (playerMesh.userData.radius && playerMesh.userData.hitboxWidth) {
      // O player já tem userData atualizado do componente Player
      // Não sobrescrever, apenas verificar se está atualizado
      if (debugMode && playerMesh.userData.type !== 'player') {
        console.log(`⚠️ DEBUG: Player userData não está sincronizado!`);
      }
    } else {
      // Fallback para userData básico se não estiver definido
      playerMesh.userData = {
        ...playerMesh.userData,
        type: 'player',
        radius: 1.0, // Raio padrão se não tiver hitbox precisa
      };
    }

    // === CÂMERA INTELIGENTE ===
    const offset = playerVelocity.clone().multiplyScalar(2);
    const targetPosition = new THREE.Vector3()
      .copy(playerMesh.position)
      .add(offset);

    const cameraOffset = new THREE.Vector3(0, 0, 5);
    cameraOffset.applyQuaternion(playerMesh.quaternion);
    const desiredPosition = new THREE.Vector3().addVectors(
      targetPosition,
      cameraOffset
    );
    camera.position.lerp(desiredPosition, 0.05);
    camera.lookAt(targetPosition);

    // === VERIFICAÇÃO DE COLISÕES AUTOMÁTICA ===
    // Lista de todos os objetos com colisão
    const collidableObjects: THREE.Mesh[] = [];

    // Adicionar jogador
    if (playerMesh) collidableObjects.push(playerMesh); // Adicionar projéteis
    projectiles.forEach(projectile => {
      const mesh = projectileRefs.current[projectile.id]?.current;
      if (mesh) {
        collidableObjects.push(mesh);
      } else if (debugMode) {
        console.log(
          `⚠️ DEBUG: Ref do projétil ${projectile.id} não encontrado`
        );
      }
    });

    // Adicionar inimigos
    enemies.forEach(enemy => {
      const mesh = enemyRefs.current[enemy.id]?.current;
      if (mesh) {
        collidableObjects.push(mesh);
      } else if (debugMode) {
        console.log(`⚠️ DEBUG: Ref do inimigo ${enemy.id} não encontrado`);
      }
    }); // Debug: Log quantidade de objetos colidíveis
    if (debugMode && collidableObjects.length > 1) {
      const types = collidableObjects.map(
        obj => obj.userData?.type || 'unknown'
      );
      console.log(
        `🔍 DEBUG: ${collidableObjects.length} objetos colidíveis: [${types.join(', ')}]`
      );
      console.log(
        `📊 Inimigos: ${enemies.length}, Projéteis: ${projectiles.length}`
      );
    }

    // Verificar colisões entre todos os objetos (SISTEMA OTIMIZADO)
    for (let i = 0; i < collidableObjects.length; i++) {
      for (let j = i + 1; j < collidableObjects.length; j++) {
        const obj1 = collidableObjects[i];
        const obj2 = collidableObjects[j]; // Pular se algum objeto não tem userData válido
        if (!obj1.userData?.type || !obj2.userData?.type) {
          if (debugMode) {
            console.log(
              `⚠️ DEBUG: Objeto sem userData válido: obj1.type=${obj1.userData?.type}, obj2.type=${obj2.userData?.type}`
            );
          }
          continue;
        }

        // Filtrar apenas colisões relevantes antes de calcular distância
        const type1 = obj1.userData.type;
        const type2 = obj2.userData.type;
        const isRelevantCollision =
          (type1 === 'projectile' && type2 === 'enemy') ||
          (type1 === 'enemy' && type2 === 'projectile') ||
          (type1 === 'enemy' && type2 === 'player') ||
          (type1 === 'player' && type2 === 'enemy');

        if (!isRelevantCollision) continue; // Usar sistema de colisão otimizado e preciso
        let collisionResult;

        // Para colisões player-enemy, usar detecção retangular mais precisa
        if (
          (type1 === 'player' && type2 === 'enemy') ||
          (type1 === 'enemy' && type2 === 'player')
        ) {
          const playerMesh = type1 === 'player' ? obj1 : obj2;
          const enemyMesh = type1 === 'enemy' ? obj1 : obj2;
          collisionResult = checkRectangularCollision(playerMesh, enemyMesh);
        } else {
          // Para outras colisões (projectile-enemy), usar detecção circular
          collisionResult = checkCircularCollision(obj1, obj2);
        }

        // Log de debug para colisões próximas
        if (
          debugMode &&
          collisionResult.distance <
            (obj1.userData.radius + obj2.userData.radius) * 1.5
        ) {
          console.log(
            `🔍 DEBUG: Objetos próximos - ${type1}(${obj1.userData.id || obj1.userData.enemyId}) vs ${type2}(${obj2.userData.id || obj2.userData.enemyId}), distância: ${collisionResult.distance.toFixed(2)}, limite: ${(obj1.userData.radius + obj2.userData.radius).toFixed(2)}`
          );
        }

        // Verificar se houve colisão
        if (collisionResult.hasCollision) {
          handleCollision(obj1, obj2);
        }
      }
    }

    // === LIMPEZA AUTOMÁTICA DE OBJETOS FORA DOS LIMITES ===
    const bounds = {
      x: 25,
      y: 20,
      z: 30,
    };

    // Remover projéteis fora dos limites
    projectiles.forEach(projectile => {
      const mesh = projectileRefs.current[projectile.id]?.current;
      if (mesh) {
        const pos = mesh.position;
        if (
          Math.abs(pos.x) > bounds.x ||
          Math.abs(pos.y) > bounds.y ||
          pos.z > bounds.z ||
          pos.z < -bounds.z
        ) {
          removeProjectile(projectile.id);
          if (debugMode)
            console.log(
              `🗑️ Projétil ${projectile.id} removido (fora dos limites)`
            );
        }
      }
    });

    // Remover inimigos que escaparam ou estão muito longe
    enemies.forEach(enemy => {
      const mesh = enemyRefs.current[enemy.id]?.current;
      if (mesh && playerMesh) {
        const enemyPos = mesh.position;
        const playerPos = playerMesh.position;

        // Calcular distância do jogador
        const distance = enemyPos.distanceTo(playerPos);

        // Se o inimigo passou muito longe atrás do jogador, aplicar penalidade
        if (enemyPos.z > playerPos.z + 15) {
          removeEnemy(enemy.id);
          takeDamage(5, `Inimigo ${enemy.type} escapou`);
          if (debugMode)
            console.log(
              `🏃 Inimigo ${enemy.id} (${enemy.type}) escapou! -5 HP`
            );
        }

        // Remover inimigos muito distantes lateralmente
        else if (
          Math.abs(enemyPos.x) > bounds.x ||
          Math.abs(enemyPos.y) > bounds.y
        ) {
          removeEnemy(enemy.id);
          if (debugMode)
            console.log(
              `🗑️ Inimigo ${enemy.id} removido (fora dos limites laterais)`
            );
        }
      }
    });
  });

  // Debug: logar inimigos e projéteis ativos
  useEffect(() => {
    console.log(
      `👹 Inimigos ativos: ${enemies.length}`,
      enemies.map(e => `${e.type}-${e.id}`)
    );
    console.log(
      `🚀 Projéteis ativos: ${projectiles.length}`,
      projectiles.map(p => p.id)
    );
  }, [enemies.length, projectiles.length]);

  return (
    <>
      {/* Fundo de nebulosa espacial */}
      <Environment files='/nebula.jpg' background backgroundIntensity={0.5} />
      {/* Campo de estrelas dinâmico */}
      <Stars
        count={3000}
        speed={12}
        spread={120}
        playerVelocity={playerVelocity}
      />
      <ambientLight intensity={0.6} />
      <pointLight position={[100, 100, 100]} intensity={1.5} />
      {/* Gerador de inimigos dinâmico */}
      <EnemySpawner difficulty={1} enabled={true} />
      {/* Player com ref */}
      <Player
        ref={playerRef}
        onShoot={handleShoot}
        onVelocityChange={handleVelocityChange}
      />{' '}
      {/* Renderizar todos os projéteis com refs */}
      {projectiles.map(projectile => {
        // Garantir que o ref existe antes de passar
        if (!projectileRefs.current[projectile.id]) {
          projectileRefs.current[projectile.id] = createRef<THREE.Mesh>();
        }

        return (
          <Projectile
            key={projectile.id}
            ref={projectileRefs.current[projectile.id]}
            id={projectile.id}
            position={projectile.position}
            direction={projectile.direction}
            onRemove={removeProjectile}
          />
        );
      })}
      {/* Renderizar todos os inimigos com refs */}
      {enemies.map(enemy => {
        // Garantir que o ref existe antes de passar
        if (!enemyRefs.current[enemy.id]) {
          enemyRefs.current[enemy.id] = createRef<THREE.Mesh>();
        }

        return (
          <Enemy
            key={enemy.id}
            ref={enemyRefs.current[enemy.id]}
            enemy={enemy}
            playerPosition={playerRef.current?.position}
          />
        );
      })}
    </>
  );
}
