'use client';

// Sistema de sons do jogo
export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  constructor() {
    // Carregar sons básicos
    this.loadSound('shot', '/sounds/mini_shot.mp3');
    this.loadSound('targetLock', '/sounds/mini_shots.mp3'); // Som de mira em inimigo
    this.loadSound('death', '/sounds/death.mp3');    this.loadSound('damage', '/sounds/mini_shot.mp3'); // Som de dano (reutilizar)
    this.loadSound('score', '/sounds/mini_shots.mp3'); // Som de pontuação (reutilizar)
    // this.loadSound('start', '/sounds/sequencia.mp3'); 
  }

  private loadSound(name: string, path: string) {
    try {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = 0.3; // Volume padrão baixo
      this.sounds.set(name, audio);
    } catch (error) {
      console.warn(`Erro ao carregar som ${name}:`, error);
    }
  }

  play(soundName: string, volume: number = 0.3) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      try {
        sound.currentTime = 0; // Resetar para início
        sound.volume = Math.min(volume, 1.0);
        sound.play().catch(err => {
          console.warn(`Erro ao reproduzir som ${soundName}:`, err);
        });
      } catch (error) {
        console.warn(`Erro ao reproduzir som ${soundName}:`, error);
      }
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(soundName: string, volume: number) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.volume = Math.min(volume, 1.0);
    }
  }
}

// Instância singleton para uso global
export const soundManager = new SoundManager();
