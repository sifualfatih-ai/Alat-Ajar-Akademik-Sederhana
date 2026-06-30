/**
 * MICRO-BACKEND RUNNER (APPS SCRIPT)
 * Tempelkan seluruh kode ini ke Google Apps Script editor.
 * Eksekusi sebagai: Web App (Jalankan sebagai ANDA, Akses untuk SIAPA SAJA).
 */

const SHEET_NAME = "DatabaseSiasat";
const GURU_SHEET_NAME = "GuruDatabase";
const MAX_GURU = 1000;

// Hanya terima HTTP POST dari Node.js Proxy Server untuk keamanan struktural
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: "Payload kosong. Operasi ditolak." });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const data = payload.data;

    // Inisiasi Sheet Dinamis
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Inisiasi Sheet untuk Log Administrasi Guru
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Setup Header Kolom Baseline
      sheet.appendRow(["Timestamp", "Aksi", "ID", "Data Payload"]);
    }

    // 2. Inisiasi Sheet untuk Database Guru
    let guruSheet = ss.getSheetByName(GURU_SHEET_NAME);
    if (!guruSheet) {
      guruSheet = ss.insertSheet(GURU_SHEET_NAME);
      // Setup Header (Nama, WhatsApp, Email, NamaSekolah, Password, Status, Timestamp, AuthToken)
      guruSheet.appendRow(["Nama", "WhatsApp", "Email", "NamaSekolah", "Password", "Status", "Timestamp", "AuthToken"]);
    }

    // Router Aksi Database
    if (action === "test") {
      return createJsonResponse({ 
        success: true, 
        message: "Koneksi ke sistem Apps Script Database Berhasil tersambung!" 
      });
    }

    // ==========================================
    // ROUTER AUTENTIKASI (PASSWORD LOGIN)
    // ==========================================
    
    if (action === "register") {
      const { nama, whatsapp, email, namasekolah, password } = data;
      if (!nama || !whatsapp || !email || !namasekolah || !password) {
        return createJsonResponse({ success: false, error: "Semua kolom pendaftaran wajib diisi." });
      }

      const guruData = guruSheet.getDataRange().getValues();
      
      // Cek limit 1000 guru jika belum terdaftar
      // (guruData.length - 1 untuk mengabaikan header)
      if (guruData.length - 1 >= MAX_GURU) {
        return createJsonResponse({ success: false, error: "Batas maksimal 1000 guru telah tercapai. Pendaftaran ditutup." });
      }

      // Cek apakah nomor WA sudah ada
      for (let i = 1; i < guruData.length; i++) {
        if (guruData[i][1] == whatsapp) { // Index 1 is WhatsApp
          return createJsonResponse({ success: false, error: "Nomor WhatsApp sudah terdaftar." });
        }
      }

      // Daftarkan user baru
      const timestamp = new Date().toISOString();
      const authToken = Utilities.getUuid();
      guruSheet.appendRow([nama, whatsapp, email, namasekolah, password, "Active", timestamp, authToken]);

      return createJsonResponse({
        success: true,
        message: "Pendaftaran berhasil.",
        token: authToken,
        user: { nama, whatsapp, email, namasekolah }
      });
    }

    if (action === "login") {
      const waNumber = data.whatsapp;
      const passInput = data.password;

      if (!waNumber || !passInput) {
        return createJsonResponse({ success: false, error: "WhatsApp dan Password wajib diisi." });
      }

      const guruData = guruSheet.getDataRange().getValues();
      for (let i = 1; i < guruData.length; i++) {
        if (guruData[i][1] == waNumber) { // Index 1 is WhatsApp
          const dbPass = guruData[i][4]; // Index 4 is Password
          
          if (dbPass == passInput) {
            // Password Cocok, Berikan Token Autentikasi
            const authToken = Utilities.getUuid();
            guruSheet.getRange(i + 1, 8).setValue(authToken); // Update AuthToken (Index 7, 1-based is 8)

            return createJsonResponse({
              success: true,
              message: "Login berhasil.",
              token: authToken,
              user: {
                nama: guruData[i][0],
                whatsapp: guruData[i][1],
                email: guruData[i][2],
                namasekolah: guruData[i][3]
              }
            });
          } else {
            return createJsonResponse({ success: false, error: "Password salah." });
          }
        }
      }
      return createJsonResponse({ success: false, error: "Nomor WhatsApp tidak ditemukan." });
    }

    // ==========================================
    // ROUTER DATABASE ADMINISTRASI (TETAP SAMA)
    // ==========================================

    if (action === "bulk_sync" || action.startsWith("sync") || action.startsWith("submit")) {
      const timestamp = new Date().toISOString();
      // Gunakan Stringifikasi agar seluruh record aman di satu sel
      const safeData = JSON.stringify(data);
      const uuid = data?.id || Utilities.getUuid();
      
      sheet.appendRow([timestamp, action, uuid, safeData]);

      return createJsonResponse({
        success: true,
        message: "Operasi " + action + " berhasil di-commit."
      });
    }

    // Fallback jika aksi tak dikenali
    return createJsonResponse({ 
      success: false, 
      error: "Kode aksi API (action) tidak divalidasi oleh router." 
    });

  } catch(err) {
    return createJsonResponse({ 
      success: false, 
      error: err.toString() 
    });
  }
}

// Untuk memastikan end-point memantulkan GET (jika tak sengaja diping)
function doGet(e) {
  return createJsonResponse({ 
    success: false, 
    error: "Metode GET ditolak. Gunakan POST melalui backend Node.js (Proxy)." 
  });
}

/**
 * Utilitas untuk mengunci output MIME type menjadi JSON Native.
 */
function createJsonResponse(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}
