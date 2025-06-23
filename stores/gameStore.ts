import { create } from 'zustand';
import * as THREE from 'three';

// Interface para definir a estrutura de um inimigo
export interface Enemy {
  id: number;
  position: THREE.Vector3;
  health?: number;
  type?: 'basic' | 'fast' | 'heavy';
}

// Interface para o nosso estado global
interface GameState {
  enemies: Enemy[];
  score: number;
  gameStarted: boolean;
  
  // Ações para inimigos
  spawnEnemy: (position: THREE.Vector3, type?: Enemy['type']) => void;
  removeEnemy: (id: number) => void;
  updateEnemyPosition: (id: number, position: THREE.Vector3) => void;
  
  // Ações para pontuação
  addScore: (points: number) => void;
  
  // Ações de jogo
  startGame: () => void;
  resetGame: () => void;
}

// Criando o ID único para cada inimigo
let enemyIdCounter = 0;

export const useGameStore = create<GameState>((set, get) => ({
  enemies: [],
  score: 0,
  gameStarted: false,

  // Spawnar um novo inimigo
  spawnEnemy: (position, type = 'basic') =>
    set((state) => ({
      enemies: [
        ...state.enemies,
        {
          id: enemyIdCounter++,
          position: position.clone(),
          health: type === 'heavy' ? 3 : type === 'fast' ? 1 : 2,
          type,
        },
      ],
    })),

  // Remover inimigo por ID
  removeEnemy: (id) =>
    set((state) => ({
      enemies: state.enemies.filter((enemy) => enemy.id !== id),
    })),

  // Atualizar posição de um inimigo específico
  updateEnemyPosition: (id, position) =>
    set((state) => ({
      enemies: state.enemies.map((enemy) =>
        enemy.id === id ? { ...enemy, position: position.clone() } : enemy
      ),
    })),

  // Adicionar pontos ao score
  addScore: (points) =>
    set((state) => ({ score: state.score + points })),

  // Iniciar o jogo
  startGame: () =>
    set(() => ({ gameStarted: true })),

  // Resetar o jogo
  resetGame: () =>
    set(() => ({
      enemies: [],
      score: 0,
      gameStarted: false,
    })),
}));
