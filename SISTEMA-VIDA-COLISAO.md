# ❤️ Sistema de Vida e Colisão Implementado

## 📋 Visão Geral

Sistema completo de vida, dano e colisão entre jogador e inimigos, transformando o jogo em uma experiência de sobrevivência onde o jogador deve evitar colisões enquanto destrói inimigos.

## 💔 Sistema de Vida

### **Estado do Jogador**

```typescript
// gameStore.ts
playerHealth: number; // Vida atual (0-100)
isGameOver: boolean; // Estado de fim de jogo
isInvincible: boolean; // Estado de invencibilidade temporária
```

### **Parâmetros Configuráveis**

```typescript
const INITIAL_HEALTH = 100; // Vida inicial
const DAMAGE_PER_COLLISION = 25; // Dano por colisão com inimigo
const INVINCIBILITY_TIME = 1500; // ms de invencibilidade após dano
```

## 🚨 Sistema de Colisão

### **Detecção de Colisão (Player.tsx)**

```typescript
// Raios de colisão
const playerRadius = 0.75; // Raio da nave do jogador
const enemyRadius = 0.5; // Raio dos inimigos

// Verificação por frame
for (const enemy of enemies) {
  const distance = playerPosition.distanceTo(enemy.position);

  if (distance < playerRadius + enemyRadius) {
    // Colisão detectada!
    takeDamage(25);
    removeEnemy(enemy.id);
    break;
  }
}
```

### **Sistema de Invencibilidade**

- **Duração**: 1.5 segundos após receber dano
- **Feedback visual**: Nave fica vermelha e semitransparente
- **Proteção**: Impede múltiplas colisões consecutivas
- **Indicador UI**: Status [INVENCÍVEL] na interface

## 🎮 Mecânicas de Jogo

### **Dano e Morte**

1. **Colisão com inimigo**: -25 vida
2. **Vida ≤ 0**: Game Over instantâneo
3. **Inimigo destruído**: Removido na colisão
4. **Player congelado**: Movimento para se o jogo acabar

### **Feedback Visual**

```typescript
// Cores da nave baseadas no estado
color={isInvincible ? 'red' : 'royalblue'}
opacity={isInvincible ? 0.5 : 1.0}

// Barra de vida colorida
playerHealth > 50  ? "bg-green-500"  // Verde (saudável)
playerHealth > 25  ? "bg-yellow-500" // Amarelo (ferido)
                   : "bg-red-500"    // Vermelho (crítico)
```

### **Estados do Jogo**

- **Jogando**: Movimento normal, pode receber dano
- **Invencível**: Movimento normal, imune a dano
- **Game Over**: Player desaparece, movimento parado

## 📊 Interface de Usuário

### **HUD Durante o Jogo**

```tsx
✅ Score: [pontuação atual]
❤️ Vida: [100] [INVENCÍVEL] // Com indicador visual
📊 Barra de vida colorida (verde/amarelo/vermelho)
👹 Inimigos: [contagem atual]
🔄 Botão Reiniciar
```

### **Tela de Game Over**

```tsx
💀 "GAME OVER" (texto grande, vermelho, pulsante)
🏆 "Pontuação Final: [score]"
🎮 Botão "JOGAR NOVAMENTE"
🎨 Fundo escuro semitransparente
```

## ⚙️ Implementação Técnica

### **gameStore.ts - Ações**

```typescript
takeDamage: amount => {
  // Verificações de estado
  if (isGameOver || isInvincible) return;

  // Ativar invencibilidade
  set({ isInvincible: true });
  setTimeout(() => set({ isInvincible: false }), 1500);

  // Aplicar dano
  const newHealth = playerHealth - amount;
  if (newHealth <= 0) {
    return { playerHealth: 0, isGameOver: true };
  }
  return { playerHealth: newHealth };
};
```

### **Player.tsx - Colisão**

```typescript
useFrame(() => {
  // Congelar se game over
  if (isGameOver) return;

  // Verificar colisões apenas se não invencível
  if (!isInvincible) {
    // Loop por todos os inimigos
    // Calcular distância
    // Executar dano + remoção se colidir
  }
});
```

## 🎯 Experiência de Jogo

### **Tensão e Estratégia**

1. **Risco vs Recompensa**: Chegar perto para atirar melhor vs evitar colisão
2. **Gestão de vida**: Cada colisão é significativa (25% da vida)
3. **Janela de oportunidade**: 1.5s de invencibilidade após dano
4. **Feedback claro**: Sempre sabe sua condição (vida, invencibilidade)

### **Progressão de Dificuldade**

- **Início**: Poucos inimigos, vida cheia
- **Meio jogo**: Mais inimigos, vida reduzida, mais tensão
- **Crítico**: Vida baixa, cada movimento importa

### **Estados Visuais**

- **Saudável** (>50 vida): Azul real, barra verde
- **Ferido** (25-50 vida): Azul real, barra amarela
- **Crítico** (<25 vida): Azul real, barra vermelha
- **Invencível**: Vermelho semitransparente, status na UI
- **Morto**: Player desaparece, tela de Game Over

## 🚀 Resultado Final

O sistema transforma completamente a dinâmica do jogo:

- **Antes**: Player apenas atira, sem consequências
- **Agora**: Player deve balancear ataque e sobrevivência
- **Tensão constante**: Cada inimigo é uma ameaça real
- **Feedback completo**: Interface rica e estados visuais claros
- **Rejogar**: Sistema de Game Over com restart fluido

O jogo agora oferece um ciclo completo de gameplay com risco, recompensa, progressão e rejogabilidade!
