'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import * as THREE from 'three';
import { MathUtils } from 'three';

// === HOOK CUSTOMIZADO PARA INTERVAL ===
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<(() => void) | null>(null);

  // Lembrar da callback mais recente
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Configurar o intervalo
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

interface EnemySpawnerProps {
  difficulty?: number; // 1 = fácil, 2 = médio, 3 = difícil
  enabled?: boolean; // Permite pausar o spawner
}

export function EnemySpawner({
  difficulty = 1,
  enabled = true,
}: EnemySpawnerProps) {
  // === SELETORES DO STORE ===
  const spawnEnemy = useGameStore(state => state.spawnEnemy);
  const currentGameState = useGameStore(state => state.currentGameState);
  const score = useGameStore(state => state.score);
  const enemies = useGameStore(state => state.enemies);

  // === CONFIGURAÇÕES DE SPAWN ===
  const getSpawnConfig = () => {
    // Dificuldade aumenta com o tempo e pontuação
    const dynamicDifficulty = difficulty + Math.floor(score / 100) * 0.5;
    const difficultyMultiplier = Math.max(0.3, 1 - dynamicDifficulty * 0.1);

    return {
      // Intervalos de spawn (em ms)      // Intervalos de spawn (em ms) - mais agressivos
      basicInterval: Math.max(600, 1500 * difficultyMultiplier),
      fastInterval: Math.max(1200, 3000 * difficultyMultiplier),
      heavyInterval: Math.max(2500, 6000 * difficultyMultiplier),

      // Áreas de spawn estratégicas - atrás do jogador
      areas: {
        basic: {
          min: new THREE.Vector3(-15, -10, -30),
          max: new THREE.Vector3(15, 10, -20),
        },
        fast: {
          min: new THREE.Vector3(-20, -8, -35),
          max: new THREE.Vector3(20, 8, -15),
        },
        heavy: {
          min: new THREE.Vector3(-12, -6, -40),
          max: new THREE.Vector3(12, 6, -25),
        },
      },

      // Limite máximo aumentado para mais ação
      maxEnemies: Math.min(15, 10 + Math.floor(score / 100)),
    };
  };
  // === FUNÇÃO DE SPAWN GENÉRICA ===
  const spawnEnemyOfType = (type: 'basic' | 'fast' | 'heavy') => {
    const config = getSpawnConfig();

    // Não spawnar se o jogo não começou ou acabou
    if (currentGameState !== 'playing' || !enabled) return;

    // Não spawnar se atingiu o limite máximo
    if (enemies.length >= config.maxEnemies) {
      console.log(
        `🚫 Limite de inimigos atingido: ${enemies.length}/${config.maxEnemies}`
      );
      return;
    }

    // Obter área de spawn para o tipo
    const area = config.areas[type];

    // Calcular posição aleatória dentro da área
    const x = MathUtils.randFloat(area.min.x, area.max.x);
    const y = MathUtils.randFloat(area.min.y, area.max.y);
    const z = MathUtils.randFloat(area.min.z, area.max.z);

    const position = new THREE.Vector3(x, y, z);

    // Spawnar o inimigo
    spawnEnemy(position, type);

    console.log(
      `👹 ${type.toUpperCase()} spawned em (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}) - Total: ${enemies.length + 1} - Perseguindo jogador!`
    );
  };

  // === SPAWNERS AUTOMÁTICOS COM INTERVALS DINÂMICOS ===
  const config = getSpawnConfig();
  // Spawner de inimigos básicos
  useInterval(
    () => {
      spawnEnemyOfType('basic');
    },
    currentGameState === 'playing' && enabled ? config.basicInterval : null
  );

  // Spawner de inimigos rápidos (requer pontuação mínima)
  useInterval(
    () => {
      if (score >= 25) {
        // Só aparece depois de 25 pontos
        spawnEnemyOfType('fast');
      }
    },
    currentGameState === 'playing' && enabled ? config.fastInterval : null
  );

  // Spawner de inimigos pesados (requer pontuação alta)
  useInterval(
    () => {
      if (score >= 75) {
        // Só aparece depois de 75 pontos
        spawnEnemyOfType('heavy');
      }
    },
    currentGameState === 'playing' && enabled ? config.heavyInterval : null
  );

  // === SISTEMA DE ONDAS DE INIMIGOS ===
  const waveRef = useRef(0);
  const waveTimer = useRef(0);
  // Sistema de padrões de spawn especiais
  const spawnWave = (waveNumber: number) => {
    const config = getSpawnConfig();

    console.log(
      `🌊 ONDA ${waveNumber} INICIADA! Inimigos vão perseguir ativamente!`
    );

    // Diferentes padrões baseados no número da onda
    if (waveNumber % 5 === 0) {
      // A cada 5 ondas: Ataque coordenado de múltiplos lados
      const sides = [
        new THREE.Vector3(-20, 0, -25), // Esquerda
        new THREE.Vector3(20, 0, -25), // Direita
        new THREE.Vector3(0, -15, -25), // Abaixo
        new THREE.Vector3(0, 15, -25), // Acima
      ];

      sides.forEach((position, i) => {
        setTimeout(() => {
          spawnEnemy(position, i % 2 === 0 ? 'fast' : 'basic');
        }, i * 300);
      });
    } else if (waveNumber % 3 === 0) {
      // A cada 3 ondas: Formação em V perseguindo
      const center = new THREE.Vector3(0, 0, -30);
      for (let i = 0; i < 5; i++) {
        const offset = (i - 2) * 5; // Espaçamento maior
        const position = center
          .clone()
          .add(new THREE.Vector3(offset, offset * 0.3, i * -2));
        setTimeout(() => {
          spawnEnemy(
            position,
            i === 2 ? 'heavy' : i % 2 === 0 ? 'fast' : 'basic'
          );
        }, i * 400);
      }
    } else {
      // Onda padrão: Chuva de inimigos básicos vindos de trás
      for (let i = 0; i < 4; i++) {
        const randomX = (Math.random() - 0.5) * 30;
        const randomY = (Math.random() - 0.5) * 20;
        const position = new THREE.Vector3(randomX, randomY, -25 - i * 3);
        setTimeout(() => spawnEnemy(position, 'basic'), i * 250);
      }
    }
  };

  // Trigger de ondas especiais baseado na pontuação
  useEffect(() => {
    const newWave = Math.floor(score / 150); // Nova onda a cada 150 pontos
    if (newWave > waveRef.current && score > 0) {
      waveRef.current = newWave;
      spawnWave(newWave);
    }
  }, [score]);
  // === DEBUG INFO ===
  useEffect(() => {
    if (currentGameState === 'playing') {
      const config = getSpawnConfig();
      console.log(
        `📊 SPAWN CONFIG - Difficulty: ${difficulty}, Score: ${score}`
      );
      console.log(
        `⏱️  Intervals: Basic=${config.basicInterval}ms, Fast=${config.fastInterval}ms, Heavy=${config.heavyInterval}ms`
      );
      console.log(
        `📈 Max Enemies: ${config.maxEnemies}, Current: ${enemies.length}`
      );
    }
  }, [score, difficulty, currentGameState, enemies.length]);

  // Este componente não renderiza nada na tela
  return null;
}
