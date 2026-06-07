/* ============================================
   DARK LUXURY WEDDING - Scroll Animations
   ============================================ */

class ScrollAnimator {
  constructor() {
    this.observer = null;
    this.timelineObserver = null;
    this.init();
  }

  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // Unobserve after animation for performance
          if (!entry.target.classList.contains('keep-observe')) {
            this.observer.unobserve(entry.target);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    // Observe all reveal elements
    document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right, .quote-line, .timeline-item').forEach(el => {
      this.observer.observe(el);
    });

    // Timeline scroll fill
    this.initTimelineFill();
  }

  initTimelineFill() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    const updateFill = () => {
      const rect = timeline.getBoundingClientRect();
      const viewH = window.innerHeight;
      const totalH = timeline.offsetHeight;
      const visibleTop = Math.max(0, -rect.top);
      const visibleBottom = Math.min(totalH, viewH - rect.top);
      const pct = Math.max(0, Math.min(100, (visibleBottom / totalH) * 100));
      timeline.style.setProperty('--timeline-fill', pct + '%');
    };

    window.addEventListener('scroll', updateFill, { passive: true });
    updateFill();
  }

  refresh() {
    document.querySelectorAll('.reveal:not(.in-view), .reveal-scale:not(.in-view)').forEach(el => {
      this.observer.observe(el);
    });
  }
}

window.ScrollAnimator = ScrollAnimator;
