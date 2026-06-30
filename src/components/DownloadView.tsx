import React, { useState, useRef, useEffect } from "react";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Info, 
  Trash2,
  ExternalLink,
  FolderOpen,
  ArrowDownToLine,
  Eye,
  Upload
} from "lucide-react";
import { SchoolSettings, AttendanceRecord, GradeRecord, Student, ClassInfo } from "../types";
import { exportToPDF, exportToCSV, exportVisualToPDF } from "../utils/exportUtils";
import { motion, AnimatePresence } from "motion/react";

interface DownloadViewProps {
  settings: SchoolSettings;
  attendanceRecords?: AttendanceRecord[];
  gradeRecords?: GradeRecord[];
  students?: Student[];
  classes?: ClassInfo[];
}

export interface SharedDocument {
  id: string;
  title: string;
  format: string;
  size: string;
  category: string;
  uploader: string;
  date: string;
}

export default function DownloadView({ 
  settings, 
  attendanceRecords = [], 
  gradeRecords = [],
  students = [],
  classes = []
}: DownloadViewProps) {
  const [documents, setDocuments] = useState<SharedDocument[]>(() => {
    const defaultDocs = [
      {
        id: "preset-1",
        title: "Silabus Kurikulum Merdeka - IPA Kelas VII",
        format: "PDF",
        size: "1.4 MB",
        category: "Silabus",
        uploader: "Admin Sekolah",
        date: "2024-05-10"
      },
      {
        id: "preset-2",
        title: "Alur Tujuan Pembelajaran (ATP) - IPA Fase D",
        format: "DOCX",
        size: "820 KB",
        category: "ATP",
        uploader: "Admin Sekolah",
        date: "2024-05-12"
      },
      {
        id: "preset-3",
        title: "Template Spreadsheet Leger Penilaian Excel",
        format: "XLSX",
        size: "340 KB",
        category: "Template Nilai",
        uploader: "Admin Sekolah",
        date: "2024-05-15"
      },
      {
        id: "preset-4",
        title: "Template RPP (Rencana Pelaksanaan Pembelajaran)",
        format: "DOCX",
        size: "450 KB",
        category: "Template RPP",
        uploader: "Admin Sekolah",
        date: "2024-06-29"
      }
    ];

    const saved = localStorage.getItem("sg_shared_documents");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.some((d: SharedDocument) => d.id === "preset-4")) {
          return [defaultDocs[3], ...parsed];
        }
        return parsed;
      } catch (e) {
        return defaultDocs;
      }
    }
    return defaultDocs;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("sg_shared_documents", JSON.stringify(documents));
  }, [documents]);

  const triggerDownload = (doc: SharedDocument) => {
    const textStr = `Isi Dokumen Simulasi:\n${doc.title}\nKategori: ${doc.category}\nDiunduh dari Guru Digital Indonesia - ${settings.schoolName}.`;
    const element = document.createElement("a");
    const file = new Blob([textStr], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/\s+/g, "_")}.${doc.format.toLowerCase()}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      const sizeKB = (file.size / 1024).toFixed(0);
      const sizeStr = parseInt(sizeKB) > 1024 ? `${(parseInt(sizeKB) / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

      const newDoc: SharedDocument = {
        id: `doc-${Date.now()}`,
        title: file.name,
        format: extension,
        size: sizeStr,
        category: "Materi Baru",
        uploader: settings.teacherName || "Guru",
        date: new Date().toISOString().split("T")[0]
      };

      setDocuments(prev => [newDoc, ...prev]);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const exportAttendancePDF = () => {
    if (attendanceRecords.length === 0) return;
    const headers = ["Tanggal", "Kelas", "Hadir", "Sakit", "Izin", "Alpa"];
    const body = attendanceRecords.map(r => {
      const counts = { H: 0, S: 0, I: 0, A: 0 };
      r.students.forEach(s => { counts[s.status]++; });
      return [r.date, r.classId, counts.H, counts.S, counts.I, counts.A];
    });
    exportToPDF(headers, body, `Laporan_Absensi_${settings.schoolName}`, "Laporan Absensi Siswa");
  };

  const exportGradesPDF = () => {
    if (gradeRecords.length === 0) return;
    const headers = ["Tanggal", "Mata Pelajaran", "Kelas", "Jumlah Nilai Masuk"];
    const body = gradeRecords.map(r => [
      r.submittedAt.split('T')[0],
      r.subject,
      r.classId,
      r.grades.length
    ]);
    exportToPDF(headers, body, `Laporan_Penilaian_${settings.schoolName}`, "Laporan Penilaian Siswa");
  };

  const exportAttendanceCSV = () => {
    if (attendanceRecords.length === 0) return;
    const data = attendanceRecords.map(r => {
      const counts = { H: 0, S: 0, I: 0, A: 0 };
      r.students.forEach(s => { counts[s.status]++; });
      return {
        Tanggal: r.date,
        Kelas: r.classId,
        Hadir: counts.H,
        Sakit: counts.S,
        Izin: counts.I,
        Alpa: counts.A
      };
    });
    exportToCSV(data, `Laporan_Absensi_${settings.schoolName}`);
  };

  const exportGradesCSV = () => {
    if (gradeRecords.length === 0) return;
    const data = gradeRecords.map(r => ({
      Tanggal: r.submittedAt.split('T')[0],
      "Mata Pelajaran": r.subject,
      Kelas: r.classId,
      "Jumlah Nilai Masuk": r.grades.length
    }));
    exportToCSV(data, `Laporan_Penilaian_${settings.schoolName}`);
  };

  const [showLegerPreview, setShowLegerPreview] = useState(false);
  const [selectedLegerClass, setSelectedLegerClass] = useState<string>(classes[0]?.id || "");

  const getLegerData = () => {
    if (!selectedLegerClass) return [];
    
    // Filter records for the selected class
    const classGradeRecords = gradeRecords.filter(r => r.classId === selectedLegerClass);
    if (classGradeRecords.length === 0) return [];

    // Get all subjects evaluated
    const subjects = Array.from(new Set(classGradeRecords.map(r => r.subject)));
    
    // Aggregate grades per student
    const studentGradesMap = new Map<string, { [subject: string]: number }>();
    
    classGradeRecords.forEach(record => {
      record.grades.forEach(g => {
        if (!studentGradesMap.has(g.studentId)) {
          studentGradesMap.set(g.studentId, {});
        }
        // Simplified average calculation for the subject record
        const avg = (g.task1 + g.task2 + g.uts + g.uas) / 4;
        const current = studentGradesMap.get(g.studentId)!;
        
        if (current[record.subject]) {
          current[record.subject] = (current[record.subject] + avg) / 2; // naive average if multiple records
        } else {
          current[record.subject] = avg;
        }
      });
    });

    const legerRows = Array.from(studentGradesMap.entries()).map(([studentId, scores]) => {
      const student = students.find(s => s.id === studentId);
      let total = 0;
      subjects.forEach(sub => total += (scores[sub] || 0));
      return {
        studentId,
        studentName: student?.name || "Unknown",
        gender: student?.gender || "-",
        scores,
        total,
        average: total / subjects.length
      };
    });

    return { subjects, rows: legerRows.sort((a, b) => b.total - a.total) }; // Sort by rank
  };

  return (
    <div className="space-y-6" id="download-view-wrapper">
      
      <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-xs font-bold text-white/50 font-mono uppercase tracking-wider">Cetak Laporan Administratif (PDF & CSV)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-300 font-bold mb-1 text-sm">
                <FileText className="w-4 h-4" /> Laporan Absensi
              </div>
              <p className="text-xs text-white/50">Cetak rekapitulasi data absensi siswa yang telah direkam.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={exportAttendancePDF}
                disabled={attendanceRecords.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-bold text-xs py-2 rounded-lg transition-colors border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button 
                onClick={exportAttendanceCSV}
                disabled={attendanceRecords.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 font-bold text-xs py-2 rounded-lg transition-colors border border-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 font-bold mb-1 text-sm">
                <FileSpreadsheet className="w-4 h-4" /> Laporan Penilaian
              </div>
              <p className="text-xs text-white/50">Cetak rekapitulasi data penilaian siswa yang telah direkam.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={exportGradesPDF}
                disabled={gradeRecords.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs py-2 rounded-lg transition-colors border border-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button 
                onClick={exportGradesCSV}
                disabled={gradeRecords.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 font-bold text-xs py-2 rounded-lg transition-colors border border-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-300 font-bold mb-1 text-sm">
                <FileSpreadsheet className="w-4 h-4" /> Template Leger/Rapor
              </div>
              <p className="text-xs text-white/50">Preview dan cetak leger nilai kumulatif per kelas dalam format PDF rapi.</p>
            </div>
            <button 
              onClick={() => setShowLegerPreview(true)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 font-bold text-xs py-2 rounded-lg transition-colors border border-purple-500/30"
            >
              <Eye className="w-3.5 h-3.5" /> Buka Preview
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-400" /> Berbagi Dokumen Ajar
          </h2>
          <p className="text-xs text-white/50 font-sans mt-0.5">
            Pusat berbagi dokumen modul ajar. Anda dapat mengunggah dan mengunduh berkas.
          </p>
        </div>
        
        <div>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all scale-active shadow-lg shadow-blue-900/20"
          >
            <Upload className="w-4 h-4" /> Unggah Dokumen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6" id="downloads-grid">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl space-y-4 text-white" id="preset-library">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-white/50 font-mono uppercase tracking-wider">Repositori Dokumen Bersama</h3>
            <span className="text-xxs text-white/40">Total: {documents.length} file</span>
          </div>

          <div className="divide-y divide-white/5" id="presets-list">
            {documents.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-xs">Belum ada dokumen.</div>
            ) : (
              documents.map(file => {
                const isExcel = file.format.includes('XLS');
                const isPdf = file.format.includes('PDF');
                return (
                  <div 
                    key={file.id}
                    className="py-3 flex items-center justify-between gap-4 text-xs font-sans group hover:bg-white/5 px-2 rounded-lg transition-colors text-white"
                  >
                    <div className="flex items-center gap-3 w-3/4">
                      <div className={`p-2.5 rounded-lg text-xs font-bold leading-none shrink-0 ${
                        isExcel 
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' 
                          : isPdf 
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' 
                          : 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                      }`}>
                        {isExcel ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>

                      <div className="space-y-0.5">
                        <p className="font-semibold text-white/90 group-hover:text-blue-300 transition-colors">{file.title}</p>
                        <div className="flex items-center gap-2 text-xxs text-white/40 flex-wrap">
                          <span className="font-mono bg-white/10 px-1 rounded uppercase tracking-wider">{file.format}</span>
                          <span>•</span>
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>Diunggah oleh: {file.uploader}</span>
                          <span>•</span>
                          <span>{file.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => triggerDownload(file)}
                        className="flex items-center gap-1 text-blue-300 bg-blue-600/20 hover:bg-blue-600/35 text-xxs px-3 py-1.5 rounded-lg font-bold border border-blue-500/20 transform transition-all active:scale-95 cursor-pointer"
                        title="Unduh File"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Unduh</span>
                      </button>
                      
                      {file.uploader === settings.teacherName && (
                        <button 
                          onClick={() => handleDelete(file.id)}
                          className="flex items-center gap-1 text-rose-300 bg-rose-600/20 hover:bg-rose-600/35 text-xxs px-2 py-1.5 rounded-lg font-bold border border-rose-500/20 transform transition-all active:scale-95 cursor-pointer"
                          title="Hapus File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLegerPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-purple-400" /> Preview Leger Nilai
                </h3>
                <div className="flex gap-2">
                  <select
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
                    value={selectedLegerClass}
                    onChange={(e) => setSelectedLegerClass(e.target.value)}
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => {
                      exportVisualToPDF('leger-preview-content', `Leger_Nilai_${classes.find(c => c.id === selectedLegerClass)?.name || 'Kelas'}`);
                    }}
                    disabled={!selectedLegerClass || getLegerData().rows.length === 0}
                    className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" /> Cetak PDF
                  </button>
                  <button 
                    onClick={() => setShowLegerPreview(false)}
                    className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-auto bg-slate-100 flex-1 relative">
                {selectedLegerClass ? (
                  getLegerData().rows.length > 0 ? (
                    <div id="leger-preview-content" className="bg-white p-8 max-w-4xl mx-auto shadow-sm text-slate-800 font-sans border border-slate-200">
                      <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
                        <h2 className="text-xl font-bold uppercase tracking-widest">{settings.schoolName}</h2>
                        <h3 className="text-lg font-semibold mt-1">LEGER NILAI SISWA</h3>
                        <p className="text-sm mt-2">Kelas: {classes.find(c => c.id === selectedLegerClass)?.name} | Wali Kelas: {settings.teacherName}</p>
                      </div>
                      
                      <table className="w-full text-xs border-collapse border border-slate-800">
                        <thead>
                          <tr className="bg-slate-200">
                            <th className="border border-slate-800 p-2 w-10 text-center">No</th>
                            <th className="border border-slate-800 p-2 text-left">Nama Siswa</th>
                            <th className="border border-slate-800 p-2 w-12 text-center">L/P</th>
                            {getLegerData().subjects.map((sub, idx) => (
                              <th key={idx} className="border border-slate-800 p-2 text-center w-20">
                                {sub.substring(0, 10)}{sub.length > 10 ? '...' : ''}
                              </th>
                            ))}
                            <th className="border border-slate-800 p-2 w-20 text-center font-bold">Total</th>
                            <th className="border border-slate-800 p-2 w-20 text-center font-bold">Rata-rata</th>
                            <th className="border border-slate-800 p-2 w-16 text-center font-bold">Rank</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getLegerData().rows.map((row, idx) => (
                            <tr key={row.studentId} className="hover:bg-slate-50">
                              <td className="border border-slate-800 p-2 text-center">{idx + 1}</td>
                              <td className="border border-slate-800 p-2">{row.studentName}</td>
                              <td className="border border-slate-800 p-2 text-center">{row.gender}</td>
                              {getLegerData().subjects.map((sub, sidx) => (
                                <td key={sidx} className="border border-slate-800 p-2 text-center">
                                  {row.scores[sub] ? row.scores[sub].toFixed(1) : '-'}
                                </td>
                              ))}
                              <td className="border border-slate-800 p-2 text-center font-bold">{row.total.toFixed(1)}</td>
                              <td className="border border-slate-800 p-2 text-center font-bold">{row.average.toFixed(1)}</td>
                              <td className="border border-slate-800 p-2 text-center font-bold">{idx + 1}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      <div className="mt-12 flex justify-between px-8 text-sm">
                        <div className="text-center">
                          <p>Mengetahui,</p>
                          <p>Kepala Sekolah</p>
                          <br /><br /><br />
                          <p className="border-b border-slate-800 inline-block min-w-[150px]"></p>
                        </div>
                        <div className="text-center">
                          <p>Diberikan di: .......................</p>
                          <p>Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                          <p>Wali Kelas</p>
                          <br /><br /><br />
                          <p className="border-b border-slate-800 inline-block min-w-[150px]">{settings.teacherName}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <FileSpreadsheet className="w-12 h-12 mb-2 opacity-20" />
                      <p>Belum ada data nilai untuk kelas ini.</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Info className="w-12 h-12 mb-2 opacity-20" />
                    <p>Pilih kelas terlebih dahulu untuk melihat leger.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
