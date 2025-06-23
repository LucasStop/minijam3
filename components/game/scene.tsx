'use client';

import React, { useRef, useState, useEffect, createRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useShallow } from 'zustand/react/shallow';
import { Player } from './player';
import { Projectile } from './projectile';
import { Stars } from './stars';
import { Enemy } from './enemy';
import { EnemyManager } from './enemy-manager';
import { DebugHitbox } from './debug-hitbox';
import { useGameStore } from '../../stores/gameStore';
import * as THREE from 'three';

interface ProjectileData {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
}

export function Scene() {
  const playerRef = useRef<THREE.Mesh>(null);
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);
  const [playerVelocity, setPlayerVelocity] = useState(new THREE.Vector3());
  // Refs para os objetos da cena - aqui está a chave da solução!
  const enemyRefs = useRef<{
    [key: string]: React.RefObject<THREE.Mesh | null>;
  }>({});
  const projectileRefs = useRef<{
    [key: string]: React.RefObject<THREE.Mesh | null>;
  }>({});  // Estado dos inimigos e do jogo via Zustand com useShallow para evitar re-renders desnecessários
  const {
    enemies,
    isGameOver,
    isInvincible,
    removeEnemy,
    addScore,
    takeDamage,
    debugMode,
  } = useGameStore(
    useShallow(state => ({
      enemies: state.enemies,
      isGameOver: state.isGameOver,
      isInvincible: state.isInvincible,
      removeEnemy: state.removeEnemy,
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
    const newProjectile: ProjectileData = {
      id: Math.random().toString(36).substr(2, 9),
      position: position.clone(),
      direction: direction.clone().normalize(),
    };

    console.log(
      `🚀 TIRO! Criando projétil ${newProjectile.id} na posição:`,
      `(${newProjectile.position.x.toFixed(1)}, ${newProjectile.position.y.toFixed(1)}, ${newProjectile.position.z.toFixed(1)})`
    );
    console.log(`🎯 Direção do projétil:`, `(${newProjectile.direction.x.toFixed(2)}, ${newProjectile.direction.y.toFixed(2)}, ${newProjectile.direction.z.toFixed(2)})`);
    
    setProjectiles(prev => {
      const updated = [...prev, newProjectile];
      console.log(`📊 Total de projéteis: ${updated.length}`);
      return updated;
    });
  };

  // Função para remover um projétil
  const removeProjectile = (id: string) => {
    setProjectiles(prev => prev.filter(p => p.id !== id));
  };

  // Função para atualizar a velocidade do jogador
  const handleVelocityChange = (velocity: THREE.Vector3) => {
    setPlayerVelocity(velocity);
  };

  // LÓGICA CENTRALIZADA DE COLISÃO - REVISADA E OTIMIZADA!
  useFrame(({ camera, clock }) => {
    if (isGameOver) return;

    const playerMesh = playerRef.current;
    if (!playerMesh) return;

    // Atualizar câmera
    const targetPosition = playerMesh.position;
    const cameraOffset = new THREE.Vector3(0, 3, 8);
    cameraOffset.applyQuaternion(playerMesh.quaternion);
    const desiredPosition = new THREE.Vector3().addVectors(
      targetPosition,
      cameraOffset
    );
    camera.position.lerp(desiredPosition, 0.05);
    camera.lookAt(targetPosition);

    // === 1. COLISÃO PROJÉTIL-INIMIGO (SISTEMA MELHORADO E DEBUGÁVEL) ===
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];
      const projectileMesh = projectileRefs.current[projectile.id]?.current;

      if (!projectileMesh) {
        // Debug: projétil sem mesh
        console.log(`⚠️ Projétil ${projectile.id} sem mesh! Removendo...`);
        removeProjectile(projectile.id);
        continue;
      }

      let projectileHit = false;

      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        const enemyMesh = enemyRefs.current[enemy.id]?.current;

        if (!enemyMesh) {
          // Debug: inimigo sem mesh
          console.log(`⚠️ Inimigo ${enemy.id} sem mesh!`);
          continue;
        }

        // === CÁLCULO DE HITBOX ROBUSTO ===
        const projectilePos = projectileMesh.position;
        const enemyPos = enemyMesh.position;
        const distance = projectilePos.distanceTo(enemyPos);
        
        // Obter raios das hitboxes dos userData ou usar padrões
        const projectileRadius = projectileMesh.userData.radius || 0.3;
        const enemyRadius = enemyMesh.userData.radius || (
          enemy.type === 'heavy' ? 0.8 : 
          enemy.type === 'fast' ? 0.5 : 0.6
        );
        const collisionDistance = projectileRadius + enemyRadius;

        if (distance < collisionDistance) {
          // === COLISÃO CONFIRMADA! ===
          console.log(`🎯 IMPACTO! Projétil ${projectile.id} → ${enemy.type} ${enemy.id}`);
          console.log(`📐 Distância: ${distance.toFixed(2)} < Limite: ${collisionDistance.toFixed(2)}`);

          // Remove objetos imediatamente
          removeProjectile(projectile.id);
          removeEnemy(enemy.id);

          // Pontuação baseada no tipo de inimigo
          const points = enemy.type === 'heavy' ? 30 : enemy.type === 'fast' ? 15 : 10;
          addScore(points);
          console.log(`💰 +${points} pontos!`);

          projectileHit = true;
          break; // Projétil só pode atingir um inimigo
        }
      }

      if (projectileHit) break; // Pula para o próximo projétil
    }

    // === 2. COLISÃO INIMIGO-JOGADOR (SISTEMA APRIMORADO) ===
    if (!isInvincible) {
      const playerPosition = playerMesh.position;
      const playerRadius = 1.0; // Aumentado de 0.75 para 1.0

      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const enemyMesh = enemyRefs.current[enemy.id]?.current;
        
        if (!enemyMesh) continue;

        const enemyPos = enemyMesh.position;
        const distance = playerPosition.distanceTo(enemyPos);
        
        // Raio do inimigo baseado no tipo - MAIS GENEROSO
        const enemyRadius = enemy.type === 'heavy' ? 1.0 : enemy.type === 'fast' ? 0.6 : 0.8; // Aumentados
        const collisionDistance = playerRadius + enemyRadius;

        if (distance < collisionDistance) {
          // === DANO AO JOGADOR! ===
          console.log(`💥 DANO! ${enemy.type} → Jogador (dist: ${distance.toFixed(2)}, limite: ${collisionDistance.toFixed(2)})`);

          // Aplicar dano baseado no tipo de inimigo com causa específica
          const damage = enemy.type === 'heavy' ? 35 : enemy.type === 'fast' ? 20 : 25;
          const deathCauses = {
            heavy: 'Esmagado por inimigo pesado',
            fast: 'Interceptado por inimigo rápido', 
            basic: 'Atingido por inimigo básico'
          };
          const cause = deathCauses[enemy.type || 'basic'];
          
          takeDamage(damage, cause);
          removeEnemy(enemy.id);

          // Knockback mais intenso e realista
          const knockbackDirection = playerPosition
            .clone()
            .sub(enemyPos)
            .normalize();

          // Força do knockback baseada no tipo de inimigo
          const knockbackStrength = enemy.type === 'heavy' ? 8 : enemy.type === 'fast' ? 6 : 7;
          
          // Aplicar knockback imediato na posição para feedback visual instantâneo
          const immediateKnockback = knockbackDirection.clone().multiplyScalar(0.3);
          playerMesh.position.add(immediateKnockback);
          
          console.log(`🚀 Knockback aplicado: força ${knockbackStrength}, direção:`, knockbackDirection);
          break; // Só um inimigo pode atingir por frame
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
      {/* Gerenciador de inimigos */}
      <EnemyManager difficulty={1} />
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

        const projectileMesh = projectileRefs.current[projectile.id]?.current;
        const projectileRadius = projectileMesh?.userData.radius || 0.3;

        return (
          <React.Fragment key={projectile.id}>
            <Projectile
              ref={projectileRefs.current[projectile.id]}
              id={projectile.id}
              position={projectile.position}
              direction={projectile.direction}
              onRemove={removeProjectile}
            />
            {/* Debug Hitbox para projéteis */}
            {debugMode && projectileMesh && (
              <DebugHitbox
                position={projectileMesh.position}
                radius={projectileRadius}
                color="#00ffff"
                visible={debugMode}
              />
            )}
          </React.Fragment>
        );
      })}
      
      {/* Renderizar todos os inimigos com refs */}
      {enemies.map(enemy => {
        // Garantir que o ref existe antes de passar
        if (!enemyRefs.current[enemy.id]) {
          enemyRefs.current[enemy.id] = createRef<THREE.Mesh>();
        }

        const enemyMesh = enemyRefs.current[enemy.id]?.current;
        const enemyRadius = enemyMesh?.userData.radius || (
          enemy.type === 'heavy' ? 0.8 : 
          enemy.type === 'fast' ? 0.5 : 0.6
        );

        return (
          <React.Fragment key={enemy.id}>
            <Enemy
              ref={enemyRefs.current[enemy.id]}
              enemy={enemy}
              playerPosition={playerRef.current?.position}
            />
            {/* Debug Hitbox para inimigos */}
            {debugMode && enemyMesh && (
              <DebugHitbox
                position={enemyMesh.position}
                radius={enemyRadius}
                color="#ff4444"
                visible={debugMode}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
