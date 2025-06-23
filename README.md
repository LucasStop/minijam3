# Defensor Galáctico 🚀💥

Um jogo de tiro espacial em 3D desenvolvido com Next.js, React Three Fiber e TypeScript.

## ✨ Características do Jogo

- **Sistema de Tiro Completo**: Projéteis amarelos brilhantes disparados com a barra de espaço
- **Movimento 3D**: Navegação fluida no espaço com física realista
- **Câmera Dinâmica**: Segue o jogador automaticamente com movimentos suaves
- **Efeitos Visuais**: Campo de estrelas animado e iluminação atmosférica
- **Cooldown de Tiro**: 200ms entre disparos para balanceamento
- **Projéteis Inteligentes**: Limpeza automática após distância máxima
- **Interface Moderna**: Menu elegante e controles intuitivos

## 🎮 Controles

- **W**: Mover para frente
- **A**: Girar para a esquerda  
- **D**: Girar para a direita
- **ESPAÇO**: Atirar projéteis

### 🏗️ Arquitetura Técnica V1

#### Novos Componentes:

1. **Projectile (`projectile-v1.tsx`)**:

   - Geometria esférica amarela emissiva
   - Sistema de movimento baseado em direção e velocidade
   - Auto-destruição por tempo ou distância
2. **Player V1 (`player-v1.tsx`)**:

   - Sistema de controles expandido (inclui espaço)
   - Lógica de tiro com cooldown
   - Cálculo de posição e direção de disparo
3. **Scene V1 (`scene-v1.tsx`)**:

   - Gerenciamento de estado de projéteis
   - Função `handleShoot` para criar novos projéteis
   - Renderização dinâmica de todos os projéteis
4. **Game V1 (`game-v1.tsx`)**:

   - Canvas principal integrado com Scene V1

#### Recursos Técnicos Implementados:

- **Gerenciamento de Estado**: Array de projéteis com React state
- **Sistema de IDs**: Identificação única para cada projétil
- **Vector Math**: Cálculos de direção e posição 3D
- **Performance**: Limpeza automática de objetos desnecessários
- **Props Drilling**: Passagem de funções entre componentes

### 🎯 Como Testar a V1

1. Inicie o servidor: `yarn dev`
2. Abra http://localhost:3000
3. Clique em **"V1 - SISTEMA DE TIRO"** no menu principal
4. Use **W**, **A**, **D** para voar pelo espaço
5. Use **ESPAÇO** para atirar projéteis amarelos!

### 📁 Estrutura de Arquivos V1

```
components/
├── player-v1.tsx       # V1: Nave com sistema de tiro
├── scene-v1.tsx        # V1: Cena com projéteis
├── projectile-v1.tsx   # V1: Projéteis
└── game-v1.tsx         # V1: Jogo com tiro
```

### 🚀 Próximos Passos (V2)

A V1 estabelece o sistema de tiro. Na V2 implementaremos:

- **Inimigos**: Alvos para atirar
- **Sistema de Colisão**: Detectar quando projéteis acertam alvos
- **Pontuação**: Sistema de score e UI
- **Feedback Visual**: Explosões e efeitos

### 🎮 Experiência de Jogo V1

A V1 oferece a sensação satisfatória de voar pelo espaço e atirar projéteis. Os projéteis amarelos brilhantes criam rastros visuais enquanto voam pelo campo de estrelas, estabelecendo a base para o combate espacial que será expandido na V2.

---

**Status**: ✅ Implementado e Funcional
**Versão**: 1.0.0
**Data**: Junho 2025
