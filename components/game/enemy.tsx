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
            speed: 12, // Aumentado para ser realmente rápido
            color: '#ff4444',
            scale: 0.7,
            points: 25, // Aumentado para recompensar dificuldade
            geometry: 'octahedron' as const,
            radius: 0.6, // Aumentado para facilitar acertos em inimigos rápidos
          };
        case 'heavy':
          return {
            speed: 4, // Aumentado ligeiramente
            color: '#444444',
            scale: 1.3,
            points: 50, // Muito aumentado - inimigo mais difícil
            geometry: 'box' as const,
            radius: 0.9, // Hitbox ligeiramente maior para inimigo pesado
          };
        default: // basic
          return {
            speed: 7, // Aumentado para ser mais agressivo
            color: '#ff6600',
            scale: 1.0,
            points: 15, // Aumentado de 10 para 15
            geometry: 'cone' as const,
            radius: 0.7, // Raio balanceado
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

      // Adicionar userData para identificação e hitbox - SEMPRE atualizado
      meshRef.current.userData = {
        type: 'enemy',
        id: enemy.id,
        isEnemy: true,
        enemyId: enemy.id,
        enemyType: enemy.type,
        radius: config.radius,
        onDestroy: handleDestroy, // Garantir que está sempre disponível
      };

      // Movimento baseado no tipo de inimigo - TODOS VÃO EM DIREÇÃO AO JOGADOR
      if (playerPosition) {
        // Calcular direção para o jogador
        const direction = new THREE.Vector3()
          .subVectors(playerPosition, currentPosition)
          .normalize();

        // Log de debug ocasional para verificar se está funcionando
        if (Math.random() < 0.001 && debugMode) { // 0.1% de chance por frame
          console.log(`🎯 Inimigo ${enemy.type} perseguindo jogador. Distância: ${currentPosition.distanceTo(playerPosition).toFixed(1)}`);
        }

        // Aplicar movimento baseado no tipo
        if (enemy.type === 'basic') {
          // Básico: movimento direto mas moderado
          currentPosition.add(direction.multiplyScalar(config.speed * delta));
        } else if (enemy.type === 'fast') {
          // Rápido: movimento direto e bem rápido, com leve zigzag
          const zigzag = Math.sin(Date.now() * 0.01) * 0.1;
          direction.x += zigzag;
          direction.normalize();
          currentPosition.add(direction.multiplyScalar(config.speed * delta));
        } else if (enemy.type === 'heavy') {
          // Pesado: movimento mais lento mas implacável
          currentPosition.add(direction.multiplyScalar(config.speed * delta));
        }

        // Fazer o inimigo "olhar" para o jogador (rotação baseada na direção)
        const angle = Math.atan2(direction.x, direction.z);
        meshRef.current.rotation.y = angle;
      } else {
        // Fallback: movimento para frente se não houver posição do jogador
        currentPosition.z += config.speed * delta;
        
        if (Math.random() < 0.001 && debugMode) {
          console.log(`⚠️ Inimigo ${enemy.type} sem referência do jogador - movendo para frente`);
        }
      }

      // Rotação adicional para dar vida ao inimigo (baseada no tipo)
      if (enemy.type === 'fast') {
        // Inimigos rápidos giram mais
        meshRef.current.rotation.x += delta * 3;
        meshRef.current.rotation.z += delta * 2;
      } else if (enemy.type === 'heavy') {
        // Inimigos pesados giram devagar
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.z += delta * 0.3;
      } else {
        // Básicos têm rotação normal
        meshRef.current.rotation.x += delta * 1.5;
        meshRef.current.rotation.z += delta * 1;
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
            color="#ff4444" 
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
