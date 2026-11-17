// Procedural Web Audio — no audio files needed.
export class Sfx {
  constructor() { this.ctx = null; this.enabled = true; }
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const c = this.ctx = new AC();
    this.master = c.createGain(); this.master.gain.value = 0.55; this.master.connect(c.destination);
    // shared noise buffer
    const len = c.sampleRate * 2; const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
    // engine: two detuned saws + filtered noise
    this.engGain = c.createGain(); this.engGain.gain.value = 0; this.engGain.connect(this.master);
    this.engFilter = c.createBiquadFilter(); this.engFilter.type = 'lowpass'; this.engFilter.frequency.value = 400; this.engFilter.connect(this.engGain);
    this.osc1 = c.createOscillator(); this.osc1.type = 'sawtooth'; this.osc2 = c.createOscillator(); this.osc2.type = 'sawtooth'; this.osc2.detune.value = 18;
    const og = c.createGain(); og.gain.value = 0.11; this.osc1.connect(og); this.osc2.connect(og); og.connect(this.engFilter);
    this.osc1.start(); this.osc2.start();
    const n = c.createBufferSource(); n.buffer = buf; n.loop = true;
    this.jetF = c.createBiquadFilter(); this.jetF.type = 'bandpass'; this.jetF.frequency.value = 900; this.jetF.Q.value = 0.6;
    this.jetG = c.createGain(); this.jetG.gain.value = 0.35; n.connect(this.jetF); this.jetF.connect(this.jetG); this.jetG.connect(this.engGain); n.start();
    // lock-warning beeper
    this.warnG = c.createGain(); this.warnG.gain.value = 0; this.warnG.connect(this.master);
    this.warnO = c.createOscillator(); this.warnO.type = 'square'; this.warnO.frequency.value = 1150; this.warnO.connect(this.warnG); this.warnO.start();
  }
  setEnabled(on) { this.enabled = on; if (this.master) this.master.gain.setTargetAtTime(on ? 0.55 : 0, this.ctx.currentTime, 0.05); }
  engine(throttle, boost, active) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, f = 55 + throttle * 70 + (boost ? 40 : 0);
    this.osc1.frequency.setTargetAtTime(f, t, 0.15); this.osc2.frequency.setTargetAtTime(f * 1.5, t, 0.15);
    this.engFilter.frequency.setTargetAtTime(300 + throttle * 900 + (boost ? 1400 : 0), t, 0.2);
    this.jetF.frequency.setTargetAtTime(600 + throttle * 1400 + (boost ? 1500 : 0), t, 0.2);
    this.engGain.gain.setTargetAtTime(active ? 0.22 + throttle * 0.25 + (boost ? 0.18 : 0) : 0, t, 0.25);
  }
  warning(mode, time) { // 0 none, 1 tracked (slow beeps), 2 missile incoming (fast)
    if (!this.ctx) return;
    const on = mode === 1 ? (time % 0.6) < 0.25 : mode === 2 ? (time % 0.16) < 0.08 : false;
    this.warnG.gain.setTargetAtTime(on ? 0.07 : 0, this.ctx.currentTime, 0.005);
  }
  tone(freq, dur, type = 'square', vol = 0.12, slide = 0) {
    if (!this.ctx || !this.enabled) return;
    const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }
  burst(dur, f0, f1, vol, type = 'lowpass', q = 1) {
    if (!this.ctx || !this.enabled) return;
    const c = this.ctx, t = c.currentTime, s = c.createBufferSource(); s.buffer = this.noise;
    const fl = c.createBiquadFilter(); fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(this.master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  gun() { this.burst(0.07, 2600, 500, 0.22, 'bandpass', 1.2); this.tone(140, 0.05, 'square', 0.05, -60); }
  enemyGun(vol) { this.burst(0.06, 1800, 400, 0.12 * vol, 'bandpass', 1.5); }
  missile() { this.burst(1.1, 800, 3000, 0.25, 'bandpass', 0.8); this.tone(220, 0.5, 'sawtooth', 0.05, 500); }
  explosion(vol = 1) { this.burst(1.6, 1200, 60, 0.6 * vol, 'lowpass', 0.7); this.tone(70, 0.8, 'sine', 0.35 * vol, -40); }
  hit() { this.burst(0.06, 4000, 1500, 0.12, 'highpass', 1); }
  hurt() { this.burst(0.18, 900, 200, 0.3, 'lowpass', 2); this.tone(90, 0.15, 'square', 0.08, -30); }
  lockTick() { this.tone(1500, 0.04, 'sine', 0.05); }
  locked() { this.tone(1900, 0.5, 'sine', 0.07); }
  boost() { this.burst(0.8, 300, 2500, 0.3, 'bandpass', 0.7); }
  ui() { this.tone(880, 0.06, 'triangle', 0.08); }
  overheat() { this.tone(300, 0.25, 'square', 0.07, -150); }
  wave() { this.tone(523, 0.15, 'triangle', 0.1); setTimeout(() => this.tone(784, 0.25, 'triangle', 0.1), 140); }
}
