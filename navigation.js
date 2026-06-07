/* ============================================
   DARK LUXURY WEDDING - Navigation
   ============================================ */

class Navigation {
  constructor() {
    this.nav = document.getElementById('bottom-nav');
    this.items = [];
    this.sections = [];
    this.currentActive = null;
    this.ticking = false;
  }

  init(navItems) {
    if (!this.nav) return;
    this.nav.classList.add('visible');

    const wrap = this.nav.querySelector('.nav-scroll-wrap');
    navItems.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'nav-item';
      btn.dataset.section = item.id;
      btn.innerHTML = `<span class="nav-icon">${item.icon}</span><span class="nav-label">${item.label}</span>`;
      btn.addEventListener('click', () => this.scrollTo(item.id));
      wrap.appendChild(btn);
      this.items.push(btn);
    });

    this.sections = navItems
      .map(i => document.getElementById(i.id))
      .filter(Boolean);

    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateActive();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });

    this.updateActive();
  }

  scrollTo(id) {
    const el = document.getElementById(id);
    if (el) {
      const offset = el.getBoundingClientRect().top + window.scrollY - 0;
      window.scrollTo({ top: offset, behavior: 'smooth' });
      this.setActive(id);
    }
  }

  updateActive() {
    const scrollY = window.scrollY + window.innerHeight / 3;
    let active = null;
    for (let i = this.sections.length - 1; i >= 0; i--) {
      const sec = this.sections[i];
      if (sec && sec.offsetTop <= scrollY) {
        active = sec.id;
        break;
      }
    }
    if (active && active !== this.currentActive) {
      this.setActive(active);
    }
  }

  setActive(id) {
    this.currentActive = id;
    this.items.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === id);
    });
    // Scroll active nav item into view
    const activeBtn = this.items.find(b => b.dataset.section === id);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }
}

window.Navigation = Navigation;
