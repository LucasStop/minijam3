# Defensor Galáctico - V0 🚀

## Versão 0: O Voo Livre

A V0 é a implementação mais básica do jogo "Defensor Galáctico", focada exclusivamente na experiência central de voo espacial. Esta versão não possui inimigos, tiros ou sistema de pontuação - apenas o prazer puro de voar pelo espaço.

### ✨ Características da V0

- **Ambiente 3D**: Campo de estrelas infinito renderizado em tempo real
- **Nave Controlável**: Cone azul representando a nave do jogador
- **Câmera Dinâmica**: Terceira pessoa que segue suavemente a nave
- **Controles Simples**: W, A, D para movimento básico

### 🎮 Controles

- **W**: Mover para frente
- **A**: Girar para a esquerda
- **D**: Girar para a direita

### 🏗️ Arquitetura Técnica

A V0 é construída usando:

- **React Three Fiber**: Para renderização 3D
- **@react-three/drei**: Para componentes 3D prontos (Stars)
- **Three.js**: Motor 3D subjacente
- **Next.js**: Framework React

#### Componentes Principais:

1. **Player (`player-v0.tsx`)**: 
   - Geometria cone simples
   - Sistema de controles com hook customizado
   - Física de movimento baseada em delta time

2. **Scene (`scene-v0.tsx`)**:
   - Campo de estrelas 3D
   - Sistema de iluminação
   - Lógica de câmera em terceira pessoa

3. **GameV0 (`game-v0.tsx`)**:
   - Canvas principal do jogo
   - Integração com React

### 🚀 Como Testar

1. Inicie o servidor: `yarn dev`
2. Abra http://localhost:3000
3. Clique em "V0 - VOO LIVRE" no menu principal
4. Use W, A, D para voar pelo espaço!

### 🎯 Próximos Passos (V1)

A V0 serve como base sólida para implementar:
- Sistema de tiro
- Inimigos e colisões
- Interface de usuário (placar, vidas)
- Efeitos visuais e sonoros
- Mecânicas de gameplay avançadas

### 📁 Estrutura de Arquivos V0

```
components/
├── player-v0.tsx    # Nave do jogador com controles
├── scene-v0.tsx     # Cena 3D com estrelas e câmera
└── game-v0.tsx      # Canvas principal do jogo
```

---

**Status**: ✅ Implementado e Funcional  
**Versão**: 0.1.0  
**Data**: Junho 2025
