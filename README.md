# SIASAT GURU - Sistem Administrasi Cerdas

Aplikasi Siasat Guru adalah Progressive Web App (PWA) untuk manajemen administrasi guru yang memadukan UI/UX modern dan Google Apps Script sebagai *micro-backend*.

Didesain dengan arsitektur **Server-Side Proxy**, aplikasi ini menyembunyikan API key dan endpoint database dari paparan publik.

---

## 🔒 ARSITEKTUR KEAMANAN (PENTING DIPAHAMI)
Jika Anda men-*fork* proyek ini, ketahuilah bahwa:
1. **Frontend Tersolasi**: Klien (Browser/PWA) **tidak pernah** melakukan pemanggilan langsung ke Google Sheets (Apps Script).
2. **Proxy Backend (Express.js)**: Semua rute dilayani melalui `server.ts`. Frontend hanya memanggil endpoint lokal `/api/appscript`.
3. **Pemisahan Kredensial**: URL Eksekusi Apps Script murni di environment variables (`.env`) server. Tidak terekspos di bundle JavaScript frontend (`dist`).

---

## 🚀 PANDUAN INSTALASI & DEPLOYMENT (UNTUK FORKER)

### 1. Kloning Repositori
```bash
git clone https://github.com/username/siasat-guru.git
cd siasat-guru
```

### 2. Instalasi Dependensi Terpusat
```bash
npm install
```

### 3. Konfigurasi Environment Setup
Duplikat file konfigurasi *dummy*:
```bash
cp .env.example .env
```
Buka file `.env` dan isi variabel berikut dengan milik Anda (langkah mendapatkannya ada di bawah).

### 4. Menjalankan Server Lokal (Development)
```bash
npm run dev
```

### 5. Kompilasi Produksi (Siap Deploy ke Vercel/Render/VPS)
```bash
npm run build
npm start
```

---

## 🗄️ CARA SETUP DATABASE (GOOGLE SHEETS & APPS SCRIPT)

Karena sistem backend difokuskan pada penghematan biaya menggunakan infrastruktur Google, maka ikuti ini dengan eksak:

1. Buka [Google Sheets](https://sheets.google.com) dan buat *Spreadsheet* kosong baru.
2. Beri nama (contoh: "Database Siasat Guru"). Biarkan *Sheet1* tetap ada.
3. Klik menu **Ekstensi (Extensions)** > **Apps Script**.
4. Akan terbuka editor skrip. Hapus semua kode default dan salin-tempel kode *backend runner* dari file `/appsscript/code.gs` di repo ini.
5. Klik **Terapkan (Deploy)** > **Penerapan Baru (New Deployment)**.
6. Pilih jenis: **Aplikasi Web (Web App)**.
7. Konfigurasi ketat:
   - *Execute as / Jalankan sebagai*: **Diri Sendiri (Me) / Akun Google E-mail Anda**
   - *Who has access / Siapa yang memiliki akses*: **Siapa saja (Anyone)** *(Wajib "Anyone" agar bisa menerima HTTP POST Proxy dari Node.js)*.
8. Salin **URL Aplikasi Web (Web App URL)** yang dihasilkan (berakhiran `/exec`).
9. Tempelkan string URL tersebut ke file `.env` ke dalam parameter `APPS_SCRIPT_URL="..."`.
