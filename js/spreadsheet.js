/* ============================================
   DARK LUXURY WEDDING - Google Spreadsheet
   Konek ke Google Apps Script Web App
   ============================================ */

class Spreadsheet {
  constructor(webAppUrl) {
    this.url   = webAppUrl;
    this.cache = null;
  }

  /* ── Kirim RSVP ke Google Sheet ── */
  async submit(data) {
    // Mode demo kalau URL belum diset
    if (!this.url || this.url.includes('YOUR_SCRIPT_ID')) {
      await new Promise(r => setTimeout(r, 1500));
      // Simpan ke cache lokal sementara
      if (!this.cache) this.cache = [];
      this.cache.unshift({
        name       : data.name,
        attendance : data.attendance,
        message    : data.message || ''
      });
      return { status: 'success' };
    }

    try {
      // Kirim sebagai FormData ke Apps Script
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => form.append(k, v));

      const res = await fetch(this.url, {
        method : 'POST',
        body   : form
      });
      const json = await res.json();

      // Invalidate cache agar ucapan ter-refresh
      this.cache = null;

      return json;
    } catch (err) {
      console.error('RSVP submit error:', err);
      throw err;
    }
  }

  /* ── Ambil ucapan tamu dari Google Sheet ── */
  async fetchWishes() {
    // Gunakan cache kalau ada
    if (this.cache) return this.cache;

    // Mode demo
    if (!this.url || this.url.includes('YOUR_SCRIPT_ID')) {
      await new Promise(r => setTimeout(r, 700));
      this.cache = [
        { name: 'Budi Santoso',  attendance: 'Hadir',       message: 'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Barakallahu lakuma.' },
        { name: 'Sari Dewi',     attendance: 'Hadir',       message: 'Alhamdulillah, semoga pernikahan ini menjadi awal yang indah. Doa terbaik untuk kalian berdua!' },
        { name: 'Ahmad Fauzan',  attendance: 'Tidak Hadir', message: 'Congrats! Semoga rumah tangga kalian selalu diberkahi Allah SWT. Aamiin.' },
        { name: 'Rina Hastuti',  attendance: 'Hadir',       message: "Masyaa Allah, barakallahu lakuma wa baraka alaikuma wa jama'a bainakuma fi khair. Aamiin." },
        { name: 'Doni Prasetyo', attendance: 'Hadir',       message: 'Selamat ya! Semoga jadi keluarga yang penuh cinta dan kebahagiaan sampai tua bersama.' }
      ];
      return this.cache;
    }

    try {
      const res  = await fetch(`${this.url}?action=getWishes`);
      const data = await res.json();

      // Pastikan format benar
      if (Array.isArray(data)) {
        this.cache = data;
      } else {
        this.cache = [];
      }
      return this.cache;
    } catch (err) {
      console.error('fetchWishes error:', err);
      return [];
    }
  }

  /* ── Refresh paksa ucapan (invalidate cache) ── */
  refresh() {
    this.cache = null;
  }
}

window.Spreadsheet = Spreadsheet;
