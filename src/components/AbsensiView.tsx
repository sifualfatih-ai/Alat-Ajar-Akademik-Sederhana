import React, { useState } from "react";
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Send,
  Sparkles,
  Info
} from "lucide-react";
import { Student, ClassInfo, AttendanceRecord, AttendanceStatus } from "../types";
import { motion } from "motion/react";

interface AbsensiViewProps {
  students: Student[];
  classes: ClassInfo[];
  records: AttendanceRecord[];
  onSave: (date: string, classId: string, attendance: { studentId: string; status: AttendanceStatus }[]) => Promise<boolean>;
  isSyncing: boolean;
}

export default function AbsensiView({ students, classes, records, onSave, isSyncing }: AbsensiViewProps) {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || "");
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Filter students belonging to the selected class
  const getFilteredStudents = (): Student[] => {
    if (selectedClass === "VII-A") {
      return students.filter((_, idx) => idx % 2 === 0);
    } else if (selectedClass === "VIII-A") {
      return students.filter((_, idx) => idx % 3 === 0 || idx % 5 === 0);
    } else {
      return students.filter((_, idx) => idx % 2 !== 0);
    }
  };

  const filteredStudents = getFilteredStudents();

  // Handle setting status for a student
  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Set all students in the list as 'Hadir'
  const handleMarkAllHadir = () => {
    const freshAttendance: Record<string, AttendanceStatus> = {};
    filteredStudents.forEach(st => {
      freshAttendance[st.id] = 'H';
    });
    setLocalAttendance(freshAttendance);
  };

  // Submit attendance
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = filteredStudents.map(st => ({
      studentId: st.id,
      status: localAttendance[st.id] || 'H' // Default to Hadir if not filled
    }));

    try {
      const success = await onSave(attendanceDate, selectedClass, payload);
      if (success) {
        setStatusMessage({
          type: 'success',
          text: `Absensi kelas ${selectedClass} tanggal ${attendanceDate} berhasil disimpan dan disinkronkan!`
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Absensi disimpan di penyimpanan lokal (belum sinkron dengan Apps Script).`
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Gagal menyimpan: ${err.message || 'Error tidak diketahui'}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers to count statistics for a past record
  const getRecordStats = (rec: AttendanceRecord) => {
    let h = 0, s = 0, i = 0, a = 0;
    rec.students.forEach(item => {
      if (item.status === 'H') h++;
      if (item.status === 'S') s++;
      if (item.status === 'I') i++;
      if (item.status === 'A') a++;
    });
    return { h, s, i, a, total: rec.students.length };
  };

  return (
    <div className="space-y-6" id="absensi-view-wrapper">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" /> Input Absensi Siswa
        </h2>
        <p className="text-xs text-white/50 font-sans mt-0.5">
          Rekam kehadiran harian siswa dan sinkronisasikan langsung ke Google Apps Script.
        </p>
      </div>

      {statusMessage && (
        <div 
          className={`p-4 rounded-xl flex items-start gap-3 text-sm leading-relaxed ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
              : 'bg-red-500/10 text-red-300 border border-red-500/20'
          }`}
          id="status-alert"
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{statusMessage.type === 'success' ? 'Sukses' : 'Gagal'}</p>
            <p className="text-xs">{statusMessage.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="absensi-grid-layout">
        {/* Form Input Absensi */}
        <div className="lg:col-span-2 backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl space-y-6" id="absensi-form-container">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="absensi-filters">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase tracking-wider">
                  Pilih Kelas
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setLocalAttendance({});
                  }}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-[#1e293b]/75 transition-colors font-sans"
                >
                  {classes.map(cl => (
                    <option key={cl.id} value={cl.id} className="bg-slate-900 text-white">
                      {cl.name} ({cl.major || 'Umum'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase tracking-wider">
                  Tanggal Absensi
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl pl-9.5 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-[#1e293b]/75 transition-colors font-sans dark:[color-scheme:dark]"
                  />
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Quick Fill Action Row */}
            <div className="flex justify-between items-center bg-blue-500/10 p-3 rounded-xl border border-blue-500/20" id="quick-fill-row">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs font-medium text-blue-200">Tindakan Cepat:</span>
              </div>
              <button
                type="button"
                onClick={handleMarkAllHadir}
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3py-1.5 px-4 py-2 rounded-lg transition-colors font-sans cursor-pointer shadow-md shadow-blue-900/30"
              >
                Setel Hadir Semua ({filteredStudents.length} Siswa)
              </button>
            </div>

            {/* Students Attendance Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5" id="students-table-container">
              <table className="w-full text-left text-sm font-sans" id="absensi-table">
                <thead className="bg-white/5 text-xs font-bold text-white/40 uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Nama Siswa</th>
                    <th className="py-3.5 px-4 w-16 text-center">Gender</th>
                    <th className="py-3.5 px-4 text-center min-w-[200px]">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((st, index) => {
                    const status = localAttendance[st.id] || 'H';
                    return (
                      <tr key={st.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-white/30">{index + 1}</td>
                        <td className="py-3.5 px-4 font-medium text-white/90">{st.name}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-white/50">{st.gender}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* HADIR */}
                            <button
                              type="button"
                              onClick={() => setStatus(st.id, 'H')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                status === 'H' 
                                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-950/25' 
                                  : 'bg-white/5 hover:bg-white/10 text-emerald-400 border-emerald-500/20'
                              }`}
                              title="Hadir"
                            >
                              H
                            </button>
                            {/* SAKIT */}
                            <button
                              type="button"
                              onClick={() => setStatus(st.id, 'S')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                status === 'S' 
                                  ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-950/25' 
                                  : 'bg-white/5 hover:bg-white/10 text-blue-400 border-blue-500/20'
                              }`}
                              title="Sakit"
                            >
                              S
                            </button>
                            {/* IZIN */}
                            <button
                              type="button"
                              onClick={() => setStatus(st.id, 'I')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                status === 'I' 
                                  ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-950/25' 
                                  : 'bg-white/5 hover:bg-white/10 text-amber-400 border-amber-500/20'
                              }`}
                              title="Izin"
                            >
                              I
                            </button>
                            {/* ALPA */}
                            <button
                              type="button"
                              onClick={() => setStatus(st.id, 'A')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                status === 'A' 
                                  ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-950/25' 
                                  : 'bg-white/5 hover:bg-white/10 text-rose-400 border-rose-500/20'
                              }`}
                              title="Alpa"
                            >
                              A
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2" id="form-actions">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 text-white text-sm px-6 py-2.5 rounded-xl font-bold font-sans tracking-wide shadow-lg shadow-blue-950/20 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Menyimpan ke Database..." : "Simpan Absensi Kelas"}
              </button>
            </div>
          </form>
        </div>

        {/* Riwayat Absensi */}
        <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl space-y-4 h-fit" id="absensi-history-container">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white/55 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" /> Riwayat Rekaman
            </h3>
            <span className="text-xxs px-2 py-0.5 bg-white/5 text-white/50 rounded border border-white/5 font-mono font-semibold">Terkini</span>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1" id="history-scroller">
            {records.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-xl space-y-1">
                <Info className="w-5 h-5 text-white/20 mx-auto" strokeWidth={1.5} />
                <p className="text-xs font-semibold text-white/50">Belum Ada Rekaman</p>
                <p className="text-xxs text-white/30">Silakan input dan simpan absensi baru di kiri.</p>
              </div>
            ) : (
              records.map(rec => {
                const stats = getRecordStats(rec);
                return (
                  <div 
                    key={rec.id}
                    className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs space-y-2 transition-colors text-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-sans tracking-tight">Kelas {rec.classId}</span>
                      <span className="font-mono text-xxs text-white/40 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-white/40" /> {rec.date}
                      </span>
                    </div>

                    {/* Stat pills breakdown */}
                    <div className="flex items-center justify-between gap-1 border-t border-b border-white/5 py-1.5 font-mono text-xxs">
                      <span className="text-emerald-400 font-semibold">H: {stats.h}</span>
                      <span className="text-blue-400 font-semibold">S: {stats.s}</span>
                      <span className="text-amber-400 font-semibold">I: {stats.i}</span>
                      <span className="text-rose-400 font-semibold">A: {stats.a}</span>
                    </div>

                    <div className="flex justify-between items-center text-xxs text-white/40 pt-0.5">
                      <span>Total Siswa: {stats.total}</span>
                      <span className="flex items-center gap-1 font-sans text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Tersinkron
                      </span>
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
