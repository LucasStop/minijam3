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
  playerHealth: number;
  isGameOver: boolean;
  isGameWon: boolean; // Novo estado para vitória
  isInvincible: boolean;
  isTakingDamage: boolean; // Novo estado para o flash de dano
  
  // Ações para inimigos
  spawnEnemy: (position: THREE.Vector3, type?: Enemy['type']) => void;
  removeEnemy: (id: number) => void;
  updateEnemyPosition: (id: number, position: THREE.Vector3) => void;
  
  // Ações para pontuação
  addScore: (points: number) => void;
  
  // Ações para jogador
  takeDamage: (amount: number) => void;
  
  // Ações de jogo
  startGame: () => void;
  resetGame: () => void;
}

// Criando o ID único para cada inimigo
let enemyIdCounter = 0;

// Valores iniciais para o reset
const INITIAL_HEALTH = 100;
const INITIAL_SCORE = 0;
const VICTORY_SCORE = 200; // Pontuação necessária para vencer

export const useGameStore = create<GameState>((set, get) => ({
  enemies: [],
  score: INITIAL_SCORE,
  gameStarted: false,
  playerHealth: INITIAL_HEALTH,
  isGameOver: false,
  isGameWon: false,
  isInvincible: false,
  isTakingDamage: false,

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
    })),  // Adicionar pontos ao score
  addScore: (points) =>
    set((state) => {
      const newScore = state.score + points;
      if (newScore >= VICTORY_SCORE && !state.isGameWon) {
        // Jogo vencido!
        console.log('🎉 VITÓRIA! Pontuação atingida:', newScore);
        return { 
          score: newScore, 
          isGameWon: true, 
          isGameOver: true 
        };
      }
      return { score: newScore };
    }),
  // Receber dano
  takeDamage: (amount) => {
    // Só executa se o jogo não tiver acabado e não estiver invencível
    if (get().isGameOver || get().isInvincible) return;

    set({ isTakingDamage: true }); // Ativa o flash de dano
    setTimeout(() => set({ isTakingDamage: false }), 150); // Desativa após 150ms

    set({ isInvincible: true }); // Fica invencível temporariamente
    
    // Volta ao normal após 1.5 segundos
    setTimeout(() => {
      const currentState = get();
      if (!currentState.isGameOver) {
        set({ isInvincible: false });
      }
    }, 1500);

    set((state) => {
      const newHealth = state.playerHealth - amount;
      if (newHealth <= 0) {
        // Se a vida zerar, o jogo acaba
        return { 
          playerHealth: 0, 
          isGameOver: true,
          isInvincible: false 
        };
      }
      return { playerHealth: newHealth };
    });
  },

  // Iniciar o jogo
  startGame: () =>
    set(() => ({ gameStarted: true })),  // Resetar o jogo
  resetGame: () =>
    set(() => ({
      enemies: [],
      score: INITIAL_SCORE,
      gameStarted: false,
      playerHealth: INITIAL_HEALTH,
      isGameOver: false,
      isGameWon: false,
      isInvincible: false,
      isTakingDamage: false,
    })),
}));
