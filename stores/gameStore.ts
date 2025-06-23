import { create } from 'zustand';
import * as THREE from 'three';

// Interface para definir a estrutura de um inimigo
export interface Enemy {
  id: number;
  position: THREE.Vector3;
  health?: number;
  type?: 'basic' | 'fast' | 'heavy';
}

// Interface para projéteis/balas
export interface Projectile {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
}

// Interface para o nosso estado global
interface GameState {
  enemies: Enemy[];
  projectiles: Projectile[]; // Novo estado para projéteis
  score: number;
  gameStarted: boolean;
  playerHealth: number;
  currentGameState: 'menu' | 'playing' | 'gameOver'; // Novo estado do jogo
  isGameOver: boolean;
  isGameWon: boolean; // Novo estado para vitória
  isInvincible: boolean;
  isTakingDamage: boolean; // Novo estado para o flash de dano
  deathCause: string; // Causa da morte para exibir na tela
  debugMode: boolean; // Debug visual das hitboxes
  
  // Estatísticas de colisão
  collisionStats: {
    totalCollisions: number;
    projectileHits: number;
    enemyHits: number;
    accuracy: number; // Percentual de acerto
    shotsFired: number;
  };

  // Ações para inimigos
  spawnEnemy: (position: THREE.Vector3, type?: Enemy['type']) => void;
  removeEnemy: (id: number) => void;
  updateEnemyPosition: (id: number, position: THREE.Vector3) => void;

  // Ações para projéteis
  addProjectile: (projectile: Projectile) => void;
  removeProjectile: (id: string) => void;

  // Ações para pontuação
  addScore: (points: number) => void;
  increaseScore: (points: number) => void; // Alias para consistência

  // Ações para jogador
  takeDamage: (amount: number, cause?: string) => void;

  // Ações de jogo
  startGame: () => void;
  resetGame: () => void;
  setGameState: (state: 'menu' | 'playing' | 'gameOver') => void; // Nova ação
  toggleDebugMode: () => void; // Ação para alternar debug mode
  
  // Ações para estatísticas de colisão
  recordShot: () => void;
  recordHit: () => void;
  recordCollision: () => void;
}

// Criando o ID único para cada inimigo
let enemyIdCounter = 0;

// Valores iniciais para o reset
const INITIAL_HEALTH = 100;
const INITIAL_SCORE = 0;
const VICTORY_SCORE = 200; // Pontuação necessária para vencer

