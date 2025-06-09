"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

interface ProjectileProps {
  position: THREE.Vector3
}

export default function Projectile({ position }: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return

    meshRef.current.position.copy(position)
    meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.2)
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.2]} />
      <meshStandardMaterial color="#00ffff" emissive="#0088ff" />
    </mesh>
  )
}
