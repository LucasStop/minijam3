# 🚀 Física Newtoniana Implementada

## 📋 Resumo das Melhorias

O sistema de movimento da nave foi completamente refatorado para seguir as **Leis de Newton**, proporcionando uma experiência mais realista e imersiva.

## ⚖️ As Três Leis de Newton Implementadas

### 1️⃣ **Lei da Inércia** (Primeira Lei)
> *"Um objeto em movimento permanece em movimento, a menos que uma força externa atue sobre ele"*

**Implementação:**
- A nave **não para instantaneamente** quando você solta as teclas
- Ela continua se movendo com a velocidade adquirida (inércia real)
- Para parar, você deve aplicar força contrária (usar retropropulsores)

**No código:**
```typescript
// Velocidade se acumula ao longo do tempo
velocity.current.add(acceleration.multiplyScalar(delta));
```

### 2️⃣ **Princípio Fundamental** (Segunda Lei)
> *"F = m × a" (Força = massa × aceleração)*

**Implementação:**
- **Massa da nave**: `1.2 kg` (configurável)
- **Força dos propulsores**: `18.0 N` (configurável)
- Aceleração = Força ÷ Massa

**No código:**
```typescript
const acceleration = force.current.clone().divideScalar(mass);
```

**Experimente:**
- Aumente `mass` para `3.0` → nave mais pesada e lenta
- Aumente `thrust` para `25.0` → nave mais potente

### 3️⃣ **Lei da Ação e Reação** (Terceira Lei)
> *"Para toda ação, há uma reação igual e oposta"*

**Implementação:**
- **Coice do tiro**: Removido para melhor controle de gameplay
- **Foco no gameplay**: Prioriza a precisão de mira e controle da nave
- **Física aplicada**: Mantida nas colisões e movimentação principal

**Decisão de Design:**
```typescript
// Sistema de tiro sem recoil para melhor jogabilidade
onShoot(shootPosition, shootDirection);
// Sem aplicar força de reação na nave
```

## 🎮 Controles Físicos

| Tecla | Ação | Efeito Físico |
|-------|------|---------------|
| **W** | Propulsor Principal | Força para frente (-Z) |
| **S** | Retropropulsores | Força para trás (+Z) |
| **A** | Propulsores Laterais | Força para esquerda (-X) |
| **D** | Propulsores Laterais | Força para direita (+X) |
| **Space** | Disparar | Sem efeito na nave |

## ⚙️ Configurações Físicas

### Constantes Principais
```typescript
const mass = 1.2;        // Massa da nave (kg)
const thrust = 18.0;     // Força dos propulsores (N)
const damping = 0.985;   // Atrito espacial (0.98-1.0)
```

### Modo Realismo vs Arcade

**Física Pura** (`damping = 1.0`):
- ✅ Totalmente realista
- ❌ Difícil de controlar
- A nave nunca para sozinha

**Modo Arcade** (`damping = 0.985`):
- ✅ Fácil de controlar
- ✅ Ainda tem inércia
- ✅ Para gradualmente sem input

## 🔧 Recursos Avançados

### Colisões Físicas
- **Bordas da tela**: Funcionam como paredes sólidas
- **Conservação de velocidade**: Velocidade é zerada apenas no eixo de colisão
- **Ricochete realista**: A nave "bate" nas bordas fisicamente

### Rotação Dinâmica (Banking)
- **Inclinação lateral**: Proporcional à velocidade horizontal
- **Inclinação frontal**: Proporcional à velocidade vertical
- **Interpolação suave**: Transições naturais

### Efeito Warp nas Estrelas
- **Velocidade responsiva**: Estrelas aceleram baseado na velocidade real da nave
- **Dispersão em alta velocidade**: Efeito visual de "salto para hiper-espaço"

## 🎯 Próximos Passos

1. **Combustível**: Sistema de energia limitada para propulsores
2. **Diferentes naves**: Massas e forças variadas
3. **Upgrades**: Melhorar propulsores e reduzir massa
4. **Colisões**: Física de impacto com inimigos e asteroides
5. **Gravidade**: Campos gravitacionais de planetas

## 🧪 Experimentação

Tente modificar as constantes para sentir as diferenças:

```typescript
// Nave pesada como um cargueiro
const mass = 3.0;
const thrust = 15.0;

// Nave ágil como um caça
const mass = 0.8;
const thrust = 22.0;

// Física pura (sem atrito)
const damping = 1.0;

// Muito atrito (mais arcade)
const damping = 0.95;
```

---

**Resultado:** Uma experiência de voo espacial autêntica que obedece às leis da física! 🌌
