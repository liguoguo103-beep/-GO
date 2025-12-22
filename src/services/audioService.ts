
import { IngredientType } from '../types';

// A simple synthesizer service to play BGM without external assets
class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentOscillators: OscillatorNode[] = [];
  private currentGain: GainNode | null = null;
  private intervalId: number | null = null;
  private currentTrack: 'MENU' | 'GAME' | 'GAMEOVER' | null = null;

  // Ambient Grill Sounds
  private grillSource: AudioBufferSourceNode | null = null;
  private grillGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop(); // Stops music and grill
    } else if (this.currentTrack) {
      this.play(this.currentTrack);
    }
    return this.isMuted;
  }

  stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.currentOscillators = [];
    
    // Stop ambient grill noise
    this.stopGrillAmbience();
  }

  // --- Grill Ambience Synthesis ---
  
  private startGrillAmbience() {
    if (!this.ctx || this.isMuted) return;
    this.stopGrillAmbience(); // Stop existing if any

    // Generate 2 seconds of Brown Noise (simulates fire rumble)
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Integrate to get brown noise (-ish)
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        // Compensate gain
        data[i] *= 3.5; 
    }

    this.grillSource = this.ctx.createBufferSource();
    this.grillSource.buffer = buffer;
    this.grillSource.loop = true;

    // Lowpass filter to make it sound like a deep rumble/hum
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    this.grillGain = this.ctx.createGain();
    this.grillGain.gain.value = 0.25; // Ambient volume level

    this.grillSource.connect(filter);
    filter.connect(this.grillGain);
    this.grillGain.connect(this.ctx.destination);

    this.grillSource.start();
  }

  private stopGrillAmbience() {
      if (this.grillSource) {
          try { this.grillSource.stop(); } catch(e) {}
          this.grillSource = null;
      }
      if (this.grillGain) {
          try { this.grillGain.disconnect(); } catch(e) {}
          this.grillGain = null;
      }
  }

  private playCrackle() {
      if (!this.ctx || this.isMuted) return;
      
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Simulate a snap/pop
      osc.type = 'square';
      osc.frequency.setValueAtTime(Math.random() * 200 + 100, t);
      
      filter.type = 'bandpass';
      filter.frequency.value = Math.random() * 1000 + 1000;
      filter.Q.value = 1;

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05); // Short decay

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
  }

  // --- Music & Sound Effects ---

  private playNote(freq: number, type: OscillatorType, duration: number, volume: number) {
    if (!this.ctx || this.isMuted) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playFrequencyRamp(type: OscillatorType, startFreq: number, endFreq: number, duration: number, volume: number) {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(0.01, endFreq), this.ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playDamage() {
    if (!this.ctx || this.isMuted) return;
    this.playNote(100, 'sawtooth', 0.1, 0.2);
    this.playNote(80, 'square', 0.2, 0.2);
  }

  playEnemyDeath() {
    if (!this.ctx || this.isMuted) return;
    // Squish sound
    this.playFrequencyRamp('sawtooth', 300, 50, 0.1, 0.1);
  }

  playReflect() {
    if (!this.ctx || this.isMuted) return;
    // Metallic clink
    this.playFrequencyRamp('square', 800, 1200, 0.1, 0.05);
  }

  playAutoUpgrade() {
    if (!this.ctx || this.isMuted) return;
    // Ascending arpeggio / power up sound
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
    
    notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.1, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.1);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.1);
    });
  }

  playSkillUnlock() {
    if (!this.ctx || this.isMuted) return;
    // Magical chime (High pitch sine waves)
    // E6 -> G#6 (Major third interval)
    this.playNote(1318.51, 'sine', 0.1, 0.1); 
    setTimeout(() => {
        this.playNote(1661.22, 'sine', 0.3, 0.1);
    }, 100);
  }

  playAttack(type: IngredientType) {
    if (!this.ctx || this.isMuted) return;

    switch (type) {
      case IngredientType.CHILI:
        // High pitch "Pew"
        this.playFrequencyRamp('square', 800, 300, 0.1, 0.05);
        break;
      case IngredientType.KING_CHILI:
        this.playFrequencyRamp('sawtooth', 900, 400, 0.1, 0.06);
        break;
      case IngredientType.GOD_CHILI:
        this.playFrequencyRamp('sawtooth', 1200, 200, 0.08, 0.08); // Electriczap
        break;

      case IngredientType.BEEF:
        // Low pitch "Thump"
        this.playFrequencyRamp('triangle', 150, 50, 0.15, 0.1);
        break;
      case IngredientType.KING_BEEF:
        this.playFrequencyRamp('square', 120, 40, 0.15, 0.12);
        break;
      case IngredientType.GOD_BEEF:
        // Deep explosion sound
        this.playFrequencyRamp('sawtooth', 100, 20, 0.3, 0.15); 
        break;

      case IngredientType.CORN:
        this.playFrequencyRamp('sine', 600, 800, 0.05, 0.05);
        break;
      case IngredientType.SAUSAGE:
        this.playFrequencyRamp('sawtooth', 800, 100, 0.2, 0.05);
        break;
      case IngredientType.MUSHROOM:
        this.playFrequencyRamp('sawtooth', 100, 300, 0.2, 0.05);
        break;
      case IngredientType.SHRIMP:
        this.playFrequencyRamp('triangle', 300, 500, 0.15, 0.05);
        break;
      case IngredientType.SQUID:
        this.playFrequencyRamp('square', 200, 100, 0.1, 0.05);
        break;
      case IngredientType.PINEAPPLE:
        this.playNote(1200, 'sine', 0.1, 0.05);
        this.playNote(1600, 'sine', 0.1, 0.05);
        break;
      case IngredientType.MARSHMALLOW:
        this.playFrequencyRamp('sine', 400, 600, 0.3, 0.05);
        break;
      default:
        this.playFrequencyRamp('triangle', 300, 200, 0.1, 0.05);
        break;
    }
  }

  play(track: 'MENU' | 'GAME' | 'GAMEOVER') {
    if (this.isMuted) {
      this.currentTrack = track;
      return;
    }
    
    if (this.currentTrack !== track) {
      this.stop();
    } else if (this.intervalId) {
      return;
    }

    this.currentTrack = track;
    this.init();

    if (track === 'MENU') {
      this.playMenuMusic();
    } else if (track === 'GAME') {
      this.playGameMusic();
    } else if (track === 'GAMEOVER') {
      this.playGameOverMusic();
    }
  }

  private playMenuMusic() {
    let step = 0;
    const notes = [261.63, 329.63, 392.00, 493.88]; 
    const bass = [130.81, 196.00];
    
    this.intervalId = window.setInterval(() => {
      if (step % 2 === 0) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        this.playNote(note, 'sine', 0.5, 0.1);
      }
      if (step % 4 === 0) {
        const b = bass[Math.floor(Math.random() * bass.length)];
        this.playNote(b, 'triangle', 1.0, 0.1);
      }
      step++;
    }, 400);
  }

  private playGameMusic() {
    // Start the fire/grill background noise
    this.startGrillAmbience();

    let step = 0;
    const scale = [220, 261.63, 293.66, 329.63, 392.00, 440]; 
    
    this.intervalId = window.setInterval(() => {
      if (step % 4 === 0) {
         this.playNote(110, 'square', 0.2, 0.05);
      }
      const note = scale[step % scale.length];
      if (Math.random() > 0.2) {
        this.playNote(note * (Math.random() > 0.8 ? 2 : 1), 'triangle', 0.1, 0.08);
      }

      // Random Crackling Sound (20% chance per beat)
      if (Math.random() < 0.2) {
         this.playCrackle();
      }

      step++;
    }, 150);
  }

  private playGameOverMusic() {
    let step = 0;
    this.intervalId = window.setInterval(() => {
       const freq = 440 - (step * 20);
       if (freq > 50) {
         this.playNote(freq, 'sawtooth', 0.5, 0.1);
       } else {
         this.stop();
       }
       step++;
    }, 600);
  }
}

export const audioService = new AudioService();
