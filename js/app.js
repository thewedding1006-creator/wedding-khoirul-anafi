/* ============================================
   DARK LUXURY WEDDING — App Orchestrator v3
   Fix: loading tidak stuck, robust timeout
   ============================================ */
(async () => {

  /* ─── 1. LOAD CONFIG ─────────────────────── */
  let cfg = {};
  try {
    const r = await fetch('data/config.json');
    cfg = await r.json();
  } catch { cfg = {}; }

  const groom   = cfg.couple?.groom   || {};
  const bride   = cfg.couple?.bride   || {};
  const akad    = cfg.event?.akad     || {};
  const resepsi = cfg.event?.resepsi  || {};
  const gift    = cfg.gift            || {};
  const maps    = cfg.maps            || {};
  const seo     = cfg.seo             || {};
  const story   = cfg.loveStory       || [];

  /* ─── 2. URL PARAM ───────────────────────── */
  const params    = new URLSearchParams(window.location.search);
  const guestRaw  = params.get('to') || '';
  const guestName = guestRaw ? decodeURIComponent(guestRaw.replace(/\+/g,' ')) : '';

  /* ─── 3. PATCH DOM ───────────────────────── */
  patchDOM();

  /* ─── 4. LOADING SCREEN ──────────────────── */
  const loadingBar  = document.querySelector('.loading-bar');
  const loadingPct  = document.querySelector('.loading-percent');
  const loadingScr  = document.getElementById('loading-screen');

  // Resize loading canvas
  const lCanvas = document.getElementById('loading-canvas');
  if (lCanvas) {
    lCanvas.width  = window.innerWidth;
    lCanvas.height = window.innerHeight;
  }

  const loadParticles = new GoldParticles('loading-canvas');
  loadParticles.start();

  /* ── Progress bar animasi halus ── */
  let pct = 0;
  let barDone = false;

  function animateBar(target, duration, cb) {
    const start    = pct;
    const diff     = target - start;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - t, 3);
      pct = start + diff * ease;
      if (loadingBar)  loadingBar.style.width  = pct + '%';
      if (loadingPct)  loadingPct.textContent   = Math.floor(pct) + '%';
      if (t < 1) requestAnimationFrame(step);
      else if (cb) cb();
    }
    requestAnimationFrame(step);
  }

  // Langsung mulai animasi ke 80% dalam 1.8 detik
  animateBar(80, 1800, null);

  /* ─── 5. TRIGGER SETELAH LOADING ─────────── */
  // Pakai DUALSTRATEGY: load event ATAU timeout 3.5 detik, mana duluan
  const minDisplay = 2500; // minimum loading screen tampil
  const maxWait    = 3500; // maksimum tunggu sebelum paksa lanjut
  const startTime  = Date.now();

  function finishLoading() {
    if (barDone) return; // sudah dipanggil sekali
    barDone = true;

    const elapsed   = Date.now() - startTime;
    const remaining = Math.max(0, minDisplay - elapsed);

    setTimeout(() => {
      // Animasi bar ke 100%
      animateBar(100, 400, async () => {
        await delay(300);

        // Burst partikel
        if (lCanvas) loadParticles.burst(lCanvas.width / 2, lCanvas.height / 2, 20);
        await delay(250);

        // Sembunyikan loading
        loadingScr.classList.add('hide');
        loadParticles.stop();

        // Tampilkan main content dalam cover-only mode
        const main = document.getElementById('main-content');
        main.classList.add('cover-only'); // sembunyikan semua kecuali cover
        main.classList.add('visible');    // gunakan class visible
        document.body.classList.add('cover-only'); // no scroll
        await delay(30);

        // Start background particles
        window.goldParticles = new GoldParticles('particles-canvas');
        window.goldParticles.start();

        initAll();
      });
    }, remaining);
  }

  // Strategy 1: window load event
  window.addEventListener('load', finishLoading);

  // Strategy 2: hard timeout — tidak akan pernah stuck
  setTimeout(finishLoading, maxWait);

  // Strategy 3: kalau DOM sudah ready dan semua script sudah jalan
  if (document.readyState === 'complete') {
    setTimeout(finishLoading, 100);
  }

  /* ─── 6. INIT ALL MODULES ────────────────── */
  function initAll() {
    typewriter();

    // Navigation — tampilkan hanya section yang ada
    const navItems = [
      { id:'cover',    icon:'⌂', label:'Cover'    },
      { id:'quotes',   icon:'✦', label:'Quotes'   },
      { id:'mempelai', icon:'♥', label:'Mempelai' },
      { id:'acara',    icon:'◈', label:'Acara'    },
      { id:'gallery',  icon:'⊞', label:'Gallery'  },
      { id:'maps',     icon:'◎', label:'Maps'     },
      { id:'countdown',icon:'◷', label:'Countdown'},
      { id:'gift',     icon:'⎔', label:'Gift'     },
      { id:'rsvp',     icon:'✐', label:'RSVP'     },
      { id:'thanks',   icon:'✿', label:'Thanks'   },
    ].filter(item => document.getElementById(item.id));

    // Nav disembunyikan dulu sampai buka undangan diklik
    const nav = new Navigation();
    nav.init(navItems);
    // Sembunyikan nav dulu - hanya tampil setelah buka undangan
    const navEl = document.getElementById('bottom-nav');
    if (navEl) navEl.classList.remove('visible');

    // Scroll animations
    window.scrollAnimator = new ScrollAnimator();

    // Countdown
    const wdDate = akad.date || '2026-06-10';
    const countdown = new FlipCountdown(`${wdDate}T10:00:00`);
    countdown.start();

    // Gallery
    window.gallery = new Gallery();
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid) window.gallery.setupLazyLoad(galleryGrid);

    // Music
    const musicSrc = cfg.music?.src || 'assets/music/wedding-song.mp3';
    window.musicPlayer = new MusicPlayer(musicSrc);

    // Spreadsheet & RSVP
    const db = new Spreadsheet(cfg.spreadsheet?.webAppUrl || '');
    window.db   = db;
    window.rsvp = new RSVP(db);

    // Wishes — load pertama + auto refresh tiap 30 detik
    window.loadWishes = () => loadWishes(db);
    loadWishes(db);

    // Auto-refresh ucapan setiap 30 detik (kalau pakai Google Sheet live)
    setInterval(() => {
      db.refresh(); // invalidate cache
      loadWishes(db);
    }, 30000);

    // Copy buttons
    initCopyBtns();

    // Cover open button
    initCoverBtn();

    // Lazy-load mempelai photos
    setTimeout(() => {
      ['groom-photo','bride-photo'].forEach(id => {
        const img = document.getElementById(id);
        if (img?.dataset.src) img.src = img.dataset.src;
      });
    }, 2000);
  }

  /* ─── 7. PATCH DOM WITH CONFIG ──────────── */
  function patchDOM() {
    const title = seo.title || `The Wedding of ${groom.nickname} & ${bride.nickname}`;
    document.title = title;
    qm('meta[property="og:title"]')?.setAttribute('content', title);
    qm('meta[name="twitter:title"]')?.setAttribute('content', title);
    if (seo.description) {
      qm('meta[name="description"]')?.setAttribute('content', seo.description);
      qm('meta[property="og:description"]')?.setAttribute('content', seo.description);
    }

    setText('.loading-names',        `${groom.nickname} & ${bride.nickname}`);
    setText('.loading-monogram-text',`${groom.nickname?.[0]||'K'}&${bride.nickname?.[0]||'A'}`);

    setText('#cover-name-groom',  groom.nickname  || 'Khoirul');
    setText('#cover-name-bride',  bride.nickname  || 'Anafi');
    setText('#cover-date-text',   '10 · 06 · 2026');
    setText('#cover-hashtag',     seo.hashtag || '#KhoirulAnafi2026');

    setText('#mp-groom-nickname', groom.nickname || 'Khoirul');
    setText('#mp-groom-fullname', groom.fullname || 'Khoirul Anwar');
    setHTML('#mp-groom-parents',  `Putra dari<br><strong>${groom.father||''}</strong><br>&amp; <strong>${groom.mother||''}</strong>`);
    setText('#groom-initial',     groom.nickname?.[0]?.toUpperCase() || 'K');
    setAttr('#groom-photo', 'data-src', groom.photo || 'assets/images/groom/groom.jpg');

    setText('#mp-bride-nickname', bride.nickname || 'Anafi');
    setText('#mp-bride-fullname', bride.fullname || 'Anafi Putri');
    setHTML('#mp-bride-parents',  `Putri dari<br><strong>${bride.father||''}</strong><br>&amp; <strong>${bride.mother||''}</strong>`);
    setText('#bride-initial',     bride.nickname?.[0]?.toUpperCase() || 'A');
    setAttr('#bride-photo', 'data-src', bride.photo || 'assets/images/bride/bride.jpg');

    // Love Story — kalau kosong sembunyikan section
    const lsSection = document.getElementById('love-story');
    if (lsSection && (!story || story.length === 0)) {
      lsSection.style.display = 'none';
    }

    setText('#akad-time',    akad.time    || '10.00 WIB');
    setText('#akad-date',    `${akad.day||'Rabu'}, ${formatDate(akad.date)}`);
    setText('#akad-venue',   akad.venue   || 'KUA Pasar Kliwon');
    setHTML('#akad-address', (akad.address||'').replace(/,\s*/g, ',<br>'));

    setText('#resepsi-time',    resepsi.time    || '19.00 WIB');
    setText('#resepsi-date',    `${resepsi.day||'Rabu'}, ${formatDate(resepsi.date)}`);
    setText('#resepsi-venue',   resepsi.venue   || 'Gedung Diponegoro');
    setHTML('#resepsi-address', (resepsi.address||'').replace(/,\s*/g, ',<br>'));

    setText('#cd-wedding-date', formatDate(akad.date));

    // Calendar link
    const calDate  = (akad.date||'2026-06-10').replace(/-/g,'');
    const calTitle = encodeURIComponent(`Pernikahan ${groom.nickname} & ${bride.nickname}`);
    const calLoc   = encodeURIComponent(resepsi.address || '');
    setAttr('#btn-add-calendar', 'href',
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${calDate}T030000Z/${calDate}T140000Z&location=${calLoc}`);

    // Maps
    if (maps.embedUrl)      setAttr('#maps-iframe',    'src',  maps.embedUrl);
    if (maps.directionsUrl) setAttr('#btn-open-maps',  'href', maps.directionsUrl);

    // Gift accounts — render dari config
    const giftContainer = document.getElementById('gift-accounts');
    if (giftContainer && gift.accounts?.length) {
      giftContainer.innerHTML = gift.accounts.map((acc, i) => `
        <div class="bank-card reveal${i>0?' reveal-delay-'+i:''}">
          <div class="bank-card-header">
            <span class="bank-name">Bank ${esc(acc.bank)}</span>
            <div class="bank-logo">${esc(acc.bank)}</div>
          </div>
          <div class="bank-number">${esc(acc.number)}</div>
          <div class="bank-holder">${esc(acc.holder)}</div>
          <button class="btn-copy" data-copy="${esc(acc.number.replace(/\s/g,''))}">
            <span>⎘</span> Salin Nomor
          </button>
        </div>`).join('');
    }

    setText('#thanks-groom',   groom.nickname || 'Khoirul');
    setText('#thanks-bride',   bride.nickname || 'Anafi');
    setText('#thanks-hashtag', seo.hashtag    || '#KhoirulAnafi2026');
  }

  /* ─── 8. TYPEWRITER ─────────────────────── */
  function typewriter() {
    const el     = document.getElementById('guest-name-text');
    const cursor = document.querySelector('.cursor');
    if (!el) return;
    const text = guestName || 'Bapak/Ibu/Saudara/i';
    el.textContent = '';
    let i = 0;
    setTimeout(() => {
      const iv = setInterval(() => {
        el.textContent = text.slice(0, ++i);
        if (i >= text.length) {
          clearInterval(iv);
          setTimeout(() => { if (cursor) cursor.style.display = 'none'; }, 1600);
        }
      }, 55);
    }, 900);
  }

  /* ─── 9. COVER OPEN BUTTON ──────────────── */
  function initCoverBtn() {
    const btn   = document.getElementById('open-btn');
    const cover = document.getElementById('cover');
    const main  = document.getElementById('main-content');
    if (!btn) return;

    btn.addEventListener('click', e => {
      // Ripple effect
      const rect   = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const sz = Math.max(rect.width, rect.height) * 2.5;
      ripple.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX-rect.left-sz/2}px;top:${e.clientY-rect.top-sz/2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());

      // Animasi tutup cover
      cover.classList.add('closing');

      // Musik mulai
      setTimeout(() => {
        window.musicPlayer?.play();
        window.musicPlayer?.show();
      }, 400);

      // Setelah cover hilang: buka semua section
      setTimeout(() => {
        // Ubah cover menjadi "home" yang ringkas setelah dibuka
        cover.classList.remove('closing');
        cover.style.maxHeight = '';
        cover.style.height = 'auto';
        cover.style.minHeight = '50svh';

        // Sembunyikan elemen cover yang tidak perlu setelah dibuka
        const hideAfterOpen = ['#open-btn', '.cover-anim-6', '.cover-guest-label', '.cover-guest-name'];
        hideAfterOpen.forEach(sel => {
          const el = cover.querySelector(sel);
          if (el) el.style.display = 'none';
        });

        // Tambahkan kelas opened agar bisa di-style berbeda
        cover.classList.add('cover-opened');

        // Izinkan scroll kembali
        document.body.classList.remove('cover-only');

        // Lepas cover-only — tampilkan semua section sekaligus
        if (main) main.classList.remove('cover-only');

        // Scroll ke quotes
        window.scrollTo({ top: 0, behavior: 'instant' });
       

        // Force semua elemen reveal yang visible langsung tampil
        setTimeout(() => {
          document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right, .quote-line, .timeline-item').forEach(el => {
            el.classList.add('in-view');
          });
          window.scrollAnimator?.refresh();
        }, 100);

        // Tampilkan bottom navigation dengan animasi
        const navEl = document.getElementById('bottom-nav');
        if (navEl) {
          navEl.classList.add('visible');
          navEl.style.animation = 'navSlideUp 0.5s var(--ease-silk) forwards';
        }

        // Refresh scroll animations
        window.scrollAnimator?.refresh();
      }, 850);
    });
  }

  /* ─── 10. COPY BUTTONS ──────────────────── */
  function initCopyBtns() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-copy');
      if (!btn) return;
      const text = btn.dataset.copy;
      if (!text) return;
      const doToast = () => showToast('✓  Nomor rekening berhasil disalin');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(doToast).catch(() => fallbackCopy(text, doToast));
      } else {
        fallbackCopy(text, doToast);
      }
    });
  }

  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); if (cb) cb(); } catch {}
    ta.remove();
  }

  /* ─── 11. LOAD WISHES ───────────────────── */
  async function loadWishes(db) {
    const container = document.getElementById('wishes-list');
    if (!container) return;

    container.innerHTML = [1,2,3].map(() => `
      <div class="wishes-skeleton">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>`).join('');

    try {
      const wishes = await db.fetchWishes();
      container.innerHTML = '';
      if (!wishes.length) {
        container.innerHTML = `<p style="text-align:center;color:var(--text-muted);font-size:0.8rem;
          font-family:var(--font-serif);font-style:italic;padding:24px 0;">
          Jadilah yang pertama memberikan ucapan...</p>`;
        return;
      }
      [...wishes].reverse().forEach((w, i) => {
        const div = document.createElement('div');
        div.className = 'wish-item reveal';
        div.style.transitionDelay = `${i * 0.07}s`;
        const initials = (w.name||'?').split(' ').slice(0,2).map(n=>n[0]||'').join('').toUpperCase() || '?';
        div.innerHTML = `
          <div class="wish-avatar">${initials}</div>
          <div class="wish-content">
            <div class="wish-name">${esc(w.name||'')}</div>
            <div class="wish-text">${esc(w.message||'')}</div>
            <div class="wish-attendance ${w.attendance==='Hadir'?'hadir':'tidak'}">
              ${w.attendance==='Hadir'?'✦ Hadir':'· Tidak Hadir'}
            </div>
          </div>`;
        container.appendChild(div);
      });
      window.scrollAnimator?.refresh();
    } catch {
      container.innerHTML = `<p style="text-align:center;color:var(--text-muted);font-size:0.8rem;">
        Gagal memuat ucapan.</p>`;
    }
  }

  /* ─── 12. TOAST ─────────────────────────── */
  window.showToast = function(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3200);
  };

  /* ─── HELPERS ────────────────────────────── */
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function setText(sel, val) {
    const el = document.querySelector(sel);
    if (el) el.textContent = val;
  }
  function setHTML(sel, val) {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = val;
  }
  function setAttr(sel, attr, val) {
    const el = document.querySelector(sel);
    if (el && val) el.setAttribute(attr, val);
  }
  function qm(sel) { return document.querySelector(sel); }
  function esc(str) {
    return String(str||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
    } catch { return dateStr; }
  }

})();
