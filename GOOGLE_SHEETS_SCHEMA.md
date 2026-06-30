# Skema Database Google Sheets (Guru Digital Indonesia)

Dokumen ini menjelaskan struktur ideal Google Sheets untuk menampung data dari aplikasi **Guru Digital Indonesia**. Struktur ini dirancang agar proses sinkronisasi bulk (Bulk Sync) dari sisi Google Apps Script (GAS) dapat berjalan secara efisien, terstruktur, dan mudah dibaca.

---

## 1. Arsitektur Lembar Kerja (Sheets)

Untuk menghindari penumpukan data JSON di satu kolom (seperti log `DatabaseSiasat`), idealnya Anda memisahkan data ke dalam beberapa *sheet* (tab) yang merepresentasikan entitas data di frontend.

Buat *sheet* dengan nama persis seperti di bawah ini beserta kolom baris pertamanya (Header):

### A. Sheet `AuthGuru` (Untuk Autentikasi WhatsApp)
Digunakan untuk mencatat sesi login dan kode OTP guru.
*   **Kolom:** 
    1. `WhatsApp`
    2. `OTP`
    3. `Status` (Pending / Active)
    4. `Timestamp`
    5. `Expired` (Timestamp kadaluarsa OTP)
    6. `AuthToken` (UUID sesi)

### B. Sheet `DataSiswa`
Master data siswa yang diampu.
*   **Kolom:** 
    1. `ID_Siswa`
    2. `NIS`
    3. `NamaLengkap`
    4. `Kelas`
    5. `JenisKelamin` (L/P)

### C. Sheet `Jadwal`
Jadwal mengajar rutin.
*   **Kolom:** 
    1. `ID_Jadwal`
    2. `Hari`
    3. `Jam` (Misal: 07:00 - 08:30)
    4. `MataPelajaran`
    5. `Kelas`

### D. Sheet `Absensi`
Rekam jejak kehadiran siswa per pertemuan.
*   **Kolom:** 
    1. `ID_Absensi`
    2. `Tanggal` (ISO Date)
    3. `ID_Siswa`
    4. `NamaSiswa`
    5. `Status` (Hadir/Izin/Sakit/Alpa)
    6. `Keterangan`
    7. `MataPelajaran`

### E. Sheet `Penilaian`
Rekap nilai tugas, ulangan, atau ujian.
*   **Kolom:** 
    1. `ID_Nilai`
    2. `Tanggal`
    3. `ID_Siswa`
    4. `NamaSiswa`
    5. `JenisTugas` (Ulangan Harian, UTS, Tugas 1, dll)
    6. `Nilai` (Angka)
    7. `Catatan`
    8. `MataPelajaran`

### F. Sheet `Agenda` (Jurnal Mengajar)
Log aktivitas atau jurnal harian guru.
*   **Kolom:** 
    1. `ID_Agenda`
    2. `Tanggal`
    3. `Kelas`
    4. `TopikPelajaran`
    5. `Target`
    6. `Pencapaian`
    7. `Kendala`

### G. Sheet `Bimbingan`
Catatan konseling atau bimbingan khusus dengan siswa.
*   **Kolom:** 
    1. `ID_Bimbingan`
    2. `Tanggal`
    3. `ID_Siswa`
    4. `NamaSiswa`
    5. `TopikBimbingan`
    6. `HasilKonseling`
    7. `TindakLanjut`

---

## 2. Strategi Bulk Sync di Google Apps Script (GAS)

Saat ini, aplikasi mengirimkan data menggunakan event logging JSON (menyimpan seluruh payload sebagai string JSON di kolom). Agar *spreadsheet* dapat dibaca layaknya database relasional (dan diolah di Looker Studio/Excel), metode `doPost` di Google Apps Script harus melakukan proses **UPSERT (Update or Insert)**.

### Konsep Logika GAS (Upsert Logic):
1. **Terima Payload JSON:** Frontend memanggil `bulk_sync` dengan membawa kumpulan *Array* dari masing-masing entitas (Absensi, Nilai, dll).
2. **Parsing Data:** GAS membaca `JSON.parse(payload)`.
3. **Pencarian Index (Find by ID):** Untuk setiap record dalam payload, GAS mencari berdasarkan kolom pertama (`ID_...`) di masing-masing *sheet*.
4. **Update / Append:**
    * Jika `ID` ditemukan pada baris tertentu: GAS menimpa/memperbarui (*overwrite*) baris tersebut dengan data baru.
    * Jika `ID` tidak ditemukan: GAS melakukan `appendRow` (menambah baris baru di bawah).

### Keuntungan Pendekatan Ini:
*   **Dapat Dibaca Manusia:** Kepala sekolah atau admin dapat langsung membuka Google Sheets, memfilter nama siswa, dan melihat nilai tanpa harus mengerti kode JSON.
*   **Efisien:** Tidak ada redundansi/duplikasi data yang menumpuk seiring waktu. Setiap data yang di-edit di aplikasi akan meng-update baris yang tepat di *sheet*.
*   **Siap untuk Analitik:** Struktur kolom-baris klasik ini 100% kompatibel jika ingin disambungkan ke Google Looker Studio atau diekspor ke format CSV.

---
*Dokumen ini dapat digunakan sebagai referensi bagi developer atau admin yang mengelola Google Apps Script di masa depan.*
