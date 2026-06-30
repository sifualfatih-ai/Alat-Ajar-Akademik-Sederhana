import React, { useMemo } from "react";
import { 
  Users, 
  Presentation, 
  BookOpen, 
  ClipboardCheck, 
  Star, 
  Clock, 
  NotebookPen, 
  Bot, 
  Download, 
  MapPin,
  RefreshCw,
  TrendingUp,
  BarChart2
} from "lucide-react";
import { motion } from "motion/react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

import { SchoolSettings, AttendanceRecord, GradeRecord } from "../types";

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  stats: {
    rombel: number;
    siswa: number;
  };
  isSyncing: boolean;
  onSync: () => void;
  settings: SchoolSettings;
  attendanceRecords: AttendanceRecord[];
  gradeRecords: GradeRecord[];
}

export default function DashboardView({ 
  onNavigate, 
  stats, 
  isSyncing, 
  onSync, 
  settings, 
  attendanceRecords, 
  gradeRecords 
}: DashboardViewProps) {

  const attendanceStats = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const monthMap: Record<string, { present: number, total: number }> = {};
    
    attendanceRecords.forEach(record => {
      const d = new Date(record.date);
      if (isNaN(d.getTime())) return;
      const monthStr = monthNames[d.getMonth()] + ' ' + d.getFullYear().toString().substring(2);
      
      if (!monthMap[monthStr]) monthMap[monthStr] = { present: 0, total: 0 };
      
      record.students.forEach(s => {
        if (s.status === 'H') monthMap[monthStr].present += 1;
        monthMap[monthStr].total += 1;
      });
    });
    
    return Object.keys(monthMap).map(m => ({
      name: m,
      persentase: Math.round((monthMap[m].present / monthMap[m].total) * 100)
    }));
  }, [attendanceRecords]);

  const averageGrades = useMemo(() => {
    const classMap: Record<string, { total: number, count: number }> = {};
    gradeRecords.forEach(record => {
      if (!classMap[record.classId]) classMap[record.classId] = { total: 0, count: 0 };
      
      record.grades.forEach(grade => {
        const avgGrade = (Number(grade.task1) + Number(grade.task2) + Number(grade.uts) + Number(grade.uas)) / 4;
        classMap[record.classId].total += avgGrade;
        classMap[record.classId].count += 1;
      });
    });
    
    return Object.keys(classMap).map(classId => ({
      name: classId,
      rataRata: Math.round(classMap[classId].total / classMap[classId].count)
    }));
  }, [gradeRecords]);

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden backdrop-blur-xl bg-white/5 text-white p-6 md:p-8 rounded-2xl border border-white/15 shadow-2xl"
        id="welcome-banner"
      >
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl transform translate-x-20 translate-y-20"></div>
        <div className="absolute left-1/3 top-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-white m-0">
              {settings.dashboardTitle}
            </h1>
            <div className="space-y-1">
              <p 
                className="text-blue-400 text-xs uppercase tracking-widest"
                style={{ fontFamily: "'Segoe UI', sans-serif", fontWeight: 400 }}
              >
                {settings.description}
              </p>
              <h2 className="text-lg md:text-xl font-sans font-semibold text-white/90">
                {settings.schoolName}
              </h2>
              <p className="text-white/70 text-xs flex items-center gap-1.5 font-sans leading-relaxed">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                {settings.address}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 text-white border border-blue-500/20 active:scale-95 transition-all text-xs px-4 py-2.5 rounded-xl self-start md:self-center font-sans font-bold tracking-wide cursor-pointer shadow-lg shadow-blue-900/25"
            id="sync-btn"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? "Sinkronisasi..." : "Sinkronkan Apps Script"}
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="stats-grid">
        {/* ROMBEL STAT CARD */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4 transition-all"
          id="stat-box-rombel"
        >
          <div className="p-3 bg-purple-500/15 text-purple-300 rounded-xl shrink-0 border border-purple-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-white/40 font-mono font-semibold uppercase tracking-wider">Rombel</p>
            <p className="text-2xl font-bold text-white font-sans tracking-tight">{stats.rombel}</p>
          </div>
        </motion.div>

        {/* SISWA STAT CARD */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4 transition-all"
          id="stat-box-siswa"
        >
          <div className="p-3 bg-emerald-500/15 text-emerald-300 rounded-xl shrink-0 border border-emerald-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-white/40 font-mono font-semibold uppercase tracking-wider">Siswa</p>
            <p className="text-2xl font-bold text-white font-sans tracking-tight">{stats.siswa}</p>
          </div>
        </motion.div>
      </div>

      {/* Visualisasi Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-grid">
        <motion.div 
          className="backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-lg border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans tracking-tight">Tren Kehadiran</h3>
              <p className="text-xs text-white/50">Persentase kehadiran bulanan siswa</p>
            </div>
          </div>
          
          <div className="h-56 w-full">
            {attendanceStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceStats} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#34d399' }}
                  />
                  <Line type="monotone" dataKey="persentase" name="Kehadiran (%)" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-white/40">
                Belum ada data absensi
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-500/15 text-purple-400 rounded-lg border border-purple-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans tracking-tight">Rata-rata Nilai</h3>
              <p className="text-xs text-white/50">Nilai rata-rata per kelas</p>
            </div>
          </div>
          
          <div className="h-56 w-full">
            {averageGrades.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={averageGrades} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#a855f7' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="rataRata" name="Nilai" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-white/40">
                Belum ada data nilai
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Menu Cepat (Quick Menu) */}
      <div className="space-y-4" id="quick-menu-section">
        <h3 className="text-xs font-bold text-white/50 font-sans tracking-wider uppercase flex items-center gap-2">
          <span>⊞</span> Menu Cepat
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="quick-menu-grid">
          {/* ABSENSI CARD */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("Absensi")}
            className="group text-left backdrop-blur-md bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all flex items-center gap-4 cursor-pointer"
            id="quick-absensi"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-300 rounded-xl group-hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-white/40 font-mono font-bold uppercase tracking-wider">Absensi</p>
              <p className="text-sm font-sans font-semibold text-white/90 group-hover:text-blue-400 transition-colors">Input Kehadiran</p>
            </div>
          </motion.button>

          {/* PENILAIAN CARD */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("Penilaian")}
            className="group text-left backdrop-blur-md bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all flex items-center gap-4 cursor-pointer"
            id="quick-penilaian"
          >
            <div className="p-3 bg-purple-500/10 text-purple-300 rounded-xl group-hover:bg-purple-500/20 transition-colors border border-purple-500/20">
              <Star className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-white/40 font-mono font-bold uppercase tracking-wider">Penilaian</p>
              <p className="text-sm font-sans font-semibold text-white/90 group-hover:text-blue-400 transition-colors">Leger Nilai</p>
            </div>
          </motion.button>

          {/* JADWAL CARD */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("Jadwal")}
            className="group text-left backdrop-blur-md bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all flex items-center gap-4 cursor-pointer"
            id="quick-jadwal"
          >
            <div className="p-3 bg-blue-500/10 text-blue-300 rounded-xl group-hover:bg-blue-500/20 transition-colors border border-blue-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-white/40 font-mono font-bold uppercase tracking-wider">Jadwal</p>
              <p className="text-sm font-sans font-semibold text-white/90 group-hover:text-blue-400 transition-colors">Mengajar & Jadwal</p>
            </div>
          </motion.button>

          {/* AGENDA CARD */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("Agenda")}
            className="group text-left backdrop-blur-md bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all flex items-center gap-4 cursor-pointer"
            id="quick-agenda"
          >
            <div className="p-3 bg-slate-500/10 text-slate-350 rounded-xl group-hover:bg-white/10 transition-colors border border-slate-500/20">
              <NotebookPen className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-white/40 font-mono font-bold uppercase tracking-wider">Agenda</p>
              <p className="text-sm font-sans font-semibold text-white/90 group-hover:text-blue-400 transition-colors">Jurnal Mengajar</p>
            </div>
          </motion.button>

          {/* GURU WALI CARD */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("Bimbingan")}
            className="group text-left backdrop-blur-md bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all flex items-center gap-4 cursor-pointer"
            id="quick-bimbingan"
          >
            <div className="p-3 bg-orange-500/10 text-orange-300 rounded-xl group-hover:bg-orange-500/20 transition-colors border border-orange-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-white/40 font-mono font-bold uppercase tracking-wider">Guru Wali</p>
              <p className="text-sm font-sans font-semibold text-white/90 group-hover:text-blue-400 transition-colors">Bimbingan Siswa</p>
            </div>
          </motion.button>

          {/* DOWNLOAD CARD */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("Download")}
            className="group text-left backdrop-blur-md bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all flex items-center gap-4 cursor-pointer sm:col-span-2 lg:col-span-3"
            id="quick-downloads"
          >
            <div className="p-2.5 bg-white/5 text-white/80 rounded-lg group-hover:bg-white/10 transition-all border border-white/10">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-white/40 font-mono font-bold uppercase tracking-wider">Perangkat Ajar</p>
              <p className="text-sm font-sans font-semibold text-white/95 group-hover:text-blue-400 transition-colors">Lihat & Download Berkas Kurikulum</p>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
