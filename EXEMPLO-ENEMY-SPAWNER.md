# 🎮 Exemplo de Uso do EnemySpawner

## Como Usar o Novo Sistema

### 1. **Uso Básico**
```tsx
// Em scene.tsx ou game.tsx
import { EnemySpawner } from './enemy-spawner';

export function Game() {
  return (
    <>
      {/* Outros componentes */}
      
      {/* Spawner com configuração básica */}
      <EnemySpawner difficulty={1} enabled={true} />
    </>
  );
}
```

### 2. **Configuração por Nível**
```tsx
// Diferentes configurações para diferentes níveis
const GameLevel = ({ level }: { level: number }) => {
  const getDifficulty = () => {
    if (level <= 3) return 1;      // Fácil
    if (level <= 7) return 2;      // Médio  
    return 3;                      // Difícil
  };

  return (
    <EnemySpawner 
      difficulty={getDifficulty()} 
      enabled={!isPaused} 
    />
  );
};
```

### 3. **Controle Dinâmico**
```tsx
// Pausar spawning durante boss fights
const [bossActive, setBossActive] = useState(false);

return (
  <EnemySpawner 
    difficulty={2} 
    enabled={!bossActive && gameStarted} 
  />
);
```

## 🎯 Testando o Sistema

### **Console Logs Esperados**
```
📊 SPAWN CONFIG - Difficulty: 1, Score: 50
⏱️  Intervals: Basic=1800ms, Fast=3600ms, Heavy=7200ms
📈 Max Enemies: 9, Current: 3
👹 BASIC spawned em (-8.2, 3.1, -22.5) - Total: 4
👹 FAST spawned em (12.1, -2.8, -28.3) - Total: 5
🌊 ONDA 1 INICIADA!
🚫 Limite de inimigos atingido: 15/15
```

### **Progressão Esperada**
- **0-25 pontos**: Apenas básicos, intervalo ~2s
- **25-75 pontos**: Básicos + rápidos
- **75+ pontos**: Todos os tipos
- **150 pontos**: Primeira onda especial
- **300 pontos**: Formação em V
- **750 pontos**: Chuva de inimigos

## 🔧 Personalizações Rápidas

### **Spawning Mais Agressivo**
```typescript
// No enemy-spawner.tsx, linha ~45
basicInterval: Math.max(500, 1000 * difficultyMultiplier), // Mais rápido
```

### **Mais Inimigos Simultâneos**
```typescript
// No enemy-spawner.tsx, linha ~65
maxEnemies: Math.min(30, 15 + Math.floor(score / 30)), // Mais inimigos
```

### **Ondas Mais Frequentes**
```typescript
// No enemy-spawner.tsx, linha ~120
const newWave = Math.floor(score / 100); // A cada 100 pontos
```

## 📊 Monitoramento

### **Debug Info**
O sistema imprime automaticamente:
- Configuração atual de spawn
- Total de inimigos na tela
- Quando ondas especiais são ativadas
- Quando limites são atingidos

### **Estado do Jogo**
```typescript
// Para verificar inimigos ativos
const enemies = useGameStore(state => state.enemies);
console.log(`Inimigos ativos: ${enemies.length}`);
```

Agora você tem um sistema de spawn muito mais interessante e configurável! 🎉
