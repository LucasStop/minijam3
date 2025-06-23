'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
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
  
  // Estado dos inimigos via Zustand
  const enemies = useGameStore((state) => state.enemies);
  const removeEnemy = useGameStore((state) => state.removeEnemy);
  const addScore = useGameStore((state) => state.addScore);

  // Função para adicionar um novo projétil
  const handleShoot = (position: THREE.Vector3, direction: THREE.Vector3) => {
    const newProjectile: ProjectileData = {
      id: Math.random().toString(36).substr(2, 9),
      position: position.clone(),
      direction: direction.clone().normalize(),
    };

    setProjectiles(prev => [...prev, newProjectile]);
  };  // Função para remover um projétil
  const removeProjectile = (id: string) => {
    setProjectiles(prev => prev.filter(p => p.id !== id));
  };

  // Função para atualizar a velocidade do jogador
  const handleVelocityChange = (velocity: THREE.Vector3) => {
    setPlayerVelocity(velocity);
  };
  // A lógica da câmera e detecção de colisão
  useFrame(({ camera, scene }) => {
    if (playerRef.current) {
      const targetPosition = playerRef.current.position;

      // Define a posição desejada da câmera: atrás e acima da nave
      const cameraOffset = new THREE.Vector3(0, 3, 8);
      // Aplica a rotação da nave ao offset da câmera para que ela "gire" junto
      cameraOffset.applyQuaternion(playerRef.current.quaternion);
      const desiredPosition = new THREE.Vector3().addVectors(
        targetPosition,
        cameraOffset
      );

      // Suaviza o movimento da câmera usando interpolação (lerp)
      camera.position.lerp(desiredPosition, 0.05);

      // A câmera sempre olha para a nave
      camera.lookAt(targetPosition);
    }

    // Detecção de colisão entre projéteis e inimigos
    projectiles.forEach((projectile) => {
      enemies.forEach((enemy) => {
        const projectilePos = new THREE.Vector3(
          projectile.position.x,
          projectile.position.y,
          projectile.position.z
        );
        const enemyPos = enemy.position;
        
        // Distância simples para detecção de colisão
        const distance = projectilePos.distanceTo(enemyPos);
        const collisionDistance = 1.0; // Ajuste conforme necessário
        
        if (distance < collisionDistance) {
          // Colisão detectada!
          removeProjectile(projectile.id);
          removeEnemy(enemy.id);
          
          // Pontuação baseada no tipo de inimigo
          const points = enemy.type === 'heavy' ? 30 : enemy.type === 'fast' ? 15 : 10;
          addScore(points);
        }
      });
    });
  });
  return (
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

      <Player ref={playerRef} onShoot={handleShoot} onVelocityChange={handleVelocityChange} />

      {/* Renderizar todos os projéteis */}
      {projectiles.map(projectile => (
        <Projectile
          key={projectile.id}
          id={projectile.id}
          position={projectile.position}
          direction={projectile.direction}
          onRemove={removeProjectile}
        />
      ))}

      {/* Renderizar todos os inimigos */}
      {enemies.map(enemy => (
        <Enemy
          key={enemy.id}
          enemy={enemy}
          playerPosition={playerRef.current?.position}
        />
      ))}
    </>
  );
}
