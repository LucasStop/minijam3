# 🎯 Sistema de Controle Híbrido: Movimento + Rotação + Tiro

## 📋 Visão Geral

Sistema de controle híbrido que combina:

- **Movimento cartesiano 2D** (WASD)
- **Rotação baseada no mouse** (nave "olha" para o cursor)
- **Tiro frontal** (sempre para frente da nave)

## 🎮 Controles Finais

### **Movimento**

- **W/A/S/D**: Movimento direto da nave nas direções X/Y
- **SPACE**: Acelerar na direção atual
- **CTRL**: Desacelerar/frear

### **Orientação e Combate**

- **Mouse**: Rotacionar nave para "olhar" o cursor
- **Clique Esquerdo**: Atirar para frente da nave

## ⚙️ Implementação Técnica

### **1. Sistema de Orientação com Mouse**

```typescript
// Fazer a nave "olhar" na direção do mouse
useFrame(() => {
  raycaster.setFromCamera(pointer, camera);
  raycaster.ray.intersectPlane(aimingPlane, aimTarget);

  const lookDirection = aimTarget
    .clone()
    .sub(meshRef.current.position)
    .normalize();
  const angle = Math.atan2(lookDirection.x, -lookDirection.y);
  meshRef.current.rotation.z = angle;
});
```

### **2. Tiro Frontal**

```typescript
const handleShoot = () => {
  // Direção sempre para frente da nave (Z negativo rotacionado)
  const shootDirection = new THREE.Vector3(0, 0, -1);
  shootDirection.applyQuaternion(meshRef.current.quaternion);

  const shootPosition = playerPosition
    .clone()
    .add(shootDirection.multiplyScalar(1.2));
  onShoot(shootPosition, shootDirection);
};
```

### **3. Mira Visual de Direção (`AimingReticle`)**

```typescript
// Mostra onde a nave está apontando (não onde o mouse está)
useFrame(() => {
  const forwardDirection = new THREE.Vector3(0, 0, -1);
  forwardDirection.applyQuaternion(playerRef.current.quaternion);

  const aimPosition = playerPosition
    .clone()
    .add(forwardDirection.multiplyScalar(5));
  reticleRef.current.position.copy(aimPosition);
});
```

## 🎯 Funcionalidades

### **Controle Híbrido**

- ✅ **Movimento independente**: WASD move a posição, mouse rotaciona
- ✅ **Rotação suave**: Nave sempre "olha" para o cursor
- ✅ **Tiro consistente**: Sempre sai para frente da nave
- ✅ **Separação lógica**: Movimento, orientação e tiro são independentes

### **Sistema de Orientação**

- ✅ **Raycasting preciso**: Converte posição 2D do mouse para 3D
- ✅ **Rotação automática**: Nave rotaciona automaticamente
- ✅ **Cálculo de ângulo**: `Math.atan2` para rotação precisa
- ✅ **Plano de intersecção**: Z=0 para precisão 2D

### **Mira Visual**

- ✅ **Indicador de direção**: Mostra onde a nave vai atirar
- ✅ **Posicionamento dinâmico**: 5 unidades à frente da nave
- ✅ **Feedback visual**: Reticle vermelho semitransparente
- ✅ **Atualização em tempo real**: Segue a orientação da nave

## 🔧 Parâmetros Configuráveis

```typescript
// Combate
const shootCooldown = 200; // ms entre tiros
const spawnDistance = 1.2; // Distância de spawn do projétil

// Mira visual
const aimDistance = 5; // Distância da mira à frente da nave
const reticleOpacity = 0.6; // Transparência da mira

// Orientação
const aimingPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Plano Z=0
```

## 🎮 Experiência de Jogo

### **Vantagens do Sistema Híbrido**

1. **Familiar**: WASD para movimento (FPS/RTS)
2. **Intuitivo**: Mouse para apontar (natural)
3. **Consistente**: Tiro sempre para frente (previsível)
4. **Dinâmico**: Pode mover e rotacionar simultaneamente
5. **Preciso**: Combinação de movimento livre + mira direcionada

### **Mecânica de Jogo**

- **Kiting**: Mova-se com WASD, aponte com mouse
- **Tracking**: Nave segue o cursor automaticamente
- **Tiro tático**: Sempre sabe onde vai acertar
- **Controle duplo**: Movimento independente da orientação

## 📊 Comparação com Sistemas Anteriores

### **Sistema Anterior (Mira Livre)**

- Tiro em qualquer direção (mouse)
- Direção baseada na posição do mouse
- Mira visual no cursor
- Liberdade total de direção

### **Sistema Atual (Híbrido)**

- Nave rotaciona para o mouse
- Tiro sempre para frente da nave
- Mira visual na direção da nave
- Movimento cartesiano + orientação automática

## 🚀 Resultado Final

O sistema híbrido oferece:

- **Movimento fluido** com controles cartesianos 2D (WASD)
- **Orientação intuitiva** com rotação automática para o mouse
- **Tiro consistente** sempre para frente da nave
- **Feedback visual** claro da direção de tiro
- **Controles familiares** e logicamente separados

Este sistema combina o melhor dos dois mundos: movimento livre (arcade) com orientação direcionada (simulação), criando uma experiência única e intuitiva!
