// Web Audio API Synthesizer - 100% Procedural Audio Engine
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate white/pink noise buffer for gunfire and explosions
  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Gunshot sounds with tailored profiles
  playGunshot(type = 'pistol') {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Noise layer (impact & blast)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();

    const noiseFilter = this.ctx.createBiquadFilter();
    const noiseGain = this.ctx.createGain();

    // Tonal punch layer (oscillator)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    switch (type) {
      case 'pistol':
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1200, now);
        noiseFilter.Q.setValueAtTime(1.5, now);

        noiseGain.gain.setValueAtTime(0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

        oscGain.gain.setValueAtTime(0.7, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + 0.18);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'shotgun':
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(900, now);

        noiseGain.gain.setValueAtTime(1.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

        oscGain.gain.setValueAtTime(1.0, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + 0.35);
        osc.start(now);
        osc.stop(now + 0.25);
        break;

      case 'rifle':
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1600, now);

        noiseGain.gain.setValueAtTime(0.9, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

        oscGain.gain.setValueAtTime(0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + 0.14);
        osc.start(now);
        osc.stop(now + 0.12);
        break;

      case 'sniper':
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1400, now);

        noiseGain.gain.setValueAtTime(1.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.45);

        oscGain.gain.setValueAtTime(1.1, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + 0.55);
        osc.start(now);
        osc.stop(now + 0.45);
        break;

      case 'rpg':
        this.playExplosion();
        break;
    }
  }

  // Metallic shell casing drop
  playShellDrop() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + 0.15;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Reload ratchet & magazine slap
  playReload() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Mag out click
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(300, now);
    osc1.frequency.exponentialRampToValueAtTime(150, now + 0.08);
    g1.gain.setValueAtTime(0.4, now);
    g1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc1.connect(g1);
    g1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Mag in snap
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, now + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.38);
    g2.gain.setValueAtTime(0.5, now + 0.3);
    g2.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
    osc2.connect(g2);
    g2.connect(this.masterGain);
    osc2.start(now + 0.3);
    osc2.stop(now + 0.4);
  }

  // High-satisfaction Headshot bell chime
  playHeadshot() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    const freqs = [1046.5, 1318.5, 1567.98, 2093.0]; // C6 major chord shimmer

    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.02);

      gain.gain.setValueAtTime(0.35, now + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.02);
      osc.stop(now + 0.55);
    });
  }

  // Hit marker blip
  playHitmarker() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Deep booming explosion
  playExplosion() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + 0.8);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.9);
  }

  // Player taking damage
  playDamageAlert() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.2);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }
}

window.soundEngine = new SoundEngine();
