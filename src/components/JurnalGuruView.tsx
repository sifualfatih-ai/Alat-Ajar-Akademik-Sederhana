import React, { useState } from "react";
import { 
  BookOpen, 
  Plus, 
  Send, 
  Calendar,
  Download,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { ClassInfo, TeacherJournalRecord } from "../types";
import { exportToExcel, exportToCSV, exportToPDF } from "../utils/exportUtils";
import { motion } from "motion/react";
import ExportDropdown from "./ExportDropdown";

interface JurnalGuruViewProps {
  classes: ClassInfo[];
  records: TeacherJournalRecord[];
  onAddJournal: (journal: Omit<TeacherJournalRecord, 'id' | 'submittedAt'>) => Promise<boolean>;
}

export default function JurnalGuruView({ classes, records, onAddJournal }: JurnalGuruViewProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [classId, setClassId] = useState<string>(classes[0]?.id || "");
  const [notes, setNotes] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes) return;

    setIsSubmitting(true);
    try {
      await onAddJournal({
        date,
        classId,
        notes,
      });
      setNotif("Jurnal/Refleksi harian berhasil diunggah!");
      setNotes("");
      setTimeout(() => setNotif(null), 3000);
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
    if (records.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }

    const exportData = records.map(rec => ({
      'Tanggal': rec.date,
      'Kelas': rec.classId,
      'Catatan': rec.notes || '-'
    }));

    if (format === 'xlsx') {
      exportToExcel(exportData, 'Laporan_Jurnal_Guru');
    } else if (format === 'csv') {
      exportToCSV(exportData, 'Laporan_Jurnal_Guru');
    } else if (format === 'pdf') {
      const headers = ['Tanggal', 'Kelas', 'Catatan'];
      const body = exportData.map(d => [
        d.Tanggal,
        d.Kelas,
        d.Catatan
      ]);
      exportToPDF(headers, body, 'Laporan_Jurnal_Guru', 'Laporan Jurnal Guru & Refleksi Kelas');
    }
  };

  return (
    <div className="space-y-6" id="jurnal-guru-view-wrapper">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" /> Jurnal Guru
        </h2>
        <p className="text-xs text-white/50 font-sans mt-0.5">
          Catat refleksi harian atau dinamika kelas yang tidak termasuk dalam agenda formal.
        </p>
      </div>

      {notif && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {notif}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl h-fit"
        >
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
            <Plus className="w-5 h-5 text-indigo-400" />
            <h3 className="text-white font-medium font-sans">Tambah Refleksi Baru</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Tanggal</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Kelas Terkait</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-sm appearance-none"
              >
                <option value="">-- Tanpa Kelas Spesifik --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.id} - {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Catatan/Refleksi</label>
              <textarea
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Diskusi kelompok berjalan sangat baik hari ini, beberapa siswa kurang aktif."
                className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl px-4 py-3 h-32 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-sm resize-none leading-relaxed placeholder:text-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !notes}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Simpan Catatan</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Riwayat Jurnal Guru
            </h3>
            
            {records.length > 0 && (
              <ExportDropdown
                options={[
                  { id: 'xlsx', label: 'XLSX (Excel)', icon: FileSpreadsheet, color: 'text-emerald-400', onClick: () => handleExport('xlsx') },
                  { id: 'csv', label: 'CSV Data', icon: FileText, color: 'text-amber-400', onClick: () => handleExport('csv') },
                  { id: 'pdf-table', label: 'PDF Laporan', icon: FileText, color: 'text-rose-400', onClick: () => handleExport('pdf') },
                ]}
              />
            )}
          </div>

          <div className="space-y-4">
            {records.length === 0 ? (
              <div className="text-center py-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
                <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/50 text-sm">Belum ada catatan jurnal yang ditambahkan</p>
              </div>
            ) : (
              records.map((rec) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={rec.id} 
                  className="backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-sm flex flex-col sm:flex-row gap-4 justify-between group hover:bg-white/10 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {rec.date}
                      </span>
                      {rec.classId && (
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          Kelas: {rec.classId}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-white/90 leading-relaxed">
                      {rec.notes}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
