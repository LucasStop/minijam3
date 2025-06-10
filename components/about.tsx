'use client';

interface AboutProps {
  onBack: () => void;
}

export default function About({ onBack }: AboutProps) {
  return (
    <div className='fixed inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-black flex items-center justify-center'>
      <div className='text-center text-white max-w-2xl mx-auto p-8'>
        <h1 className='text-6xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent'>
          SOBRE O JOGO
        </h1>

        <div className='space-y-6 text-lg'>
          <div className='bg-black/30 p-6 rounded-lg'>
            <h2 className='text-2xl font-bold mb-4 text-cyan-400'>
              👨‍💻 Desenvolvido por:
            </h2>
            <p className='text-xl'>[Seu Nome Completo]</p>
            <p className='text-xl'>[Nome do Colega, se houver]</p>
          </div>

          <div className='bg-black/30 p-6 rounded-lg'>
            <h2 className='text-2xl font-bold mb-4 text-purple-400'>
              🎮 Sobre o Jogo:
            </h2>
            <p className='mb-4'>
              Você é o piloto da última nave defensora da Terra. Hordas de
              invasores alienígenas estão atacando! Destrua-os, sobreviva o
              máximo possível e alcance a maior pontuação.
            </p>
            <p>
              A dificuldade aumenta progressivamente - prepare-se para o
              desafio!
            </p>
          </div>

          <div className='bg-black/30 p-6 rounded-lg'>
            <h2 className='text-2xl font-bold mb-4 text-green-400'>
              🎯 Como Jogar:
            </h2>
            <ul className='space-y-2'>
              <li>
                ⬅️ ➡️ <strong>Setas:</strong> Mover a nave
              </li>
              <li>
                🚀 <strong>Espaço:</strong> Atirar
              </li>
              <li>
                💯 <strong>Objetivo:</strong> Destruir inimigos e sobreviver
              </li>
              <li>
                ❤️ <strong>Vidas:</strong> Você tem 3 vidas - não deixe os
                inimigos te atingirem!
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={onBack}
          className='mt-8 px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors'
        >
          ⬅️ VOLTAR
        </button>
      </div>
    </div>
  );
}
