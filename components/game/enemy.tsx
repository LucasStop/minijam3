'use client';

import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, Enemy as EnemyType } from '../../stores/gameStore';
import { useShallow } from 'zustand/react/shallow';

interface EnemyProps {
  enemy: EnemyType;
  playerPosition?: THREE.Vector3;
}

export const Enemy = forwardRef<THREE.Mesh, EnemyProps>(
  ({ enemy, playerPosition }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Otimizado: seletor único com useShallow para evitar re-renders
    const { removeEnemy, addScore, debugMode } = useGameStore(
      useShallow(state => ({
        removeEnemy: state.removeEnemy,
        addScore: state.addScore,
        debugMode: state.debugMode,
      }))
    );

    // Expose the mesh ref to the parent component, mas só quando estiver pronto
    useImperativeHandle(ref, () => meshRef.current as THREE.Mesh, []);

    // Configurações baseadas no tipo de inimigo
    const config = useMemo(() => {
      switch (enemy.type) {
        case 'fast':
          return {
            speed: 8,
            color: '#ff4444',
            scale: 0.7,
            points: 15,
            damage: 20,
            geometry: 'octahedron' as const,
            radius: 0.5, // Hitbox: raio para colisão
          };
        case 'heavy':
          return {
            speed: 3,
            color: '#444444',
            scale: 1.3,
            points: 30,
            damage: 35,
            geometry: 'box' as const,
            radius: 0.8, // Hitbox: raio maior para inimigo pesado
          };
        default: // basic
          return {
            speed: 5,
            color: '#ff6600',
            scale: 1.0,
            points: 10,
            damage: 25,
            geometry: 'cone' as const,
            radius: 0.6, // Hitbox: raio padrão
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

      // === CONFIGURAR USERDATA COMPLETO DO ENEMY ===
      meshRef.current.userData = {
        ...meshRef.current.userData,
        type: 'enemy',
        isEnemy: true,
        id: enemy.id,
        enemyId: enemy.id, // Compatibilidade
        enemyType: enemy.type,
        radius: config.radius,
        damage: config.damage,
        points: config.points,
        isAlive: true,
      };

      // Debug userData
      if (debugMode && Math.random() < 0.01) {
        // Log apenas 1% das vezes
        console.log('👹 Enemy userData:', {
          type: meshRef.current.userData.type,
          id: meshRef.current.userData.id,
          damage: meshRef.current.userData.damage,
        });
      }

      // Movimento baseado no tipo de inimigo
      const currentPosition = meshRef.current.position;
      
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

        {/* Hitbox de debug que segue o inimigo */}
        <mesh visible={debugMode}>
          <sphereGeometry args={[config.radius, 8, 8]} />
          <meshBasicMaterial
            color='#ff4444'
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      </mesh>
    );
  }
);

Enemy.displayName = 'Enemy';
