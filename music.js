/* ============================================
   DARK LUXURY WEDDING - Music Player
   ============================================ */

class MusicPlayer {
  constructor(src) {
    this.audio = new Audio(src);
    this.audio.loop = true;
    this.audio.volume = 0.5;
    this.playing = false;
    this.btn = document.getElementById('music-btn');
    this.icon = this.btn?.querySelector('.music-icon');
    this.ring = this.btn?.querySelector('.music-ring');

    if (this.btn) {
      this.btn.addEventListener('click', () => this.toggle());
    }
  }

  async play() {
    try {
      // Fade in
      this.audio.volume = 0;
      await this.audio.play();
      this.playing = true;
      this.updateUI();
      this.fadeIn();
    } catch (e) {
      console.warn('Autoplay blocked:', e);
    }
  }

  pause() {
    this.fadeOut(() => {
      this.audio.pause();
      this.playing = false;
      this.updateUI();
    });
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  fadeIn(target = 0.5, duration = 2000) {
    const step = target / (duration / 50);
    const interval = setInterval(() => {
      if (this.audio.volume < target) {
        this.audio.volume = Math.min(this.audio.volume + step, target);
      } else {
        clearInterval(interval);
      }
    }, 50);
  }

  fadeOut(cb, duration = 1000) {
    const start = this.audio.volume;
    const step = start / (duration / 50);
    const interval = setInterval(() => {
      if (this.audio.volume > 0.01) {
        this.audio.volume = Math.max(this.audio.volume - step, 0);
      } else {
        clearInterval(interval);
        if (cb) cb();
      }
    }, 50);
  }

  updateUI() {
    if (!this.btn) return;
    if (this.playing) {
      this.btn.classList.add('playing');
      if (this.icon) this.icon.textContent = '♪';
    } else {
      this.btn.classList.remove('playing');
      if (this.icon) this.icon.textContent = '♫';
    }
  }

  show() {
    if (this.btn) this.btn.classList.add('visible');
  }
}

window.MusicPlayer = MusicPlayer;
