# 🚀 Space Fighter

Um jogo de nave espacial desenvolvido em **React** + **Next.js** + **Three.js** com gráficos 3D, física realista e gameplay dinâmico.

![Space Fighter](https://img.shields.io/badge/Status-Em%20Desenvolvimento-green)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![React](https://img.shields.io/badge/React-19-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.177.0-orange)

## 📖 Sobre o Projeto

**Space Fighter** é um jogo de tiro espacial onde você controla uma nave espacial avançada enfrentando ondas infinitas de inimigos alienígenas. O jogo apresenta:

- 🎮 **Movimento 2D Cartesiano** com física realista
- 🎯 **Sistema de mira livre** com mouse
- 👾 **Múltiplos tipos de inimigos** com IA diferenciada
- 💥 **Sistema de colisão avançado** com hitboxes precisas
- 🌟 **Efeitos visuais dinâmicos** com partículas e estrelas
- 🔊 **Audio espacial** com efeitos sonoros
- 📊 **Sistema de estatísticas** e debug em tempo real

## 🎮 Como Jogar

### Controles

| Tecla/Ação | Função |
|------------|--------|
| **W** | Mover para cima |
| **A** | Mover para esquerda |
| **S** | Mover para baixo |
| **D** | Mover para direita |
| **SPACE** | Acelerar |
| **CTRL** | Desacelerar/Frear |
| **Mouse** | Mirar |
| **Clique Esquerdo** | Atirar |
| **Clique em Inimigo** | Tiro direcionado |

### Objetivo

- Destrua o máximo de inimigos possível
- Evite colisões para manter sua vida (100 HP)
- Sobreviva às ondas progressivamente mais difíceis
- Alcance a maior pontuação possível

### Tipos de Inimigos

- 🟢 **Básicos**: Movimento reto, 10 pontos
- 🔵 **Rápidos**: Perseguem o jogador, 15 pontos  
- 🔴 **Pesados**: Resistentes e lentos, 25 pontos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15.2.4** - Framework React
- **React 19** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização

### 3D e Gráficos
- **Three.js 0.177.0** - Engine 3D
- **@react-three/fiber** - Wrapper React para Three.js
- **@react-three/drei** - Utilitários para React Three Fiber

### Estado e Audio
- **Zustand** - Gerenciamento de estado
- **Custom Sound Manager** - Sistema de áudio

### UI/UX
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **Tailwind Animate** - Animações

## 📁 Estrutura do Projeto

```
minijam3/
├── app/                    # App Router do Next.js
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── game/             # Componentes do jogo
│   │   ├── game.tsx      # Componente principal do jogo
│   │   ├── scene.tsx     # Cena 3D principal
│   │   ├── player.tsx    # Lógica do jogador
│   │   ├── enemy.tsx     # Componente de inimigo
│   │   ├── projectile.tsx # Sistema de projéteis
│   │   ├── enemy-spawner.tsx # Gerador de inimigos
│   │   ├── stars.tsx     # Campo de estrelas
│   │   └── ...           # Outros componentes
│   ├── ui/               # Interface do usuário
│   │   └── game-ui.tsx   # HUD e menus
│   ├── menu.tsx          # Menu principal
│   └── about.tsx         # Tela sobre
├── stores/               # Gerenciamento de estado
│   └── gameStore.ts      # Store principal do jogo
├── lib/                  # Utilitários
│   ├── soundManager.ts   # Gerenciador de áudio
│   └── utils.ts          # Funções utilitárias
├── public/               # Assets públicos
│   ├── img/             # Texturas e imagens
│   └── sounds/          # Efeitos sonoros
└── styles/              # Estilos globais
```

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** 18+ 
- **npm** ou **yarn**

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd minijam3
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Execute o projeto**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. **Acesse no navegador**
   ```
   http://localhost:3000
   ```

### Scripts Disponíveis

```bash
npm run dev        # Executa em modo desenvolvimento
npm run build      # Gera build de produção
npm run start      # Executa build de produção
npm run lint       # Executa linting
npm run format     # Formata código com Prettier
npm run type-check # Verifica tipos TypeScript
```

## ⚙️ Funcionalidades Técnicas

### Sistema de Física
- Movimento suave com aceleração e desaceleração
- Limitação de velocidade máxima
- Damping para parada gradual
- Efeito de inclinação baseado na velocidade

### Sistema de Colisão
- Hitboxes circulares e retangulares
- Detecção otimizada para performance
- Sistema de invencibilidade temporária
- Debug visual das hitboxes

### Sistema de Spawn de Inimigos
- Diferentes padrões de spawn por onda
- Dificuldade progressiva baseada na pontuação
- Spawn coordenado e formações táticas
- Limpeza automática de inimigos fora da tela

### Sistema de Audio
- Efeitos sonoros para ações
- Controle de volume independente
- Feedback audível para eventos do jogo

### Sistema de Debug
- Painel de debug em tempo real
- Visualização de hitboxes
- Estatísticas de colisão
- Informações de performance

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Power-ups e melhorias da nave
- [ ] Boss battles
- [ ] Multiplayer local
- [ ] Sistema de conquistas
- [ ] Leaderboard online
- [ ] Diferentes tipos de armas
- [ ] Modos de jogo alternativos

### Melhorias Técnicas
- [ ] Otimização de performance
- [ ] Sistema de partículas avançado
- [ ] Efeitos visuais aprimorados
- [ ] Sistema de save/load
- [ ] Configurações de gameplay

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- **Three.js community** pela incrível engine 3D
- **React Three Fiber** pelo wrapper React fantástico
- **Next.js team** pelo framework excepcional
- **Freesound** pelos efeitos sonoros

---

**Desenvolvido com ❤️ usando React, Next.js e Three.js**

🎮 **Divirta-se jogando Space Fighter!**
