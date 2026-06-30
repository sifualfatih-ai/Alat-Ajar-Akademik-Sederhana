import React, { useState } from "react";
import { Settings, Save, RotateCcw, CheckCircle, Info, RefreshCw, Loader2, XCircle, X } from "lucide-react";
import { SchoolSettings } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AdminViewProps {
  settings: SchoolSettings;
  onSaveSettings: (newSettings: SchoolSettings) => void;
  onResetSettings: () => void;
}

export default function AdminView({ settings, onSaveSettings, onResetSettings }: AdminViewProps) {
  const [logo, setLogo] = useState(settings.logo);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "");
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [teacherName, setTeacherName] = useState(settings.teacherName);
  const [subject, setSubject] = useState(settings.subject || "");
  const [dashboardTitle, setDashboardTitle] = useState(settings.dashboardTitle);
  const [description, setDescription] = useState(settings.description);
  const [address, setAddress] = useState(settings.address);
  
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      logo,
      logoUrl,
      schoolName,
      teacherName,
      subject,
      dashboardTitle,
      description,
      address,
    });
    showToast("Pengaturan sekolah dan guru berhasil disimpan.", "success");
  };

  const handleReset = () => {
    if (window.confirm("Apakah Anda yakin ingin menyetel ulang pengaturan ke nilai bawaan?")) {
      onResetSettings();
      // We will need to update local states after parent reset
      const defaultSettings = {
        logo: "GURU DIGITAL INDONESIA",
        logoUrl: "",
        schoolName: "PAUD PC Persis Coblong",
        teacherName: "Guru Indonensia",
        subject: "Pendidikan Agama",
        dashboardTitle: "Selamat Datang, Guru Indonensia",
        description: "Sistem Administrasi Guru",
        address: "Jalan Sadang Luhur No. 1 F Bandung 40134"
      };
      setLogo(defaultSettings.logo);
      setLogoUrl(defaultSettings.logoUrl);
      setSchoolName(defaultSettings.schoolName);
      setTeacherName(defaultSettings.teacherName);
      setSubject(defaultSettings.subject);
      setDashboardTitle(defaultSettings.dashboardTitle);
      setDescription(defaultSettings.description);
      setAddress(defaultSettings.address);

      showToast("Pengaturan telah disetel ulang ke nilai default.", "success");
    }
  };

  return (
    <div className="space-y-6" id="admin-view-wrapper">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold">{toast.type === 'success' ? 'Berhasil' : 'Peringatan'}</span>
              <span className="text-xs opacity-90">{toast.message}</span>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="ml-4 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 opacity-70" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" /> Halaman Admin & Pengaturan
        </h2>
        <p className="text-xs text-white/50 font-sans mt-0.5">
          Ubah konfigurasi profil instansi sekolah, nama guru, dan tampilan halaman utama secara real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="admin-layout-grid">
        {/* Settings Form */}
        <div className="lg:col-span-2 backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl space-y-6 text-white" id="admin-form-container">
          <h3 className="text-xs font-bold text-white/50 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-blue-400" /> Profil & Atribut Aplikasi
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Nama Guru</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Nama Guru"
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Mata Pelajaran</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Mata Pelajaran (Opsional)"
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 font-mono uppercase">Nama Sekolah / Instansi</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Nama Sekolah"
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Teks Logo Sidebar</label>
                <input
                  type="text"
                  required
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="Teks Logo (Default: GURU DIGITAL INDONESIA)"
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Link URL Gambar Logo</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="HTTPS Link URL Gambar Logo (contoh: https://...)"
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 font-mono uppercase">Judul Selamat Datang</label>
              <input
                type="text"
                required
                value={dashboardTitle}
                onChange={(e) => setDashboardTitle(e.target.value)}
                placeholder="Judul Dashboard Utama"
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 font-mono uppercase">Deskripsi / Subtitel Dashboard</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi Aplikasi"
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 font-mono uppercase">Alamat Lengkap</label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat Instansi"
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <div className="flex gap-3 pt-2 flex-wrap">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-950/25 active:scale-95 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Konfigurasi
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-white/60" />
                Setel Ulang Default
              </button>
            </div>
          </form>
        </div>

        {/* Info panel / Live preview state */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 h-fit text-white animate-pulse" id="admin-info-panel">
          <h3 className="text-xs font-bold text-white/55 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-400" /> Pratinjau Atribut Real-Time
          </h3>

          <div className="space-y-3 font-sans text-xs">
            <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-xxs font-mono text-white/40 uppercase">Logo Instansi</p>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Instansi" className="w-10 h-10 object-contain rounded-lg bg-slate-800 p-1" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
                    {logo ? logo.slice(0, 2) : "SG"}
                  </div>
                )}
                <div>
                  <p className="font-bold text-blue-300 text-sm m-0">{logo || 'Empty'}</p>
                  {logoUrl && <p className="text-xxs text-white/30 truncate max-w-[150px] m-0" title={logoUrl}>{logoUrl}</p>}
                </div>
              </div>
            </div>
            
            <div className="space-y-1 p-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-xxs font-mono text-white/40 uppercase">Guru Target</p>
              <p className="font-bold text-white text-sm">{teacherName || 'Empty'}</p>
            </div>

            <div className="space-y-1 p-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-xxs font-mono text-white/40 uppercase">Mata Pelajaran</p>
              <p className="font-bold text-emerald-300 text-sm">{subject || 'Kosong'}</p>
            </div>

            <div className="space-y-1 p-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-xxs font-mono text-white/40 uppercase">Nama Sekolah</p>
              <p className="font-semibold text-white">{schoolName || 'Empty'}</p>
            </div>

            <div className="space-y-1 p-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-xxs font-mono text-white/40 uppercase">Alamat</p>
              <p className="text-white/70 text-xxs font-sans">{address || 'Empty'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
