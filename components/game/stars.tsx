'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Props para podermos customizar o número de estrelas
interface StarsProps {
  count?: number;
  speed?: number;
  spread?: number;
  playerVelocity?: THREE.Vector3;
}

export function Stars({ count = 5000, speed = 8, spread = 100, playerVelocity }: StarsProps) {
  const meshRef = useRef<THREE.Points>(null!);

  // Gera as posições das estrelas de forma procedural e memoriza o resultado
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Posições aleatórias em um cubo grande
      positions[i * 3 + 0] = (Math.random() - 0.5) * spread; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread; // z

      // Cores variadas para as estrelas (tons de branco/azul/amarelo)
      const starType = Math.random();
      if (starType < 0.7) {
        // Estrelas brancas (maioria)
        colors[i * 3 + 0] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      } else if (starType < 0.85) {
        // Estrelas azuladas
        colors[i * 3 + 0] = 0.7;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 1;
      } else {
        // Estrelas amareladas
        colors[i * 3 + 0] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 0.7;
      }
    }
    return [positions, colors];
  }, [count, spread]);
  // Animação a cada frame
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const positionAttribute = meshRef.current.geometry.attributes.position;
    const positions = positionAttribute.array as Float32Array;

    // Calcula velocidade base das estrelas com efeito warp baseado na velocidade do jogador
    let currentSpeed = speed;
    if (playerVelocity) {
      // Quando o jogador se move para frente (velocidade Z negativa), acelera as estrelas
      const forwardSpeed = Math.abs(Math.min(0, playerVelocity.z));
      currentSpeed = speed + (forwardSpeed * 3); // Multiplica o efeito por 3
    }

    // Move cada estrela individualmente para criar efeito de velocidade warp
    for (let i = 0; i < count; i++) {
      // Move a estrela em direção ao jogador (eixo Z positivo)
      positions[i * 3 + 2] += currentSpeed * delta;

      // Efeito adicional: espalha as estrelas lateralmente quando em alta velocidade
      if (currentSpeed > speed * 1.5) {
        const warpFactor = (currentSpeed - speed) * 0.01;
        positions[i * 3 + 0] += positions[i * 3 + 0] * warpFactor * delta;
        positions[i * 3 + 1] += positions[i * 3 + 1] * warpFactor * delta;
      }

      // Se a estrela passou da câmera, reposiciona ela no fundo
      if (positions[i * 3 + 2] > 50) {
        positions[i * 3 + 2] = -50;
        // Randomiza a posição X e Y para variedade
        positions[i * 3 + 0] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      }
    }

    // Marca o atributo como modificado para que o Three.js o atualize
    positionAttribute.needsUpdate = true;
  });
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors={true} // Usa as cores definidas no atributo color
        sizeAttenuation={true} // Estrelas mais longe parecem menores
        transparent={true}
        alphaTest={0.5}
        fog={false}
      />
    </points>
  );
}
