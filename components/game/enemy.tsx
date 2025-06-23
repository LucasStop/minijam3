'use client';

import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, Enemy as EnemyType } from '../../stores/gameStore';

interface EnemyProps {
  enemy: EnemyType;
  playerPosition?: THREE.Vector3;
}

export const Enemy = forwardRef<THREE.Mesh, EnemyProps>(
  ({ enemy, playerPosition }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const removeEnemy = useGameStore(state => state.removeEnemy);
    const addScore = useGameStore(state => state.addScore);

    // Expose the mesh ref to the parent component
    useImperativeHandle(ref, () => meshRef.current);

    // Configurações baseadas no tipo de inimigo
    const config = useMemo(() => {
      switch (enemy.type) {
        case 'fast':
          return {
            speed: 8,
            color: '#ff4444',
            scale: 0.7,
            points: 15,
            geometry: 'octahedron' as const,
          };
        case 'heavy':
          return {
            speed: 3,
            color: '#444444',
            scale: 1.3,
            points: 30,
            geometry: 'box' as const,
          };
        default: // basic
          return {
            speed: 5,
            color: '#ff6600',
            scale: 1.0,
            points: 10,
            geometry: 'cone' as const,
          };
      }
    }, [enemy.type]);

    // Definir posição inicial
    if (meshRef.current && !meshRef.current.userData.initialized) {
      meshRef.current.position.copy(enemy.position);
      meshRef.current.userData.initialized = true;
    }

    useFrame((state, delta) => {
      if (!meshRef.current) return;

      const currentPosition = meshRef.current.position;

      // Movimento baseado no tipo de inimigo
      if (enemy.type === 'basic' || enemy.type === 'heavy') {
        // Movimento reto para frente
        currentPosition.z += config.speed * delta;
      } else if (enemy.type === 'fast' && playerPosition) {
        // Movimento em direção ao jogador (mais inteligente)
        const direction = new THREE.Vector3()
          .subVectors(playerPosition, currentPosition)
          .normalize();

        currentPosition.add(direction.multiplyScalar(config.speed * delta));
      }

      // Rotação para dar vida ao inimigo
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.rotation.x += delta * 0.5;

      // Remoção automática quando sai da tela
      const despawnDistance = 25;
      if (
        currentPosition.z > despawnDistance ||
        Math.abs(currentPosition.x) > despawnDistance ||
        Math.abs(currentPosition.y) > despawnDistance
      ) {
        removeEnemy(enemy.id);
      }
    });

    // Função para when inimigo é atingido (será chamada externamente)
    const handleDestroy = () => {
      addScore(config.points);
      removeEnemy(enemy.id);
    };

    // Tornar a função disponível via ref para detecção de colisão
    if (meshRef.current) {
      meshRef.current.userData.onDestroy = handleDestroy;
      meshRef.current.userData.enemyId = enemy.id;
      meshRef.current.userData.isEnemy = true;
    }

    // Renderizar geometria baseada no tipo
    const renderGeometry = () => {
      switch (config.geometry) {
        case 'octahedron':
          return <octahedronGeometry args={[0.5]} />;
        case 'box':
          return <boxGeometry args={[1, 1, 1]} />;
        default: // cone
          return <coneGeometry args={[0.5, 1, 8]} />;
      }
    };
    return (
      <mesh
        ref={meshRef}
        scale={[config.scale, config.scale, config.scale]}
        rotation={[Math.PI, 0, 0]} // Inimigos apontam para o jogador
      >
        {renderGeometry()}
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={0.2}
        />
      </mesh>
    );
  }
);

Enemy.displayName = 'Enemy';
