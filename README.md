# 🖤 Dark Luxury Wedding Invitation

Website undangan pernikahan digital premium dengan tema **Dark Luxury** — elegan, sinematik, dan eksklusif.

---

## 🚀 Quick Start

1. Edit `data/config.json` dengan data pasangan Anda
2. Tambahkan foto ke folder `assets/images/`
3. Ganti musik di `assets/music/wedding-song.mp3`
4. Setup Google Apps Script untuk RSVP
5. Deploy ke GitHub Pages

---

## 📁 Struktur Folder

```
dark-luxury-wedding/
├── index.html              # Halaman utama
├── css/
│   ├── variables.css       # CSS Variables & tema
│   ├── style.css           # Style utama
│   ├── animation.css       # Animasi & keyframes
│   └── responsive.css      # Responsive / Mobile
├── js/
│   ├── app.js              # Orchestrator utama
│   ├── particles.js        # Gold particles engine
│   ├── navigation.js       # Bottom navigation
│   ├── countdown.js        # Flip countdown timer
│   ├── gallery.js          # Gallery & lightbox
│   ├── music.js            # Audio player
│   ├── rsvp.js             # Form RSVP
│   ├── spreadsheet.js      # Google Sheets integration
│   └── animation.js        # Scroll animations
├── assets/
│   ├── images/
│   │   ├── groom/          # Foto pengantin pria (groom.jpg)
│   │   ├── bride/          # Foto pengantin wanita (bride.jpg)
│   │   ├── gallery/        # Foto-foto galeri
│   │   ├── cover/          # og-image.jpg untuk preview sosmed
│   │   └── icons/          # icon-192.png, icon-512.png
│   └── music/
│       └── wedding-song.mp3
├── data/
│   └── config.json         # ⚙️ Konfigurasi utama
└── pwa/
    ├── manifest.json
    └── service-worker.js
```

---

## ⚙️ Konfigurasi (`data/config.json`)

Edit file ini untuk menyesuaikan semua data:

```json
{
  "couple": {
    "groom": { "nickname": "Rizky", "fullname": "...", ... },
    "bride": { "nickname": "Nadira", "fullname": "...", ... }
  },
  "event": {
    "akad": { "date": "2025-12-27", "time": "...", ... },
    "resepsi": { "date": "2025-12-27", "time": "...", ... }
  },
  "spreadsheet": {
    "webAppUrl": "https://script.google.com/macros/s/YOUR_ID/exec"
  }
}
```

---

## 📊 Setup Google Apps Script (RSVP)

1. Buka [Google Sheets](https://sheets.google.com) → buat spreadsheet baru
2. Beri nama kolom: `timestamp | name | attendance | guests | message`
3. **Extensions → Apps Script** → paste kode berikut:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = e.parameter;
  sheet.appendRow([
    new Date(),
    data.name,
    data.attendance,
    data.guests,
    data.message
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e.parameter.action === 'getWishes') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rows = sheet.getDataRange().getValues();
    const wishes = rows.slice(1).map(row => ({
      name: row[1], attendance: row[2], message: row[4]
    })).filter(w => w.message);
    return ContentService
      .createTextOutput(JSON.stringify(wishes))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. **Deploy → New Deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy URL → paste ke `config.json` → `spreadsheet.webAppUrl`

---

## 🌐 Deploy GitHub Pages

```bash
# 1. Buat repository baru di GitHub
# 2. Upload semua file
git init
git add .
git commit -m "Dark Luxury Wedding"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# 3. Settings → Pages → Branch: main → Save
```

URL undangan: `https://username.github.io/repo/?to=NamaTamu`

---

## 📸 Foto & Asset

| File | Ukuran Rekomendasi | Format |
|------|-------------------|--------|
| groom.jpg | 400×500px | WebP/JPG |
| bride.jpg | 400×500px | WebP/JPG |
| gallery/*.jpg | 600×800px | WebP/JPG |
| og-image.jpg | 1200×630px | JPG |
| icon-192.png | 192×192px | PNG |
| icon-512.png | 512×512px | PNG |

---

## 🎵 Musik

Letakkan file MP3 di `assets/music/wedding-song.mp3`.  
Rekomendasi: instrumental piano/string, ~3-5 menit, max 5MB.

---

## 📱 Fitur

- ✅ Loading screen premium (2-3 detik)
- ✅ Gold particles animation
- ✅ Cover dengan typewriter nama tamu
- ✅ Parallax & glow effects
- ✅ Bottom navigation sticky
- ✅ Scroll reveal animations
- ✅ Flip countdown timer
- ✅ Gallery masonry + lightbox + swipe
- ✅ Google Maps embed
- ✅ RSVP form → Google Spreadsheet
- ✅ Guestbook/ucapan tamu
- ✅ Copy rekening + toast notification
- ✅ QRIS placeholder
- ✅ Music player floating
- ✅ PWA (installable)
- ✅ SEO + Open Graph + WhatsApp preview
- ✅ Mobile-first responsive
- ✅ Ripple effect & micro interactions

---

## 🔗 URL Parameter

Kirim undangan personal dengan parameter `?to=`:
```
https://yourdomain.github.io/?to=Budi+Santoso
https://yourdomain.github.io/?to=Keluarga+Ahmad
```

Nama tamu otomatis muncul dengan efek typewriter di cover.

---

## 🎨 Kustomisasi Warna

Edit `css/variables.css`:
```css
--gold: #c9a84c;        /* Warna emas utama */
--gold-light: #f5d06e;  /* Emas terang */
--black-deep: #050505;  /* Hitam background */
```

---

Made with 🖤 · Dark Luxury Wedding Template
