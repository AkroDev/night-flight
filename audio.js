const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// joue un bip synthétisé : oscillateur (la fréquence) + gain (l'enveloppe de volume, pour un fondu propre)
function playTone({ frequency, endFrequency, duration, type = 'square', volume = 0.2 }) {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, audioContext.currentTime + duration);
  }

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

export function playBombSound() {
  playTone({ frequency: 400, endFrequency: 150, duration: 0.15, type: 'square' });
}

export function playExplosionSound() {
  playTone({ frequency: 150, endFrequency: 40, duration: 0.4, type: 'sawtooth', volume: 0.3 });
}

export function playLevelUpSound() {
  playTone({ frequency: 440, endFrequency: 880, duration: 0.3, type: 'sine', volume: 0.2 });
}

export function playGameOverSound() {
  playTone({ frequency: 300, endFrequency: 80, duration: 0.6, type: 'sawtooth', volume: 0.25 });
}
