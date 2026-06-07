/**
 * ============================================================
 *  DARK LUXURY WEDDING — Google Apps Script
 *  Copy-paste seluruh kode ini ke Apps Script Google Sheet
 * ============================================================
 *
 *  CARA SETUP:
 *  1. Buka Google Sheets → Extensions → Apps Script
 *  2. Hapus kode default, paste seluruh kode ini
 *  3. Klik Deploy → New Deployment → Web App
 *     - Execute as : Me
 *     - Who access : Anyone
 *  4. Copy URL deployment → paste ke data/config.json
 *     pada field "spreadsheet" → "webAppUrl"
 * ============================================================
 */

// ── Nama sheet ──
const SHEET_RSVP   = 'RSVP';
const SHEET_WISHES = 'Ucapan';

// ── Setup header otomatis saat pertama kali ──
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Sheet RSVP
  let rsvp = ss.getSheetByName(SHEET_RSVP);
  if (!rsvp) {
    rsvp = ss.insertSheet(SHEET_RSVP);
  }
  if (rsvp.getLastRow() === 0) {
    rsvp.appendRow(['Timestamp', 'Nama', 'Kehadiran', 'Jumlah Tamu', 'Ucapan']);
    rsvp.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#1a1a1a').setFontColor('#c9a84c');
    rsvp.setFrozenRows(1);
    rsvp.setColumnWidth(1, 180);
    rsvp.setColumnWidth(2, 180);
    rsvp.setColumnWidth(3, 120);
    rsvp.setColumnWidth(4, 100);
    rsvp.setColumnWidth(5, 400);
  }

  // Sheet Ucapan (tampil di website)
  let wishes = ss.getSheetByName(SHEET_WISHES);
  if (!wishes) {
    wishes = ss.insertSheet(SHEET_WISHES);
  }
  if (wishes.getLastRow() === 0) {
    wishes.appendRow(['Nama', 'Kehadiran', 'Ucapan']);
    wishes.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#1a1a1a').setFontColor('#c9a84c');
    wishes.setFrozenRows(1);
    wishes.setColumnWidth(1, 180);
    wishes.setColumnWidth(2, 120);
    wishes.setColumnWidth(3, 500);
  }
}

// ── Handle POST — simpan RSVP ──
function doPost(e) {
  try {
    setupSheets();
    const ss     = SpreadsheetApp.getActiveSpreadsheet();
    const rsvp   = ss.getSheetByName(SHEET_RSVP);
    const wishes = ss.getSheetByName(SHEET_WISHES);

    const name       = (e.parameter.name       || '').trim();
    const attendance = (e.parameter.attendance || 'Hadir').trim();
    const guests     = (e.parameter.guests     || '1').trim();
    const message    = (e.parameter.message    || '').trim();
    const timestamp  = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    // Simpan ke sheet RSVP (semua data)
    rsvp.appendRow([timestamp, name, attendance, guests, message]);

    // Simpan ke sheet Ucapan (hanya kalau ada pesan)
    if (message.length > 0) {
      wishes.appendRow([name, attendance, message]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'RSVP berhasil disimpan' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Handle GET — ambil ucapan tamu ──
function doGet(e) {
  // CORS header helper
  const output = (data) => ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  try {
    if (e.parameter.action === 'getWishes') {
      setupSheets();
      const ss     = SpreadsheetApp.getActiveSpreadsheet();
      const wishes = ss.getSheetByName(SHEET_WISHES);

      const rows = wishes.getDataRange().getValues();
      // Skip header row
      const data = rows.slice(1)
        .filter(row => row[0] && row[2]) // harus ada nama dan pesan
        .map(row => ({
          name       : String(row[0] || '').trim(),
          attendance : String(row[1] || 'Hadir').trim(),
          message    : String(row[2] || '').trim()
        }));

      return output(data);
    }

    // Default: return status OK
    return output({ status: 'ok', message: 'Wedding RSVP API aktif' });

  } catch (err) {
    return output({ status: 'error', message: err.toString() });
  }
}
