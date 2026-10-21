// ─── Sonido del carrete (WebAudio generado, sin ficheros externos) ───────────
// Apagado por defecto: solo suena si el usuario lo activa. Todo está envuelto en try/catch porque
// AudioContext puede no existir o estar bloqueado hasta que haya un gesto del usuario.

type AudioCtor = typeof AudioContext;

let ctx: AudioContext | null = null;
let lastTick = 0;

function getContext(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const Ctor: AudioCtor | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Llamar desde un gesto del usuario (clic) para poder reproducir después. */
export function unlockAudio(): void {
  const audio = getContext();
  if (audio && audio.state === 'suspended') void audio.resume().catch(() => undefined);
}

function blip(frequency: number, duration: number, volume: number, type: OscillatorType, delay = 0): void {
  const audio = getContext();
  if (!audio || audio.state !== 'running') return;
  try {
    const start = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  } catch {
    /* sin audio */
  }
}

/** "Tic" corto al pasar una carta bajo la aguja (limitado a ~1 cada 28 ms). */
export function playTick(): void {
  const now = performance.now();
  if (now - lastTick < 28) return;
  lastTick = now;
  blip(1180, 0.045, 0.05, 'square');
}

/** Acorde ascendente al revelar el premio; `tier` 0 (normal) a 2 (mítico). */
export function playWin(tier: 0 | 1 | 2): void {
  const notes = tier === 2 ? [523, 659, 784, 1047, 1319] : tier === 1 ? [523, 659, 784] : [523, 659];
  notes.forEach((note, i) => blip(note, 0.32, 0.06, 'triangle', i * 0.09));
}
