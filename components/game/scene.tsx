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
  const enemyRefs = useRef<{ [key: string]: React.RefObject<THREE.Mesh | null> }>({});
  const projectileRefs = useRef<{ [key: string]: React.RefObject<THREE.Mesh | null> }>({});  // Estado dos inimigos e do jogo via Zustand com useShallow para evitar re-renders desnecessários
  const { 
    enemies, 
    isGameOver, 
    isInvincible, 
    removeEnemy, 
    addScore, 
    takeDamage 
  } = useGameStore(useShallow((state) => ({
    enemies: state.enemies,
    isGameOver: state.isGameOver,
    isInvincible: state.isInvincible,
    removeEnemy: state.removeEnemy,
    addScore: state.addScore,
    takeDamage: state.takeDamage,
  })));

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

    console.log(`🚀 DEBUG: Criando projétil ${newProjectile.id} na posição:`, newProjectile.position);
    setProjectiles(prev => {
      const updated = [...prev, newProjectile];
      console.log(`🎯 DEBUG: Total de projéteis agora: ${updated.length}`);
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

  // LÓGICA CENTRALIZADA DE COLISÃO - O CORAÇÃO DA SOLUÇÃO!
  useFrame(({ camera }) => {
    if (isGameOver) return;

    const playerMesh = playerRef.current;
    if (!playerMesh) return;

    // Atualizar câmera
    const targetPosition = playerMesh.position;
    const cameraOffset = new THREE.Vector3(0, 3, 8);
    cameraOffset.applyQuaternion(playerMesh.quaternion);
    const desiredPosition = new THREE.Vector3().addVectors(targetPosition, cameraOffset);
    camera.position.lerp(desiredPosition, 0.05);
    camera.lookAt(targetPosition);    // --- 1. COLISÃO PROJÉTIL-INIMIGO (usando posições REAIS dos refs) ---
    if (projectiles.length > 0 || enemies.length > 0) {
      console.log(`🔍 DEBUG: ${projectiles.length} projéteis, ${enemies.length} inimigos`);
    }
    
    projectiles.forEach(projectile => {
      const projectileMesh = projectileRefs.current[projectile.id]?.current;
      if (!projectileMesh) {
        console.log(`⚠️ DEBUG: Projétil ${projectile.id} ref não encontrado`);
        return;
      }

      enemies.forEach(enemy => {
        const enemyMesh = enemyRefs.current[enemy.id]?.current;
        if (!enemyMesh) {
          console.log(`⚠️ DEBUG: Inimigo ${enemy.id} ref não encontrado`);
          return;
        }

        // AQUI está a diferença! Usamos as posições REAIS dos objetos 3D
        const distance = projectileMesh.position.distanceTo(enemyMesh.position);
        
        const collisionDistance = 1.5; // Aumentando para debug
        
        if (distance < collisionDistance) {
          // Colisão detectada!
          console.log(`🎯 COLISÃO! Projétil ${projectile.id} atingiu inimigo ${enemy.id} (distância: ${distance.toFixed(2)})`);
          
          removeProjectile(projectile.id);
          removeEnemy(enemy.id);
          
          // Pontuação baseada no tipo de inimigo
          const points = enemy.type === 'heavy' ? 30 : enemy.type === 'fast' ? 15 : 10;
          addScore(points);
        }
      });
    });

    // --- 2. COLISÃO INIMIGO-JOGADOR (usando posições REAIS dos refs) ---
    if (!isInvincible) {
      const playerPosition = playerMesh.position;
      const playerRadius = 0.75;

      enemies.forEach(enemy => {
        const enemyMesh = enemyRefs.current[enemy.id]?.current;
        if (!enemyMesh) return;
        
        const enemyRadius = 0.5;
        // AQUI está a diferença! Usamos as posições REAIS dos objetos 3D
        const distance = playerPosition.distanceTo(enemyMesh.position);

        if (distance < playerRadius + enemyRadius) {
          // Colisão detectada!
          console.log(`💥 COLISÃO! Inimigo ${enemy.id} atingiu o jogador`);
          
          takeDamage(25);
          removeEnemy(enemy.id);
          
          // Lógica de knockback - empurrar a nave para longe
          const knockbackDirection = playerPosition
            .clone()
            .sub(enemyMesh.position)
            .normalize();
          
          const knockbackStrength = 3;
          const knockbackVelocity = knockbackDirection.multiplyScalar(knockbackStrength);
          playerMesh.position.add(knockbackVelocity);
        }
      });
    }
  });  return (
    <>
      {/* Fundo de nebulosa espacial */}
      <Environment
        files="/nebula.jpg"
        background
        backgroundIntensity={0.5}
      />
      
      {/* Campo de estrelas dinâmico */}
      <Stars count={3000} speed={12} spread={120} playerVelocity={playerVelocity} />
      
      <ambientLight intensity={0.6} />
      <pointLight position={[100, 100, 100]} intensity={1.5} />

      {/* Gerenciador de inimigos */}
      <EnemyManager difficulty={1} />

      {/* Player com ref */}
      <Player ref={playerRef} onShoot={handleShoot} onVelocityChange={handleVelocityChange} />      {/* Renderizar todos os projéteis com refs */}
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
