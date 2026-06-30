import React, { useState } from "react";
import { 
  Star, 
  Send, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  Info,
  Download
} from "lucide-react";
import { Student, ClassInfo, GradeRecord, GradeItem } from "../types";
import { exportToExcel, exportToCSV, exportToPDF, exportVisualToPDF } from "../utils/exportUtils";
import { motion } from "motion/react";

interface PenilaianViewProps {
  students: Student[];
  classes: ClassInfo[];
  records: GradeRecord[];
  onSave: (classId: string, subject: string, grades: GradeItem[]) => Promise<boolean>;
  isSyncing: boolean;
  teacherSubject?: string;
}

export default function PenilaianView({ students, classes, records, onSave, isSyncing, teacherSubject }: PenilaianViewProps) {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || "");
  const [subject, setSubject] = useState<string>(teacherSubject || "Ilmu Pengetahuan Alam (IPA)");
  const [gradesInput, setGradesInput] = useState<Record<string, { t1: number, t2: number, uts: number, uas: number }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const subjects = [
    "Ilmu Pengetahuan Alam (IPA)",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Matematika",
    "Pendidikan Pancasila (PPKn)"
  ];

  const getFilteredStudents = (): Student[] => {
    return students.filter(s => s.classId === selectedClass);
  };

  const filteredStudents = getFilteredStudents();

  // Handle setting score in state
  const handleScoreChange = (studentId: string, field: 't1' | 't2' | 'uts' | 'uas', value: string) => {
    let numericValue = parseInt(value);
    if (isNaN(numericValue)) return; // Allow empty initially or 0
    const numeric = Math.min(100, Math.max(0, numericValue));
    
    setGradesInput(prev => ({
      ...prev,
      [studentId]: {
        t1: prev[studentId]?.t1 || 0,
        t2: prev[studentId]?.t2 || 0,
        uts: prev[studentId]?.uts || 0,
        uas: prev[studentId]?.uas || 0,
        ...prev[studentId],
        [field]: numeric
      }
    }));
  };

  // Quick fill grade for all
  const handleQuickFill = (score: number) => {
    const nextGrades: Record<string, { t1: number, t2: number, uts: number, uas: number }> = {};
    filteredStudents.forEach(st => {
      nextGrades[st.id] = {
        t1: score,
        t2: score,
        uts: score,
        uas: score
      };
    });
    setGradesInput(nextGrades);
  };

  // Get score for student
  const getScore = (studentId: string, field: 't1' | 't2' | 'uts' | 'uas'): number => {
    if (gradesInput[studentId]) {
      return gradesInput[studentId][field];
    }
    return 75; // Pre-populate default average passing score
  };

  // Calculate student average
  const getAverage = (studentId: string) => {
    const t1 = getScore(studentId, 't1');
    const t2 = getScore(studentId, 't2');
    const uts = getScore(studentId, 'uts');
    const uas = getScore(studentId, 'uas');
    return Math.round((t1 + t2 + uts + uas) / 4);
  };

  const handleSaveGrades = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const payload: GradeItem[] = filteredStudents.map(st => ({
      studentId: st.id,
      task1: getScore(st.id, 't1'),
      task2: getScore(st.id, 't2'),
      uts: getScore(st.id, 'uts'),
      uas: getScore(st.id, 'uas')
    }));

    try {
      const success = await onSave(selectedClass, subject, payload);
      if (success) {
        setStatusMessage({
          type: 'success',
          text: `Leger Penilaian kelas ${selectedClass} mata pelajaran ${subject} berhasil disimpan!`
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: "Berkas Leger disimpan di penyimpanan lokal secara aman (menunggu singkronisasi)."
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Error: ${err.message || "Gagal menyimpan penilaian"}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
    if (records.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }

    const exportData = records.flatMap(rec => {
      return rec.grades.map(g => {
        const studentName = students.find(s => s.id === g.studentId)?.name || g.studentId;
        const avg = Math.round((g.task1 + g.task2 + g.uts + g.uas) / 4);
        return {
          'Tanggal': rec.submittedAt.split(" ")[0],
          'Kelas': rec.classId,
          'Mata Pelajaran': rec.subject,
          'Nama Siswa': studentName,
          'Tugas 1': g.task1,
          'Tugas 2': g.task2,
          'UTS': g.uts,
          'UAS': g.uas,
          'Rata-rata': avg,
          'Hasil': avg >= 75 ? 'LULUS' : 'REMEDIAL'
        };
      });
    });

    if (format === 'xlsx') {
      exportToExcel(exportData, 'Laporan_Penilaian');
    } else if (format === 'csv') {
      exportToCSV(exportData, 'Laporan_Penilaian');
    } else if (format === 'pdf') {
      const headers = ['Tanggal', 'Kelas', 'Mapel', 'Siswa', 'T1', 'T2', 'UTS', 'UAS', 'Rata-rata', 'Hasil'];
      const body = exportData.map(d => [
        d.Tanggal,
        d.Kelas,
        d['Mata Pelajaran'],
        d['Nama Siswa'],
        d['Tugas 1'].toString(),
        d['Tugas 2'].toString(),
        d.UTS.toString(),
        d.UAS.toString(),
        d['Rata-rata'].toString(),
        d.Hasil
      ]);
      exportToPDF(headers, body, 'Laporan_Penilaian', 'Laporan Leger Penilaian Siswa');
    }
  };

  return (
    <div className="space-y-6" id="penilaian-view-wrapper">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-blue-400" /> Leger Penilaian Guru
        </h2>
        <p className="text-xs text-white/50 font-sans mt-0.5">
          Atur nilai tugas harian, PTS, dan PAS siswa, lalu hitung rata-rata kelulusan secara otomatis.
        </p>
      </div>

      {statusMessage && (
        <div 
          className={`p-4 rounded-xl flex items-start gap-3 text-sm leading-relaxed ${
            statusMessage.type === 'success' 
              ? 'bg-blue-500/10 text-blue-200 border border-blue-500/20' 
              : 'bg-red-500/10 text-red-300 border border-red-500/20'
          }`}
          id="status-penilaian"
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{statusMessage.type === 'success' ? 'Berhasil' : 'Gagal'}</p>
            <p className="text-xs">{statusMessage.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="penilaian-layout-grid">
        {/* Core Leger input table */}
        <div className="lg:col-span-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6" id="penilaian-form-panel">
          <form onSubmit={handleSaveGrades} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="penilaian-filters">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase tracking-wider">Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setGradesInput({});
                  }}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-[#1e293b]/75 transition-colors font-sans"
                >
                  {classes.map(cl => (
                    <option key={cl.id} value={cl.id} className="bg-slate-900 text-white">{cl.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase tracking-wider">Mata Pelajaran</label>
                {teacherSubject ? (
                  <div className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white/70 font-sans cursor-not-allowed">
                    {teacherSubject}
                  </div>
                ) : (
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setGradesInput({});
                    }}
                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-[#1e293b]/75 transition-colors font-sans"
                  >
                    {subjects.map(sub => (
                      <option key={sub} value={sub} className="bg-slate-900 text-white">{sub}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Quick action triggers */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-500/10 p-3.5 rounded-xl border border-blue-500/20" id="quick-fill-grades">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-blue-200">Preset Cepat:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill(80)}
                  className="text-xxs font-bold text-white bg-blue-600 hover:bg-blue-550 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-md"
                >
                  Setel Nilai Guru 80
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill(90)}
                  className="text-xxs font-bold text-white bg-blue-600 hover:bg-blue-550 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-md"
                >
                  Setel Nilai Berbakat 90
                </button>
              </div>
            </div>

            {/* Spreadsheet Form Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5" id="grades-table-container">
              <table className="w-full text-left text-sm font-sans" id="grades-table">
                <thead className="bg-white/5 text-xs font-bold text-white/40 uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-3 w-10 text-center">No</th>
                    <th className="py-3.5 px-3 min-w-[150px]">Siswa</th>
                    <th className="py-3.5 px-2 w-16 text-center border-l border-white/5">Tugas 1</th>
                    <th className="py-3.5 px-2 w-16 text-center border-l border-white/5">Tugas 2</th>
                    <th className="py-3.5 px-2 w-16 text-center border-l border-white/5">UTS</th>
                    <th className="py-3.5 px-2 w-16 text-center border-l border-white/5">UAS</th>
                    <th className="py-3.5 px-3 w-20 text-center bg-white/5 border-l border-white/5">Rata-rata</th>
                    <th className="py-3.5 px-3 w-24 text-center border-l border-white/5">Hasil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((st, idx) => {
                    const average = getAverage(st.id);
                    const isPassing = average >= 75; // KKM = 75

                    return (
                      <tr key={st.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-xs text-white/30">{idx + 1}</td>
                        <td className="py-3 px-3 font-medium text-white/90">{st.name}</td>
                        
                        {/* Tugas 1 */}
                        <td className="py-2 px-1 border-l border-white/5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={getScore(st.id, 't1')}
                            onChange={(e) => handleScoreChange(st.id, 't1', e.target.value)}
                            className="w-14 mx-auto text-center font-mono text-xs bg-slate-900/50 hover:bg-slate-900/80 border border-white/10 rounded focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors py-1 px-1 text-white"
                          />
                        </td>

                        {/* Tugas 2 */}
                        <td className="py-2 px-1 border-l border-white/5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={getScore(st.id, 't2')}
                            onChange={(e) => handleScoreChange(st.id, 't2', e.target.value)}
                            className="w-14 mx-auto text-center font-mono text-xs bg-slate-900/50 hover:bg-slate-900/80 border border-white/10 rounded focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors py-1 px-1 text-white"
                          />
                        </td>

                        {/* UTS */}
                        <td className="py-2 px-1 border-l border-white/5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={getScore(st.id, 'uts')}
                            onChange={(e) => handleScoreChange(st.id, 'uts', e.target.value)}
                            className="w-14 mx-auto text-center font-mono text-xs bg-slate-900/50 hover:bg-slate-900/80 border border-white/10 rounded focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors py-1 px-1 text-white"
                          />
                        </td>

                        {/* UAS */}
                        <td className="py-2 px-1 border-l border-white/5">
                          <input
                            type="number"
                            min="0"
max="100"
                            value={getScore(st.id, 'uas')}
                            onChange={(e) => handleScoreChange(st.id, 'uas', e.target.value)}
                            className="w-14 mx-auto text-center font-mono text-xs bg-slate-900/50 hover:bg-slate-900/80 border border-white/10 rounded focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors py-1 px-1 text-white"
                          />
                        </td>

                        {/* Rata-Rata */}
                        <td className="py-2 px-3 text-center bg-white/5 border-l border-white/5">
                          <span className={`font-mono font-bold text-xs ${
                            isPassing ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {average}
                          </span>
                        </td>

                        {/* Hasil (Status KKM) */}
                        <td className="py-2 px-3 text-center border-l border-white/5">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-xxs font-bold ${
                            isPassing 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {isPassing ? 'LULUS' : 'REMEDIAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 text-white text-sm px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-950/25 active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Mengunggah..." : "Simpan Penilaian Leger"}
              </button>
            </div>
          </form>
        </div>

        {/* History of Grades uploads sidebar */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl h-fit space-y-4" id="grades-history-container">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white/55 font-mono uppercase tracking-wider flex items-center gap-1">
              <FileSpreadsheet className="w-4 h-4 text-blue-400 animate-pulse" /> Daftar Unggahan
            </h3>
            {records.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xxs font-mono text-white/40 uppercase w-full mb-0.5">Export Laporan:</span>
                <button onClick={() => handleExport('xlsx')} className="flex-1 text-xxs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 py-1.5 rounded transition-colors flex items-center justify-center gap-1"><Download className="w-3 h-3" /> XLSX</button>
                <button onClick={() => handleExport('csv')} className="flex-1 text-xxs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 py-1.5 rounded transition-colors flex items-center justify-center gap-1"><Download className="w-3 h-3" /> CSV</button>
                <button onClick={() => handleExport('pdf')} className="flex-1 text-xxs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 py-1.5 rounded transition-colors flex items-center justify-center gap-1"><Download className="w-3 h-3" /> PDF Tabel</button>
                <button onClick={() => exportVisualToPDF('grades-history-container', 'Laporan_Visual_Penilaian')} className="flex-1 text-xxs font-bold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 py-1.5 rounded transition-colors flex items-center justify-center gap-1"><Download className="w-3 h-3" /> PDF Visual</button>
              </div>
            )}
          </div>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {records.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-xs font-bold text-white/40">Belum Ada Leger</p>
                <p className="text-xxs text-white/30 pt-0.5">Penilaian baru akan tercantum di sini.</p>
              </div>
            ) : (
              records.map(rec => (
                <div 
                  key={rec.id}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs space-y-1.5 transition-colors text-white"
                >
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Kelas {rec.classId}</span>
                    <span className="text-xxs font-mono font-medium text-white/40">{rec.submittedAt.split(" ")[0]}</span>
                  </div>
                  <div className="text-xxs text-white/60 truncate font-medium">
                    Mapel: {rec.subject}
                  </div>
                  <div className="flex items-center justify-between text-xxs text-white/40 pt-1 border-t border-white/5">
                    <span>Siswa: {rec.grades.length}</span>
                    <span className="text-blue-400 font-medium bg-blue-500/10 px-1.5 py-0.5 border border-blue-500/20 rounded font-mono font-bold">TERKIRIM</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
