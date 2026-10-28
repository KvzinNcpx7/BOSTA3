let context: AudioContext | null = null;
/** Only an explicitly checked sound control unlocks generated Web Audio tones. No external audio. */
export async function unlockSound() {
  try {
    const Constructor = window.AudioContext;
    if (!Constructor) return false;
    context ??= new Constructor();
    await context.resume();
    return context.state === "running";
  } catch {
    return false;
  }
}
export function playSpecialTone(enabled: boolean) {
  if (!enabled || !context || context.state !== "running") return;
  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, start);
    oscillator.frequency.setValueAtTime(660, start + 0.12);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.04, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.42);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  } catch {
    /* A silent alert still has its text equivalent. */
  }
}
