"use client"

import { Canvas } from "@react-three/fiber"
import { useState, useEffect, useCallback } from "react"
import Player from "@/components/player"
import Enemy from "@/components/enemy"
import Projectile from "@/components/projectile"
import UI from "@/components/ui"
import * as THREE from "three"

interface GameProps {
  onGameOver: (score: number) => void
}

export interface GameObject {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
}

export default function Game({ onGameOver }: GameProps) {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [enemies, setEnemies] = useState<GameObject[]>([])
  const [projectiles, setProjectiles] = useState<GameObject[]>([])
  const [gameSpeed, setGameSpeed] = useState(1)
  const [spawnRate, setSpawnRate] = useState(2000)

  // Aumentar dificuldade baseado na pontuação
  useEffect(() => {
    const speedMultiplier = 1 + Math.floor(score / 1000) * 0.1
    const newSpawnRate = Math.max(500, 2000 - Math.floor(score / 2500) * 200)

    setGameSpeed(speedMultiplier)
    setSpawnRate(newSpawnRate)
  }, [score])

  // Spawn de inimigos
  useEffect(() => {
    const spawnEnemy = () => {
      const newEnemy: GameObject = {
        id: Math.random().toString(36).substr(2, 9),
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 18, // Posição X aleatória
          10,
          0,
        ),
        velocity: new THREE.Vector3(0, -2 * gameSpeed, 0),
      }
      setEnemies((prev) => [...prev, newEnemy])
    }

    const interval = setInterval(spawnEnemy, spawnRate)
    return () => clearInterval(interval)
  }, [gameSpeed, spawnRate])

  // Atualizar posições e detectar colisões
  useEffect(() => {
    const gameLoop = setInterval(() => {
      // Atualizar inimigos
      setEnemies((prev) =>
        prev
          .map((enemy) => ({
            ...enemy,
            position: enemy.position.clone().add(enemy.velocity.clone().multiplyScalar(0.016)),
          }))
          .filter((enemy) => enemy.position.y > -12),
      )

      // Atualizar projéteis
      setProjectiles((prev) =>
        prev
          .map((projectile) => ({
            ...projectile,
            position: projectile.position.clone().add(projectile.velocity.clone().multiplyScalar(0.016)),
          }))
          .filter((projectile) => projectile.position.y < 12),
      )

      // Detectar colisões projétil-inimigo
      setProjectiles((prevProjectiles) => {
        setEnemies((prevEnemies) => {
          const remainingEnemies: GameObject[] = []
          const remainingProjectiles: GameObject[] = []
          let scoreIncrease = 0

          prevEnemies.forEach((enemy) => {
            let enemyHit = false
            prevProjectiles.forEach((projectile) => {
              const distance = enemy.position.distanceTo(projectile.position)
              if (distance < 1.5) {
                enemyHit = true
                scoreIncrease += 100
              } else {
                if (!remainingProjectiles.find((p) => p.id === projectile.id)) {
                  remainingProjectiles.push(projectile)
                }
              }
            })
            if (!enemyHit) {
              remainingEnemies.push(enemy)
            }
          })

          if (scoreIncrease > 0) {
            setScore((prev) => prev + scoreIncrease)
          }

          setProjectiles(remainingProjectiles)
          return remainingEnemies
        })
        return prevProjectiles
      })

      // Verificar se inimigos atingiram o jogador (posição Y < -8)
      setEnemies((prev) => {
        const enemiesAtBottom = prev.filter((enemy) => enemy.position.y < -8)
        if (enemiesAtBottom.length > 0) {
          setLives((prevLives) => {
            const newLives = prevLives - enemiesAtBottom.length
            if (newLives <= 0) {
              setTimeout(() => onGameOver(score), 100)
            }
            return Math.max(0, newLives)
          })
        }
        return prev.filter((enemy) => enemy.position.y >= -8)
      })
    }, 16)

    return () => clearInterval(gameLoop)
  }, [score, onGameOver])

  const handleShoot = useCallback((playerPosition: THREE.Vector3) => {
    const newProjectile: GameObject = {
      id: Math.random().toString(36).substr(2, 9),
      position: playerPosition.clone().add(new THREE.Vector3(0, 1, 0)),
      velocity: new THREE.Vector3(0, 15, 0),
    }
    setProjectiles((prev) => [...prev, newProjectile])
  }, [])

  return (
    <div className="w-full h-screen relative">
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#4a90e2" />

        {/* Fundo estrelado */}
        <mesh position={[0, 0, -10]}>
          <planeGeometry args={[50, 50]} />
          <meshBasicMaterial color="#000011" />
        </mesh>

        <Player onShoot={handleShoot} />

        {enemies.map((enemy) => (
          <Enemy key={enemy.id} position={enemy.position} />
        ))}

        {projectiles.map((projectile) => (
          <Projectile key={projectile.id} position={projectile.position} />
        ))}
      </Canvas>

      <UI score={score} lives={lives} />
    </div>
  )
}
