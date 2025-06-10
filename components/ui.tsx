interface UIProps {
  score: number;
  lives: number;
}

export default function UI({ score, lives }: UIProps) {
  return (
    <div className='absolute top-0 left-0 right-0 p-4 text-white z-10'>
      <div className='flex justify-between items-center'>
        <div className='text-2xl font-bold'>
          <div className='bg-black/50 px-4 py-2 rounded-lg'>
            SCORE: {score.toLocaleString()}
          </div>
        </div>

        <div className='text-2xl font-bold'>
          <div className='bg-black/50 px-4 py-2 rounded-lg flex items-center gap-2'>
            VIDAS:
            {Array.from({ length: lives }, (_, i) => (
              <span key={i} className='text-red-500'>
                ❤️
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className='mt-4 text-center'>
        <div className='bg-black/30 px-4 py-2 rounded-lg inline-block'>
          <p className='text-sm'>⬅️ ➡️ Mover • 🚀 ESPAÇO Atirar</p>
        </div>
      </div>
    </div>
  );
}