export const useGameStore = create<GameState>((set, get) => ({
  enemies: [],
  projectiles: [], // Novo array para projéteis
  score: INITIAL_SCORE,
  gameStarted: false,
  playerHealth: INITIAL_HEALTH,
  currentGameState: 'menu', // Estado inicial
  isGameOver: false,
  isGameWon: false,
  isInvincible: false,
  isTakingDamage: false,
  deathCause: '',
  debugMode: false, // Debug das hitboxes desabilitado por padrão
  
  // Estatísticas de colisão
  collisionStats: {
    totalCollisions: 0,
    projectileHits: 0,
    enemyHits: 0,
    accuracy: 0,
    shotsFired: 0,
  },

  // Spawnar um novo inimigo
  spawnEnemy: (position, type = 'basic') =>
    set(state => ({
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
  removeEnemy: id =>
    set(state => ({
      enemies: state.enemies.filter(enemy => enemy.id !== id),
    })),

  // Atualizar posição de um inimigo específico
  updateEnemyPosition: (id, position) =>
    set(state => ({
      enemies: state.enemies.map(enemy =>
        enemy.id === id ? { ...enemy, position: position.clone() } : enemy
      ),
    })),  // Adicionar pontos ao score
  addScore: points =>
    set(state => {
      const newScore = state.score + points;
      if (newScore >= VICTORY_SCORE && !state.isGameWon) {
        // Jogo vencido!
        console.log('🎉 VITÓRIA! Pontuação atingida:', newScore);
        return {
          score: newScore,
          isGameWon: true,
          isGameOver: true,
        };
      }
      return { score: newScore };
    }),

  // Alias para addScore (para consistência com a sugestão)
  increaseScore: points =>
    set(state => {
      const newScore = state.score + points;
      if (newScore >= VICTORY_SCORE && !state.isGameWon) {
        console.log('🎉 VITÓRIA! Pontuação atingida:', newScore);
        return {
          score: newScore,
          isGameWon: true,
          isGameOver: true,
        };
      }
      return { score: newScore };
    }),

  // Adicionar projétil
  addProjectile: projectile =>
    set(state => ({
      projectiles: [...state.projectiles, projectile],
    })),

  // Remover projétil por ID
  removeProjectile: id =>
    set(state => ({
      projectiles: state.projectiles.filter(projectile => projectile.id !== id),
    })),
  // Receber dano
  takeDamage: (amount, cause = 'Dano desconhecido') => {
    // Só executa se o jogo não tiver acabado e não estiver invencível
    if (get().isGameOver || get().isInvincible) return;

    console.log(`💥 Jogador recebeu ${amount} de dano! Causa: ${cause}`);

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

    set(state => {
      const newHealth = state.playerHealth - amount;
      if (newHealth <= 0) {
        // Se a vida zerar, o jogo acaba
        console.log(`💀 MORTE! Causa: ${cause}`);
        console.log(`📊 Estatísticas finais - Score: ${state.score}, Saúde: 0`);
        
        // Som de morte (apenas no console para debug)
        console.log(`🔊 Som de morte reproduzido para: ${cause}`);
        
        return {
          playerHealth: 0,
          isGameOver: true,
          currentGameState: 'gameOver', // Atualizar estado do jogo
          isInvincible: false,
          deathCause: cause,
        };
      }
      return { playerHealth: newHealth };
    });
  },

  // Iniciar o jogo
  startGame: () => set(() => ({ gameStarted: true, currentGameState: 'playing' })),

  // Alterar estado do jogo
  setGameState: (state) => set(() => ({ currentGameState: state })),  // Resetar o jogo
  resetGame: () =>
    set(() => ({
      enemies: [],
      projectiles: [], // Limpar projéteis também
      score: INITIAL_SCORE,
      gameStarted: false,
      playerHealth: INITIAL_HEALTH,
      currentGameState: 'menu', // Voltar ao menu
      isGameOver: false,
      isGameWon: false,
      isInvincible: false,
      isTakingDamage: false,
      deathCause: '',
      // debugMode mantém o estado atual
      collisionStats: {
        totalCollisions: 0,
        projectileHits: 0,
        enemyHits: 0,
        accuracy: 0,
        shotsFired: 0,
      },
    })),
    
  // Alternar modo debug
  toggleDebugMode: () => set(state => ({ debugMode: !state.debugMode })),
  
  // === AÇÕES DE ESTATÍSTICAS DE COLISÃO ===
  recordShot: () => set(state => {
    const newShotsFired = state.collisionStats.shotsFired + 1;
    const accuracy = newShotsFired > 0 ? (state.collisionStats.projectileHits / newShotsFired) * 100 : 0;
    return {
      collisionStats: {
        ...state.collisionStats,
        shotsFired: newShotsFired,
        accuracy: Math.round(accuracy * 100) / 100, // Arredondar para 2 casas decimais
      }
    };
  }),
  
  recordHit: () => set(state => {
    const newHits = state.collisionStats.projectileHits + 1;
    const accuracy = state.collisionStats.shotsFired > 0 ? (newHits / state.collisionStats.shotsFired) * 100 : 0;
    return {
      collisionStats: {
        ...state.collisionStats,
        projectileHits: newHits,
        accuracy: Math.round(accuracy * 100) / 100,
      }
    };
  }),
  
  recordCollision: () => set(state => ({
    collisionStats: {
      ...state.collisionStats,
      totalCollisions: state.collisionStats.totalCollisions + 1,
    }
  })),
}));
