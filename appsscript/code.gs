/**
 * MICRO-BACKEND RUNNER (APPS SCRIPT)
 * Tempelkan seluruh kode ini ke Google Apps Script editor.
 * Eksekusi sebagai: Web App (Jalankan sebagai ANDA, Akses untuk SIAPA SAJA).
 */

const SHEET_NAME = "DatabaseSiasat";

// Hanya terima HTTP POST dari Node.js Proxy Server untuk keamanan struktural
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: "Payload kosong. Operasi ditolak." });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const data = payload.data;

    // [Opsional: Terapkan Validasi Header Token jika proxy Anda men-supply Header Khusus]
    // const auth = payload.token; 
    // if (auth !== "TOKEN_RAHASIA_PROXY_SAYA") return createJsonResponse({success: false, error: "Akses Ditolak"});

    // Inisiasi Sheet Dinamis
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Setup Header Kolom Baseline
      sheet.appendRow(["Timestamp", "Aksi", "ID", "Data Payload"]);
    }

    // Router Aksi Database
    if (action === "test") {
      return createJsonResponse({ 
        success: true, 
        message: "Koneksi ke sistem Apps Script Database Berhasil tersambung!" 
      });
    }

    if (action === "bulk_sync") {
      // Teknik Penulisan Mutasi (Write Operations)
      // Contoh: Simpan JSON berukuran besar langsung ke row 
      const timestamp = new Date().toISOString();
      // Gunakan Stringifikasi agar seluruh record aman di satu sel
      const safeData = JSON.stringify(data);
      const uuid = data.id || "SYS_SYNC_01";
      
      sheet.appendRow([timestamp, action, uuid, safeData]);

      return createJsonResponse({
        success: true,
        message: "Operasi bulk sync berhasil di-commit."
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
