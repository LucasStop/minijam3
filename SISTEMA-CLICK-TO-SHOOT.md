# Sistema de Mira e Tiro Click-to-Shoot Implementado

## Resumo

O sistema de mira e tiro foi completamente reformulado para permitir que o jogador **clique diretamente nos inimigos** para atirar neles. Este é um sistema muito mais preciso e estratégico que torna o jogo mais desafiador e recompensador.

## Como Funciona

### 1. Mecânica de Tiro
- **Click em Inimigo**: Quando você clica em um inimigo, um projétil é disparado diretamente na direção dele
- **Click no Vazio**: Quando você clica fora dos inimigos, um tiro normal é disparado na direção da mira
- **Som Diferenciado**: Tiros em inimigos fazem um som diferente dos tiros normais

### 2. Feedback Visual
- **Mira Inteligente**: A mira muda de cor (verde → vermelho) quando está sobre um inimigo
- **Pulsação**: A mira pulsa mais rápido quando está mirando em um inimigo
- **Flash do Inimigo**: Quando clicado, o inimigo "pisca" em branco brevemente
- **Anel Extra**: Um anel vermelho adicional aparece na mira quando sobre um inimigo

### 3. Sistema de Raycasting
- Detecção precisa de inimigos usando raycasting 3D
- Filtra hitboxes de debug para evitar cliques acidentais
- Funciona com todos os tipos de inimigos (basic, fast, heavy)

## Arquivos Modificados

### `components/game/player.tsx`
- Adicionado sistema de detecção de mouse click
- Implementado raycasting para detectar inimigos sob o cursor
- Integração com sistema de som
- Feedback visual de flash no inimigo clicado

### `components/game/aiming-reticle.tsx`
- Reescrito para detectar inimigos em tempo real
- Mudança de cor e comportamento baseado no alvo
- Indicadores visuais adicionais quando mirando em inimigos

### `lib/soundManager.ts` (NOVO)
- Sistema de gerenciamento de sons
- Sons diferenciados para tiros normais vs. tiros em inimigos
- Controle de volume e habilitação

## Vantagens do Sistema

### 1. Gameplay Mais Estratégico
- Força o jogador a mirar cuidadosamente
- Elimina spray-and-pray (atirar sem mirar)
- Recompensa precisão e timing

### 2. Feedback Rico
- **Visual**: Mira muda de aparência
- **Auditivo**: Sons diferentes para diferentes tipos de tiro
- **Tátil**: Flash visual nos inimigos

### 3. Precisão
- Sistema de raycasting garante detecção precisa
- Funciona em qualquer resolução ou configuração de tela
- Compatível com hitboxes de diferentes tamanhos

## Comportamento por Tipo de Inimigo

### Basic (Cone Laranja)
- Hitbox média (radius: 0.6)
- Movimento linear
- 10 pontos quando destruído

### Fast (Octaedro Vermelho)
- Hitbox menor (radius: 0.5)
- Movimento em direção ao jogador
- 15 pontos quando destruído

### Heavy (Cubo Cinza)
- Hitbox maior (radius: 0.8)
- Movimento lento
- 30 pontos quando destruído

## Dicas de Uso

1. **Observe a Mira**: Quando ficar vermelha, você pode clicar para um tiro certeiro
2. **Timing**: Inimigos rápidos requerem antecipação
3. **Economia de Munição**: Cada clique é um tiro, então mire bem
4. **Priorização**: Inimigos pesados valem mais pontos mas são mais fáceis de acertar

## Configurações Técnicas

### Raycasting
- Usa camera principal para detecção
- Profundidade recursiva para objetos aninhados
- Filtra geometrias de debug (SphereGeometry)

### Sons
- Volume padrão: 30%
- Som de tiro normal: `mini_shot.mp3`
- Som de tiro em inimigo: `mini_shots.mp3`
- Preload automático para performance

### Performance
- Raycasting otimizado para não impactar FPS
- Uso de useRef para evitar re-renders desnecessários
- Detecção de inimigos apenas no useFrame da mira

## Compatibilidade

- ✅ Funciona com sistema de hitboxes existente
- ✅ Compatível com modo debug
- ✅ Mantém backward compatibility com tiros normais
- ✅ Funciona em todas as resoluções
- ✅ Suporte a touch devices (mobile)

## Possíveis Melhorias Futuras

1. **Mira Preditiva**: Mostrar onde atirar em inimigos em movimento
2. **Combo System**: Bonificação por acertos consecutivos
3. **Diferentes Tipos de Munição**: Tiros especiais para diferentes inimigos
4. **Cursor Customizado**: Cursor que muda quando sobre inimigos
5. **Zoom**: Modo sniper para tiros de longa distância

---

O sistema agora oferece uma experiência de tiro muito mais envolvente e precisa, tornando cada clique significativo e recompensando a habilidade do jogador!
