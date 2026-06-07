/* ============================================
   DARK LUXURY WEDDING - Gold Particles
   ============================================ */

class GoldParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animId = null;
    this.running = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticle(forceBottom = false) {
    const x = Math.random() * this.canvas.width;
    const y = forceBottom ? this.canvas.height + 10 : Math.random() * this.canvas.height;
    const size = Math.random() * 2.5 + 0.5;
    const type = Math.random() > 0.5 ? 'dust' : 'sparkle';
    return {
      x, y,
      size,
      type,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.5 + 0.2),
      opacity: Math.random() * 0.6 + 0.2,
      life: 0,
      maxLife: Math.random() * 300 + 200,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      twinkleOffset: Math.random() * Math.PI * 2
    };
  }

  drawParticle(p) {
    const progress = p.life / p.maxLife;
    const fadeIn = Math.min(progress * 10, 1);
    const fadeOut = 1 - Math.max((progress - 0.8) * 5, 0);
    const twinkle = Math.sin(p.life * p.twinkleSpeed + p.twinkleOffset) * 0.3 + 0.7;
    const alpha = p.opacity * fadeIn * fadeOut * twinkle;
    if (alpha <= 0) return;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;

    if (p.type === 'sparkle') {
      // Four-pointed star
      const s = p.size;
      this.ctx.fillStyle = '#f5d06e';
      this.ctx.shadowColor = '#c9a84c';
      this.ctx.shadowBlur = 6;
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y - s * 2);
      this.ctx.lineTo(p.x + s * 0.4, p.y - s * 0.4);
      this.ctx.lineTo(p.x + s * 2, p.y);
      this.ctx.lineTo(p.x + s * 0.4, p.y + s * 0.4);
      this.ctx.lineTo(p.x, p.y + s * 2);
      this.ctx.lineTo(p.x - s * 0.4, p.y + s * 0.4);
      this.ctx.lineTo(p.x - s * 2, p.y);
      this.ctx.lineTo(p.x - s * 0.4, p.y - s * 0.4);
      this.ctx.closePath();
      this.ctx.fill();
    } else {
      // Gold dust circle
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
      gradient.addColorStop(0, '#f5d06e');
      gradient.addColorStop(0.5, '#c9a84c');
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.shadowColor = '#c9a84c';
      this.ctx.shadowBlur = 4;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  update() {
    // Spawn
    if (this.particles.length < 40 && Math.random() > 0.85) {
      this.particles.push(this.createParticle(true));
    }
    // Update
    this.particles = this.particles.filter(p => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vx += (Math.random() - 0.5) * 0.02;
      return p.life < p.maxLife;
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(p => this.drawParticle(p));
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  start() {
    if (this.running) return;
    this.running = true;
    // Pre-populate
    for (let i = 0; i < 20; i++) {
      const p = this.createParticle(false);
      p.life = Math.random() * p.maxLife;
      this.particles.push(p);
    }
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  // Loading screen particles - burst effect
  burst(centerX, centerY, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      this.particles.push({
        x: centerX, y: centerY,
        size: Math.random() * 2 + 1,
        type: 'sparkle',
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        opacity: 0.9,
        life: 0, maxLife: 80,
        twinkleSpeed: 0.05, twinkleOffset: 0
      });
    }
  }
}

window.GoldParticles = GoldParticles;
