/* ============================================
   DARK LUXURY WEDDING - Flip Countdown
   ============================================ */

class FlipCountdown {
  constructor(targetDate) {
    this.target = new Date(targetDate).getTime();
    this.intervals = {};
    this.prev = { days: -1, hours: -1, minutes: -1, seconds: -1 };
  }

  pad(n) { return String(n).padStart(2, '0'); }

  flip(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const current = el.textContent;
    const newVal = this.pad(value);
    if (current === newVal) return;
    el.classList.remove('flipping');
    void el.offsetWidth; // reflow
    el.classList.add('flipping');
    el.textContent = newVal;
    el.addEventListener('animationend', () => el.classList.remove('flipping'), { once: true });
  }

  update() {
    const now = Date.now();
    const diff = this.target - now;

    const marriedMsg = document.getElementById('married-message');
    const grid = document.getElementById('countdown-grid');

    if (diff <= 0) {
      if (grid) grid.style.display = 'none';
      if (marriedMsg) marriedMsg.style.display = 'block';
      return true; // done
    }

    if (grid) grid.style.display = 'grid';
    if (marriedMsg) marriedMsg.style.display = 'none';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.flip('cd-days', days);
    this.flip('cd-hours', hours);
    this.flip('cd-minutes', minutes);
    this.flip('cd-seconds', seconds);

    return false;
  }

  start() {
    const done = this.update();
    if (!done) {
      this.intervalId = setInterval(() => {
        const done = this.update();
        if (done) clearInterval(this.intervalId);
      }, 1000);
    }
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}

window.FlipCountdown = FlipCountdown;
