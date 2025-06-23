'use client';

import React from 'react';
import * as THREE from 'three';

interface DebugHitboxProps {
  position: THREE.Vector3;
  radius: number;
  color?: string;
  visible?: boolean;
}

export function DebugHitbox({ 
  position, 
  radius, 
  color = '#ff0000', 
  visible = false 
}: DebugHitboxProps) {
  if (!visible) return null;

  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 8, 8]} />
      <meshBasicMaterial 
        color={color} 
        wireframe 
        transparent 
        opacity={0.3} 
      />
    </mesh>
  );
}
