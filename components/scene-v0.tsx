// src/components/Scene.js
"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Player } from "./player-v0";
import * as THREE from "three";

export function Scene() {
  const playerRef = useRef<THREE.Mesh>(null);

  // A lógica da câmera fica aqui, pois precisa acessar tanto a câmera quanto a ref do jogador
  useFrame(({ camera }) => {
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
  });

  return (
    <>
      <Stars radius={150} count={4000} factor={6} fade speed={1} />
      <ambientLight intensity={0.7} />
      <pointLight position={[100, 100, 100]} intensity={2} /> {/* Luz extra */}
      <Player ref={playerRef} />
    </>
  );
}
