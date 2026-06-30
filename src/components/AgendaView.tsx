import React, { useState } from "react";
import { 
  NotebookPen, 
  Plus, 
  Send, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { ClassInfo, AgendaRecord } from "../types";
import { exportToExcel, exportToCSV, exportToPDF } from "../utils/exportUtils";
import { motion } from "motion/react";
import ExportDropdown from "./ExportDropdown";

interface AgendaViewProps {
  classes: ClassInfo[];
  records: AgendaRecord[];
  onAddAgenda: (agenda: Omit<AgendaRecord, 'id' | 'submittedAt'>) => Promise<boolean>;
}

export default function AgendaView({ classes, records, onAddAgenda }: AgendaViewProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [classId, setClassId] = useState<string>(classes[0]?.id || "");
  const [jam, setJam] = useState<string>("07:30 - 09:00");
  const [topic, setTopic] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [status, setStatus] = useState<'Selesai' | 'Tertunda' | 'Pengganti'>("Selesai");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsSubmitting(true);
    try {
      await onAddAgenda({
        date,
        classId,
        jam,
        topic,
        notes,
        status
      });
      setNotif("Jurnal Agenda pembelajaran baru berhasil diunggah!");
      setTopic("");
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
      'Waktu': rec.jam,
      'Kelas': rec.classId,
      'Status': rec.status,
      'Materi': rec.topic,
      'Catatan': rec.notes || '-'
    }));

    if (format === 'xlsx') {
      exportToExcel(exportData, 'Laporan_Jurnal_Mengajar');
    } else if (format === 'csv') {
      exportToCSV(exportData, 'Laporan_Jurnal_Mengajar');
    } else if (format === 'pdf') {
      const headers = ['Tanggal', 'Waktu', 'Kelas', 'Status', 'Materi', 'Catatan'];
      const body = exportData.map(d => [
        d.Tanggal,
        d.Waktu,
        d.Kelas,
        d.Status,
        d.Materi,
        d.Catatan
      ]);
      exportToPDF(headers, body, 'Laporan_Jurnal_Mengajar', 'Laporan Jurnal Agenda Mengajar');
    }
  };

  return (
    <div className="space-y-6" id="agenda-view-wrapper">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <NotebookPen className="w-5 h-5 text-blue-400" /> Jurnal Agenda Mengajar
        </h2>
        <p className="text-xs text-white/50 font-sans mt-0.5">
          Formulir agenda mengajar harian guru untuk mendokumentasikan capaian bab kurikulum dan kendala kelas.
        </p>
      </div>

      {notif && (
        <div className="p-3 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2 font-medium" id="agenda-notif">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {notif}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="agenda-layout-grid">
        {/* Agenda logging form */}
        <div className="lg:col-span-2 backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl space-y-6 text-white" id="agenda-form-container">
          <h3 className="text-xs font-bold text-white/50 font-mono uppercase tracking-wider">Catat Jurnal Agenda Hari Ini</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Tanggal Kegiatan</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:[color-scheme:dark]"
                  />
                  <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Kelas Pembelajaran</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                >
                  {classes.map(cl => (
                    <option key={cl.id} value={cl.id} className="bg-slate-900 text-white">{cl.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Waktu / Jam Ke-</label>
                <input
                  type="text"
                  required
                  value={jam}
                  onChange={(e) => setJam(e.target.value)}
                  placeholder="e.g. 07:30 - 09:00"
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Status Pembelajaran</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                >
                  <option value="Selesai" className="bg-slate-900 text-white">Selesai (Tuntas)</option>
                  <option value="Tertunda" className="bg-slate-900 text-white">Tertunda / Sakit</option>
                  <option value="Pengganti" className="bg-slate-900 text-white">Kelas Pengganti</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 font-mono uppercase">Materi Pembelajaran / Kompetensi Dasar</label>
              <textarea
                required
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Tuliskan bab atau kompetensi utama, misalnya: 'Sistem Organ Pencernaan Manusia: Enzim pencernaan'"
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 font-mono uppercase">Notes / Kendala / Catatan Kelas (Opsional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Komentar tambahan, misal: 'Tingkat fokus kelompok B berkurang di akhir sesi pembelajaran.'"
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 text-white text-xs px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-950/25 active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Mengunggah Agenda..." : "Simpan Berkas Agenda"}
              </button>
            </div>
          </form>
        </div>

        {/* Historic timeline agenda log */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 h-fit text-white" id="agenda-history">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white/55 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" /> Log Agenda Guru
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

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1" id="agenda-scroller">
            {records.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-xs font-bold text-white/40">Belum Ada Agenda</p>
                <p className="text-xxs text-white/30">Catatan pelajaran baru akan dideklarasikan di sini.</p>
              </div>
            ) : (
              records.map(rec => (
                <div 
                  key={rec.id}
                  className="relative pl-4 border-l-2 border-white/10 space-y-1.5 text-xs py-1"
                >
                  <span className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-blue-400 shadow shadow-blue-500"></span>
                  <div className="flex items-center justify-between font-mono text-xxs text-white/40">
                    <span>{rec.date} ({rec.jam})</span>
                    <span className={`px-1.5 py-0.5 rounded text-xxs leading-none font-bold ${
                      rec.status === 'Selesai' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                      rec.status === 'Tertunda' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    }`}>
                      {rec.status}
                    </span>
                  </div>
                  <div className="font-bold text-white/95 font-sans tracking-tight leading-tight">
                    Kelas {rec.classId} - {rec.topic}
                  </div>
                  {rec.notes && (
                    <div className="text-xxs text-white/50 bg-white/5 p-2 rounded border border-white/5 font-sans">
                      <strong>Catatan:</strong> {rec.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
