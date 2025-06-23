'use client';

interface MenuProps {
  onStartGame: () => void;
  onShowAbout: () => void;
}

export default function Menu({ onStartGame, onShowAbout }: MenuProps) {
  return (
    <div className='fixed inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-black flex items-center justify-center'>
      <div className='text-center text-white'>
        <h1 className='text-8xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse'>
          DEFENSOR
        </h1>
        <h2 className='text-6xl font-bold mb-12 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent'>
          GALÁCTICO
        </h2>{' '}        <div className='space-y-6'>
          <button
            onClick={onStartGame}
            className='block mx-auto px-12 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105 shadow-lg'
          >
            🚀 INICIAR JOGO
          </button>

          <button
            onClick={onShowAbout}
            className='block mx-auto px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105 shadow-lg'
          >
            ℹ️ SOBRE
          </button>
        </div>{' '}        <div className='mt-12 text-sm text-gray-400'>
          <p>W para frente • A/D para girar • ESPAÇO para atirar</p>
        </div>
      </div>
    </div>
  );
}
