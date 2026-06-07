/* ============================================
   DARK LUXURY WEDDING - RSVP Form
   ============================================ */

class RSVP {
  constructor(spreadsheet) {
    this.db         = spreadsheet;
    this.attendance = 'Hadir';
    this.submitted  = false;
    this.init();
  }

  init() {
    // Radio kehadiran
    document.querySelectorAll('.form-radio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.form-radio-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.attendance = btn.dataset.value;
      });
    });

    // Pre-fill nama dari URL ?to=
    const urlName = new URLSearchParams(window.location.search).get('to');
    const nameInput = document.getElementById('rsvp-name');
    if (nameInput && urlName) {
      nameInput.value = decodeURIComponent(urlName.replace(/\+/g, ' '));
    }

    // Submit handler
    const form = document.getElementById('rsvp-form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        if (!this.submitted) this.submit();
      });
    }
  }

  async submit() {
    const nameInput    = document.getElementById('rsvp-name');
    const guestsInput  = document.getElementById('rsvp-guests');
    const messageInput = document.getElementById('rsvp-message');
    const submitBtn    = document.getElementById('rsvp-submit');

    const name    = nameInput?.value?.trim();
    const guests  = guestsInput?.value || '1';
    const message = messageInput?.value?.trim() || '';

    // Validasi nama
    if (!name) {
      this.shake(nameInput);
      nameInput?.focus();
      return;
    }

    // Loading state
    this.submitted = true;
    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Mengirim...';
    }

    try {
      const result = await this.db.submit({
        name,
        attendance : this.attendance,
        guests,
        message,
        timestamp  : new Date().toISOString()
      });

      if (result.status === 'success' || result.status === undefined) {
        this.showSuccess(name);
        // Refresh ucapan setelah 1.5 detik
        this.db.refresh();
        setTimeout(() => {
          window.loadWishes && window.loadWishes();
        }, 1500);
      } else {
        throw new Error(result.message || 'Gagal mengirim');
      }

    } catch (err) {
      console.error('RSVP error:', err);
      this.submitted = false;
      if (submitBtn) {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Kirim RSVP';
      }
      window.showToast?.('❌ Gagal mengirim, coba lagi');
    }
  }

  showSuccess(name) {
    const form    = document.getElementById('rsvp-form');
    const success = document.getElementById('rsvp-success');
    if (form)    form.style.display = 'none';
    if (success) success.classList.add('show');

    // Update pesan sukses dengan nama
    const successText = success?.querySelector('.success-subtext');
    if (successText && name) {
      successText.textContent = `Terima kasih ${name}, konfirmasi kehadiran Anda telah kami terima. Kami sangat menantikan kehadiran Anda! 🖤`;
    }
  }

  shake(el) {
    if (!el) return;
    el.style.animation    = 'none';
    void el.offsetWidth;
    el.style.animation    = 'shake 0.4s ease';
    el.style.borderColor  = '#c0392b';
    el.style.boxShadow    = '0 0 15px rgba(192,57,43,0.3)';
    setTimeout(() => {
      el.style.borderColor = '';
      el.style.boxShadow   = '';
      el.style.animation   = '';
    }, 600);
  }
}

window.RSVP = RSVP;
