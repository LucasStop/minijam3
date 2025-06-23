# 🎯 Sistema de Inimigos Implementado

## 📋 Resumo das Funcionalidades

Sistema completo de geração, gerenciamento e combate de inimigos usando **Zustand** para estado global e **React Three Fiber** para renderização 3D.

## 🏗️ Arquitetura do Sistema

### 📦 **GameStore (Zustand)**

**Arquivo:** `stores/gameStore.ts`

**Estado Global:**

```typescript
interface GameState {
  enemies: Enemy[]; // Lista de inimigos ativos
  score: number; // Pontuação do jogador
  gameStarted: boolean; // Status do jogo
}
```

**Ações Principais:**

- `spawnEnemy()` - Criar novo inimigo
- `removeEnemy()` - Remover inimigo por ID
- `addScore()` - Adicionar pontos
- `startGame()` / `resetGame()` - Controlar fluxo do jogo

### 🤖 **Tipos de Inimigos**

| Tipo      | Velocidade | HP  | Pontos | Comportamento    | Aparência         |
| --------- | ---------- | --- | ------ | ---------------- | ----------------- |
| **Basic** | 5          | 2   | 10     | Movimento reto   | Cone laranja      |
| **Fast**  | 8          | 1   | 15     | Persegue jogador | Octaedro vermelho |
| **Heavy** | 3          | 3   | 30     | Movimento lento  | Cubo cinza        |

### 🎮 **Componentes Principais**

#### **Enemy.tsx**

- Renderiza inimigo individual
- Movimento baseado no tipo
- Auto-destruição quando sai da tela
- Sistema de pontuação

#### **EnemyManager.tsx**

- Controla spawn de inimigos
- Dificuldade progressiva baseada no score
- Diferentes intervalos para cada tipo:
  - Basic: 1-3 segundos
  - Fast: 2-5 segundos
  - Heavy: 5-12 segundos (só após 50 pontos)

#### **GameUI.tsx**

- Tela inicial com instruções
- HUD em tempo real (score, contagem de inimigos)
- Botão de reiniciar

## ⚔️ Sistema de Combate

### **Detecção de Colisão**

```typescript
// Colisão por distância simples
const distance = projectilePos.distanceTo(enemyPos);
if (distance < collisionDistance) {
  // Colisão detectada!
  removeProjectile(projectile.id);
  removeEnemy(enemy.id);
  addScore(points);
}
```

### **Pontuação Dinâmica**

- **Basic Enemy**: 10 pontos
- **Fast Enemy**: 15 pontos
- **Heavy Enemy**: 30 pontos

## 🎚️ Sistema de Dificuldade

### **Dificuldade Progressiva**

```typescript
// Intervalo diminui conforme o score aumenta
const baseDifficulty = Math.max(0.5, 1 - score * 0.001);
```

### **Padrões de Spawn**

- **Basic**: Aparece em qualquer lugar da tela superior
- **Fast**: Aparece nas laterais, persegue o jogador
- **Heavy**: Aparece no centro, movimento lento mas resistente

## 🎯 Fluxo de Jogo

1. **Tela Inicial**: Instruções e botão "INICIAR JOGO"
2. **Gameplay**:
   - Inimigos aparecem automaticamente
   - Player atira para destruir
   - Score aumenta por inimigo destruído
   - Dificuldade aumenta progressivamente
3. **HUD**: Score e contagem em tempo real
4. **Reiniciar**: Botão para resetar o jogo

## 🔧 Configurações Técnicas

### **Performance**

- ✅ Zustand para estado global reativo
- ✅ Remoção automática de inimigos fora da tela
- ✅ IDs únicos para cada inimigo
- ✅ Detecção de colisão otimizada

### **Responsividade**

- ✅ Spawn baseado no viewport da câmera
- ✅ Posicionamento dinâmico
- ✅ Escalonamento automático

### **Modularidade**

- ✅ Componentes separados e reutilizáveis
- ✅ Estado centralizado e previsível
- ✅ Fácil adição de novos tipos de inimigos

## 🚀 Próximas Expansões Possíveis

### **Novos Tipos de Inimigos**

```typescript
// Exemplo de inimigo que atira
interface ShooterEnemy {
  type: 'shooter';
  fireRate: number;
  projectileSpeed: number;
}
```

### **Power-ups**

- Tiro duplo
- Escudo temporário
- Velocidade aumentada

### **Chefes (Boss Enemies)**

- HP alto
- Padrões de movimento complexos
- Múltiplas fases

### **Ondas de Inimigos**

```typescript
// Sistema de waves
interface Wave {
  waveNumber: number;
  enemyTypes: EnemyType[];
  spawnPattern: SpawnPattern;
}
```

## 📊 Status Atual

✅ **Completado:**

- Sistema de estado global
- 3 tipos de inimigos
- Detecção de colisão
- Sistema de pontuação
- UI completa
- Dificuldade progressiva

🔄 **Próximo:**

- Melhorar detecção de colisão (bounding boxes)
- Adicionar efeitos visuais de explosão
- Sistema de vidas do jogador
- Inimigos que atiram de volta

---

**Sistema robusto, escalável e pronto para expansão!** 🎮✨
