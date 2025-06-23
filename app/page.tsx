'use client';

import { useEffect } from 'react';
import Game from '@/components/game/game';
import { useGameStore } from '@/stores/gameStore';

export default function App() {
  const currentGameState = useGameStore(state => state.currentGameState);
  const playerHealth = useGameStore(state => state.playerHealth);
  const setGameState = useGameStore(state => state.setGameState);

  // Verificar se a vida chegou a zero para transição automática para game over
  useEffect(() => {
    if (playerHealth <= 0 && currentGameState === 'playing') {
      setGameState('gameOver');
    }
  }, [playerHealth, currentGameState, setGameState]);

  return (
    <div className='w-full h-screen'>
      <Game />
    </div>
  );
}
