'use client';

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

interface ProjectileProps {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  onRemove: (id: string) => void;
}

export const Projectile = forwardRef<THREE.Mesh, ProjectileProps>(
  ({ id, position, direction, onRemove }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const debugMode = useGameStore(state => state.debugMode);
    
    // Expose the mesh ref to the parent component, mas só quando estiver pronto
    useImperativeHandle(ref, () => meshRef.current as THREE.Mesh, []);
    
    const speed = 25; // Velocidade otimizada para responsividade
    const maxDistance = 200; // Aumentada distância máxima
    const startPosition = position.clone();
    
    // Velocidade como vetor 3D para física mais realista
    const velocity = useRef(direction.clone().multiplyScalar(speed));
    
    // HITBOX CONFIG - Raio de colisão do projétil (otimizado para melhor gameplay)
    const projectileRadius = 0.4; // Aumentado ligeiramente para facilitar acertos
      useFrame((state, delta) => {
      if (meshRef.current) {
        // SEMPRE atualizar userData primeiro
        meshRef.current.userData = {
          type: 'projectile',
          id: id,
          isProjectile: true,
          radius: projectileRadius,
        };

        // Aplicar movimento suavizado com delta time
        const movement = velocity.current.clone().multiplyScalar(delta);
        meshRef.current.position.add(movement);

        // Efeito visual otimizado: rotação mais sutil
        meshRef.current.rotation.x += delta * 8;
        meshRef.current.rotation.y += delta * 12;

        // Remove o projétil se ele estiver muito longe
        const distance = meshRef.current.position.distanceTo(startPosition);
        if (distance > maxDistance) {
          onRemove(id);
        }
        
        // Remove se sair muito dos limites do mundo
        const pos = meshRef.current.position;
        if (Math.abs(pos.x) > 50 || Math.abs(pos.y) > 50 || pos.z > 20) {
          onRemove(id);
        }
      }
    });
    return (
      <mesh ref={meshRef} position={position}>
        {/* Projétil com formato mais interessante */}
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial
          color='#00ffff'
          emissive='#00ffff'
          emissiveIntensity={0.6}
          transparent
          opacity={0.95}
        />
        
        {/* Efeito de rastro/glow */}
        <mesh scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial
            color='#ffffff'
            transparent
            opacity={0.3}
          />
        </mesh>
        
        {/* Hitbox de debug que segue o projétil */}
        <mesh visible={debugMode}>
          <sphereGeometry args={[projectileRadius, 8, 8]} />
          <meshBasicMaterial 
            color="#00ffff" 
            wireframe 
            transparent 
            opacity={0.5} 
          />
        </mesh>
      </mesh>
    );
  }
);

Projectile.displayName = 'Projectile';
