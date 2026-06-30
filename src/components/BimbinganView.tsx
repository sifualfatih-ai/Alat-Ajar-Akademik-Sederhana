import React, { useState } from "react";
import { 
  Users, 
  Send, 
  Plus, 
  HeartHandshake, 
  CheckCircle, 
  BookOpen,
  Calendar,
  MessageSquareDiff,
  Download,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { Student, ClassInfo, BimbinganRecord } from "../types";
import { exportToExcel, exportToCSV, exportToPDF } from "../utils/exportUtils";
import { motion } from "motion/react";
import ExportDropdown from "./ExportDropdown";

interface BimbinganViewProps {
  students: Student[];
  classes: ClassInfo[];
  records: BimbinganRecord[];
  onAddRecord: (record: Omit<BimbinganRecord, 'id' | 'submittedAt'>) => Promise<boolean>;
}

export default function BimbinganView({ students, classes, records, onAddRecord }: BimbinganViewProps) {
  const [studentId, setStudentId] = useState<string>(students[0]?.id || "");
  const [classId, setClassId] = useState<string>(classes[0]?.id || "");
  const [category, setCategory] = useState<'Akademik' | 'Pribadi' | 'Sosial' | 'Karier'>("Akademik");
  const [issue, setIssue] = useState<string>("");
  const [solution, setSolution] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !solution) return;

    setIsSubmitting(true);
    try {
      await onAddRecord({
        date,
        studentId,
        classId,
        category,
        issue,
        solution
      });
      setNotif("Catatan bimbingan siswa berhasil disimpan!");
      setIssue("");
      setSolution("");
      setTimeout(() => setNotif(null), 3000);
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStudentName = (id: string) => {
    return students.find(s => s.id === id)?.name || id;
  };

  const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
    if (records.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }

    const exportData = records.map(rec => ({
      'Tanggal': rec.date,
      'Siswa': getStudentName(rec.studentId),
      'Kelas': rec.classId,
      'Kategori': rec.category,
      'Catatan Kasus': rec.issue,
      'Solusi / Tindak Lanjut': rec.solution
    }));

    if (format === 'xlsx') {
      exportToExcel(exportData, 'Laporan_Bimbingan_Konseling');
    } else if (format === 'csv') {
      exportToCSV(exportData, 'Laporan_Bimbingan_Konseling');
    } else if (format === 'pdf') {
      const headers = ['Tanggal', 'Siswa', 'Kelas', 'Kategori', 'Kasus', 'Tindak Lanjut'];
      const body = exportData.map(d => [
        d.Tanggal,
        d.Siswa,
        d.Kelas,
        d.Kategori,
        d['Catatan Kasus'],
        d['Solusi / Tindak Lanjut']
      ]);
      exportToPDF(headers, body, 'Laporan_Bimbingan_Konseling', 'Laporan Jurnal Bimbingan & Konseling');
    }
  };

  return (
    <div className="space-y-6" id="bimbingan-view-wrapper">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-blue-400" /> Jurnal Bimbingan Wali Kelas
        </h2>
        <p className="text-xs text-white/50 font-sans mt-0.5">
          Pantau dan bimbing perkembangan akademik, sosial, dan kepribadian siswa asuh Anda.
        </p>
      </div>

      {notif && (
        <div className="p-3 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2 font-semibold" id="bimbingan-notif">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {notif}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="bimbingan-layout-grid">
        {/* Entry Form */}
        <div className="lg:col-span-2 backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl space-y-6 text-white" id="bimbingan-form">
          <h3 className="text-xs font-bold text-white/50 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquareDiff className="w-4 h-4 text-blue-400" /> Tambah Jurnal Konseling Siswa
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Nama Siswa</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                >
                  {students.map(st => (
                    <option key={st.id} value={st.id} className="bg-slate-900 text-white">{st.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Kelas</label>
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
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Kategori Bimbingan</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                >
                  <option value="Akademik" className="bg-slate-900 text-white">Akademik</option>
                  <option value="Pribadi" className="bg-slate-900 text-white">Pribadi / Emosi</option>
                  <option value="Sosial" className="bg-slate-900 text-white">Sosial / Pertemanan</option>
                  <option value="Karier" className="bg-slate-900 text-white">Bakat & Karier</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Tanggal Konseling</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans dark:[color-scheme:dark]"
                  />
                  <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 font-mono uppercase">Permasalahan / Hal yang dibahas</label>
              <textarea
                required
                rows={3}
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Tuliskan keluhan atau topik pembahasan konseling..."
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 font-mono uppercase">Tindak Lanjut / Rekomendasi Solusi</label>
              <textarea
                required
                rows={3}
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Langkah antisipasi, arahan guru, atau perjanjian tindak lanjut..."
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
                {isSubmitting ? "Menyimpan Catatan..." : "Simpan Catatan Bimbingan"}
              </button>
            </div>
          </form>
        </div>

        {/* Counseling history feed */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 h-fit text-white" id="bimbingan-feed-container">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white/55 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" /> Log Kasus & Konseling
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

          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1" id="bimbingan-scroller">
            {records.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-xs font-bold text-white/40">Belum Ada Catatan</p>
                <p className="text-xxs text-white/30 text-center">Entri konseling asuh baru akan ditampilkan disini.</p>
              </div>
            ) : (
              records.map(rec => {
                const categoryColor = 
                  rec.category === 'Akademik' ? 'bg-blue-500/15 text-blue-300 border-blue-500/20' :
                  rec.category === 'Pribadi' ? 'bg-rose-500/15 text-rose-300 border-rose-500/20' :
                  rec.category === 'Sosial' ? 'bg-purple-500/15 text-purple-300 border-purple-500/20' :
                  'bg-amber-500/15 text-amber-300 border-amber-500/20';

                return (
                  <div 
                    key={rec.id}
                    className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs space-y-2 transition-colors text-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-sans tracking-tight">
                        {getStudentName(rec.studentId)} ({rec.classId})
                      </span>
                      <span className="font-mono text-xxs text-white/40 flex items-center gap-1">
                        {rec.date}
                      </span>
                    </div>

                    <div className="flex">
                      <span className={`px-2 py-0.5 rounded-full text-xxs font-bold border ${categoryColor}`}>
                        Bimbingan {rec.category}
                      </span>
                    </div>

                    <div className="space-y-1 font-sans text-xxs pt-1">
                      <p className="text-white/70"><strong>Masalah:</strong> {rec.issue}</p>
                      <p className="text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <strong>Solusi:</strong> {rec.solution}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
