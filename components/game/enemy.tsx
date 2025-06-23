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
    useImperativeHandle(ref, () => meshRef.current as THREE.Mesh, []);    // Configurações baseadas no tipo de inimigo
    const config = useMemo(() => {
      switch (enemy.type) {
        case 'fast':
          return {
            speed: 15, // Muito aumentado para ser realmente rápido
            color: '#ff4444',
            scale: 0.6,
            points: 25,
            geometry: 'octahedron' as const,
            radius: 0.5, // Menor para compensar velocidade
          };
        case 'heavy':
          return {
            speed: 6, // Aumentado para ser mais ameaçador
            color: '#8844ff',
            scale: 1.4,
            points: 50,
            geometry: 'box' as const,
            radius: 1.0, // Maior hitbox
          };
        default: // basic
          return {
            speed: 10, // Aumentado para ser mais agressivo
            color: '#44ff44',
            scale: 1.0,
            points: 15,
            geometry: 'cone' as const,
            radius: 0.7,
          };
      }
    }, [enemy.type]);

    // Definir posição inicial
    if (meshRef.current && !meshRef.current.userData.initialized) {
      meshRef.current.position.copy(enemy.position);
      meshRef.current.userData.initialized = true;
    }    useFrame((state, delta) => {
      if (!meshRef.current) return;

      const currentPosition = meshRef.current.position;

      // Adicionar userData para identificação e hitbox - SEMPRE atualizado
      meshRef.current.userData = {
        type: 'enemy',
        id: enemy.id,
        isEnemy: true,
        enemyId: enemy.id,
        enemyType: enemy.type,
        radius: config.radius,
        onDestroy: handleDestroy,
      };

      // Movimento baseado no tipo de inimigo - PERSEGUINDO O JOGADOR
      if (playerPosition) {
        // Calcular direção para o jogador
        const direction = new THREE.Vector3()
          .subVectors(playerPosition, currentPosition)
          .normalize();

        // Log de debug ocasional
        if (Math.random() < 0.001 && debugMode) {
          console.log(`🎯 Inimigo ${enemy.type} perseguindo jogador. Distância: ${currentPosition.distanceTo(playerPosition).toFixed(1)}`);
        }

        // Movimento direcionado baseado no tipo
        if (enemy.type === 'basic') {
          // Básico: movimento direto
          currentPosition.add(direction.multiplyScalar(config.speed * delta));
          meshRef.current.lookAt(playerPosition);        } else if (enemy.type === 'fast') {
          // Rápido: movimento direto e bem rápido, com leve zigzag para dificultar mira
          const zigzag = Math.sin(Date.now() * 0.015) * 0.1;
          direction.x += zigzag;
          direction.normalize();
          currentPosition.add(direction.multiplyScalar(config.speed * delta));
          meshRef.current.lookAt(playerPosition);
        } else if (enemy.type === 'heavy') {
          // Pesado: movimento lento mas implacável e direto
          currentPosition.add(direction.multiplyScalar(config.speed * delta));
          meshRef.current.lookAt(playerPosition);
        }
      } else {
        // Fallback: movimento para frente se não houver posição do jogador
        currentPosition.z += config.speed * delta;
        
        if (Math.random() < 0.001 && debugMode) {
          console.log(`⚠️ Inimigo ${enemy.type} sem referência do jogador - movendo para frente`);
        }
      }      // Rotação adicional para dar vida ao inimigo (baseada no tipo)
      if (enemy.type === 'fast') {
        // Inimigos rápidos giram freneticamente
        meshRef.current.rotation.x += delta * 6;
        meshRef.current.rotation.z += delta * 4;
      } else if (enemy.type === 'heavy') {
        // Inimigos pesados giram muito devagar mas imposingly
        meshRef.current.rotation.x += delta * 0.3;
        meshRef.current.rotation.z += delta * 0.2;
      } else {
        // Básicos têm rotação normal mas visível
        meshRef.current.rotation.x += delta * 2;
        meshRef.current.rotation.z += delta * 1.5;
      }

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
    };    return (
      <mesh
        ref={meshRef}
        scale={[config.scale, config.scale, config.scale]}
        rotation={[Math.PI, 0, 0]}
      >
        {renderGeometry()}
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={enemy.type === 'fast' ? 0.4 : enemy.type === 'heavy' ? 0.1 : 0.2}
          metalness={enemy.type === 'heavy' ? 0.8 : 0.3}
          roughness={enemy.type === 'heavy' ? 0.2 : 0.4}
        />
        
        {/* Efeito de luz para inimigos rápidos */}
        {enemy.type === 'fast' && (
          <pointLight 
            color="#ff4444" 
            intensity={0.8} 
            distance={4} 
            decay={2}
          />
        )}
        
        {/* Hitbox de debug que segue o inimigo */}
        <mesh visible={debugMode}>
          <sphereGeometry args={[config.radius, 8, 8]} />
          <meshBasicMaterial 
            color={config.color} 
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
