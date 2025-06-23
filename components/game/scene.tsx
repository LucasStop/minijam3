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
  // Refs para os objetos da cena - aqui está a chave da solução!
  const enemyRefs = useRef<{
    [key: string]: React.RefObject<THREE.Mesh | null>;
  }>({});
  const projectileRefs = useRef<{
    [key: string]: React.RefObject<THREE.Mesh | null>;
  }>({});  // Estado dos inimigos, projéteis e do jogo via Zustand com useShallow para evitar re-renders desnecessários
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
    console.log(`🎯 Direção do projétil:`, `(${newProjectile.direction.x.toFixed(2)}, ${newProjectile.direction.y.toFixed(2)}, ${newProjectile.direction.z.toFixed(2)})`);
    
    // Usar o estado global
    addProjectile(newProjectile);
    console.log(`📊 Total de projéteis: ${projectiles.length + 1}`);
  };

  // Função para atualizar a velocidade do jogador
  const handleVelocityChange = (velocity: THREE.Vector3) => {
    setPlayerVelocity(velocity);
  };

  // === SISTEMA DE COLISÃO BASEADO EM EVENTOS ===
  const handleCollision = (object1: THREE.Mesh, object2: THREE.Mesh) => {
    const userData1 = object1.userData;
    const userData2 = object2.userData;

    console.log(`🔥 COLISÃO DETECTADA! ${userData1.type}(${userData1.id}) vs ${userData2.type}(${userData2.id})`);

    // Verificar se é colisão bala-inimigo
    if (
      (userData1.type === 'bullet' && userData2.type === 'enemy') ||
      (userData1.type === 'enemy' && userData2.type === 'bullet')
    ) {
      const bulletData = userData1.type === 'bullet' ? userData1 : userData2;
      const enemyData = userData1.type === 'enemy' ? userData1 : userData2;

      console.log(`🎯 COLISÃO BALA-INIMIGO! Bala ${bulletData.id} → Inimigo ${enemyData.id} (${enemyData.enemyType})`);

      // Remover objetos do estado
      removeProjectile(bulletData.id);
      removeEnemy(enemyData.id);

      // Pontuação baseada no tipo de inimigo
      let points = 10;
      if (enemyData.enemyType === 'heavy') points = 30;
      else if (enemyData.enemyType === 'fast') points = 15;
      else if (enemyData.enemyType === 'basic') points = 10;

      addScore(points);
      console.log(`💰 +${points} pontos! Tipo: ${enemyData.enemyType}`);
      
      // Som de colisão
      soundManager.play('targetLock', 0.4);
    }

    // Verificar se é colisão inimigo-jogador
    if (
      (userData1.type === 'enemy' && userData2.type === 'player') ||
      (userData1.type === 'player' && userData2.type === 'enemy')
    ) {
      if (!isInvincible) {
        const enemyData = userData1.type === 'enemy' ? userData1 : userData2;

        console.log(`💥 DANO! Inimigo ${enemyData.id} (${enemyData.enemyType}) → Jogador`);

        let damage = 25;
        let deathCause = 'Atingido por inimigo';

        if (enemyData.enemyType === 'heavy') {
          damage = 35;
          deathCause = 'Esmagado por inimigo pesado';
        } else if (enemyData.enemyType === 'fast') {
          damage = 20;
          deathCause = 'Interceptado por inimigo rápido';
        } else if (enemyData.enemyType === 'basic') {
          damage = 25;
          deathCause = 'Atingido por inimigo básico';
        }

        takeDamage(damage, deathCause);
        
        // Som de dano
        soundManager.play('damage', 0.6);
        
        // Remover o inimigo que colidiu
        removeEnemy(enemyData.id);
      }
    }
  };

  // LÓGICA CENTRALIZADA DE COLISÃO - SISTEMA BASEADO EM EVENTOS
  useFrame(({ camera, clock }) => {
    if (currentGameState !== 'playing') return;

    const playerMesh = playerRef.current;
    if (!playerMesh) return;

    // Atualizar userData do jogador
    playerMesh.userData = {
      type: 'player',
      radius: 1.0,
    };

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
    if (playerMesh) collidableObjects.push(playerMesh);

    // Adicionar projéteis
    projectiles.forEach(projectile => {
      const mesh = projectileRefs.current[projectile.id]?.current;
      if (mesh) collidableObjects.push(mesh);
    });

    // Adicionar inimigos
    enemies.forEach(enemy => {
      const mesh = enemyRefs.current[enemy.id]?.current;
      if (mesh) collidableObjects.push(mesh);
    });

    // Debug: Log quantidade de objetos colidíveis
    if (debugMode && collidableObjects.length > 1) {
      const types = collidableObjects.map(obj => obj.userData?.type || 'unknown');
      console.log(`🔍 DEBUG: ${collidableObjects.length} objetos colidíveis: [${types.join(', ')}]`);
    }

    // Verificar colisões entre todos os objetos
    for (let i = 0; i < collidableObjects.length; i++) {
      for (let j = i + 1; j < collidableObjects.length; j++) {
        const obj1 = collidableObjects[i];
        const obj2 = collidableObjects[j];

        // Pular se algum objeto não tem userData válido
        if (!obj1.userData?.type || !obj2.userData?.type) continue;

        // Calcular distância
        const distance = obj1.position.distanceTo(obj2.position);
        
        // Obter raios dos objetos
        const radius1 = obj1.userData.radius || 0.5;
        const radius2 = obj2.userData.radius || 0.5;
        const collisionDistance = radius1 + radius2;

        // Log de debug para colisões próximas (apenas para balas e inimigos)
        const type1 = obj1.userData.type;
        const type2 = obj2.userData.type;
        
        if (debugMode && (
          (type1 === 'bullet' && type2 === 'enemy') ||
          (type1 === 'enemy' && type2 === 'bullet')
        ) && distance < collisionDistance * 1.5) {
          console.log(`🔍 DEBUG: Objetos próximos - ${type1}(${obj1.userData.id}) vs ${type2}(${obj2.userData.id}), distância: ${distance.toFixed(2)}, limite: ${collisionDistance.toFixed(2)}`);
        }

        // Verificar se houve colisão
        if (distance < collisionDistance) {
          // Filtrar apenas colisões relevantes
          if (
            (type1 === 'bullet' && type2 === 'enemy') ||
            (type1 === 'enemy' && type2 === 'bullet') ||
            (type1 === 'enemy' && type2 === 'player') ||
            (type1 === 'player' && type2 === 'enemy')
          ) {
            handleCollision(obj1, obj2);
          }
        }
      }
    }
  });

  // Debug: logar inimigos e projéteis ativos
  useEffect(() => {
    console.log(`👹 Inimigos ativos: ${enemies.length}`, enemies.map(e => `${e.type}-${e.id}`));
    console.log(`🚀 Projéteis ativos: ${projectiles.length}`, projectiles.map(p => p.id));
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
