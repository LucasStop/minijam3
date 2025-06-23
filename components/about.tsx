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
          </div>          <div className='bg-black/30 p-6 rounded-lg'>
            <h2 className='text-2xl font-bold mb-4 text-purple-400'>
              🎮 Sobre o Space Fighter:
            </h2>
            <p className='mb-4'>
              Você é o piloto da nave espacial mais avançada da galáxia! 
              Ondas infinitas de inimigos alienígenas estão atacando. 
              Use seus reflexos, mira precisa e habilidades de voo para 
              destruí-los e sobreviver o máximo possível.
            </p>
            <p>
              Sistema de combate dinâmico com mira livre, movimento cartesiano 
              2D e física realista. A dificuldade aumenta progressivamente!
            </p>
          </div>          <div className='bg-black/30 p-6 rounded-lg'>
            <h2 className='text-2xl font-bold mb-4 text-green-400'>
              🎯 Controles Modernos:
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-left'>
              <div>
                <h3 className='font-bold text-cyan-400 mb-2'>🎮 Movimento:</h3>
                <ul className='space-y-1 text-sm'>
                  <li><strong>W:</strong> Mover para cima</li>
                  <li><strong>A:</strong> Mover para esquerda</li>
                  <li><strong>S:</strong> Mover para baixo</li>
                  <li><strong>D:</strong> Mover para direita</li>
                  <li><strong>SPACE:</strong> Acelerar</li>
                  <li><strong>CTRL:</strong> Desacelerar/Frear</li>
                </ul>
              </div>
              <div>
                <h3 className='font-bold text-red-400 mb-2'>🎯 Combate:</h3>
                <ul className='space-y-1 text-sm'>
                  <li><strong>Mouse:</strong> Mirar livremente</li>
                  <li><strong>Clique Esquerdo:</strong> Atirar</li>
                  <li><strong>Mira visual:</strong> Reticle vermelho</li>
                  <li><strong>Precisão total:</strong> Atire onde aponta</li>
                </ul>
              </div>
            </div>
          </div>

          <div className='bg-black/30 p-6 rounded-lg'>
            <h2 className='text-2xl font-bold mb-4 text-yellow-400'>
              💡 Dicas de Sobrevivência:
            </h2>
            <ul className='space-y-2 text-left'>
              <li>
                ❤️ <strong>Vida:</strong> Você tem 100 pontos de vida
              </li>
              <li>
                💥 <strong>Colisões:</strong> Cada inimigo causa 25 de dano
              </li>
              <li>
                🛡️ <strong>Invencibilidade:</strong> 1.5s após receber dano
              </li>
              <li>
                🎯 <strong>Estratégia:</strong> Use movimento + mira para kiting
              </li>
              <li>
                🚀 <strong>Movimento:</strong> Combine WASD + SPACE para agilidade
              </li>
              <li>
                🎮 <strong>Mira:</strong> Lidere alvos em movimento
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
