/* ============================================
   DARK LUXURY WEDDING - Gallery & Lightbox
   ============================================ */

class Gallery {
  constructor() {
    this.items = [];
    this.current = 0;
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImg = document.getElementById('lightbox-img');
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.init();
  }

  init() {
    const close = document.getElementById('lightbox-close');
    const prev = document.getElementById('lightbox-prev');
    const next = document.getElementById('lightbox-next');

    if (close) close.addEventListener('click', () => this.close());
    if (prev) prev.addEventListener('click', () => this.navigate(-1));
    if (next) next.addEventListener('click', () => this.navigate(1));

    if (this.lightbox) {
      this.lightbox.addEventListener('click', e => {
        if (e.target === this.lightbox) this.close();
      });
      this.lightbox.addEventListener('touchstart', e => {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });
      this.lightbox.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].screenX - this.touchStartX;
        const dy = Math.abs(e.changedTouches[0].screenY - this.touchStartY);
        if (Math.abs(dx) > 50 && dy < 100) {
          this.navigate(dx < 0 ? 1 : -1);
        }
      });
    }

    document.addEventListener('keydown', e => {
      if (!this.lightbox?.classList.contains('active')) return;
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
      if (e.key === 'Escape') this.close();
    });
  }

  register(src, index) {
    this.items[index] = src;
  }

  open(index) {
    if (!this.lightbox || !this.lightboxImg) return;
    this.current = index;
    this.lightboxImg.src = this.items[index] || '';
    this.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  navigate(dir) {
    this.current = (this.current + dir + this.items.length) % this.items.length;
    if (this.lightboxImg) {
      this.lightboxImg.style.opacity = '0';
      setTimeout(() => {
        this.lightboxImg.src = this.items[this.current] || '';
        this.lightboxImg.style.opacity = '1';
        this.lightboxImg.style.transition = 'opacity 0.3s ease';
      }, 150);
    }
  }

  close() {
    if (!this.lightbox) return;
    this.lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  setupLazyLoad(container) {
    if (!container) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    }, { rootMargin: '100px' });

    container.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  }
}

window.Gallery = Gallery;
