import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import AbsensiView from "./components/AbsensiView";
import PenilaianView from "./components/PenilaianView";
import JadwalView from "./components/JadwalView";
import AgendaView from "./components/AgendaView";
import BimbinganView from "./components/BimbinganView";
import DownloadView from "./components/DownloadView";
import AdminView from "./components/AdminView";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { 
  Student, 
  ClassInfo, 
  AttendanceRecord, 
  GradeRecord, 
  ScheduleItem, 
  AgendaRecord, 
  BimbinganRecord, 
  AttendanceStatus,
  GradeItem,
  SchoolSettings
} from "./types";
import { 
  Database, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  HelpCircle, 
  BookOpen,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Real-world Indonesian student roster (representing SMP N 3 Siberut)
const SEEDED_STUDENTS: Student[] = [
  { id: "st-01", name: "Ahmad Samallo", gender: "L" },
  { id: "st-02", name: "Bernadus Saleleubaja", gender: "L" },
  { id: "st-03", name: "Carolina Sakerebau", gender: "P" },
  { id: "st-04", name: "Darius Salakkopak", gender: "L" },
  { id: "st-05", name: "Elizabet Siritoitet", gender: "P" },
  { id: "st-06", name: "Fransiscus Saerejen", gender: "L" },
  { id: "st-07", name: "Grace Sababalat", gender: "P" },
  { id: "st-08", name: "Hendrikus Samangilailai", gender: "L" },
  { id: "st-09", name: "Irene Saruruk", gender: "P" },
  { id: "st-10", name: "Julius Salamanang", gender: "L" },
  { id: "st-11", name: "Kristina Tasiripoula", gender: "P" },
  { id: "st-12", name: "Martinus Sagurung", gender: "L" },
  { id: "st-13", name: "Natalia Silaing", gender: "P" },
  { id: "st-14", name: "Patrisius Sikeru", gender: "L" },
  { id: "st-15", name: "Ronaldi Saibi", gender: "L" }
];

const SEEDED_CLASSES: ClassInfo[] = [
  { id: "VII-A", name: "Kelas VII-A", major: "Kurikulum Merdeka" },
  { id: "VIII-A", name: "Kelas VIII-A", major: "Kurikulum Merdeka" },
  { id: "IX-A", name: "Kelas IX-A", major: "K-13 Terpadu" }
];

const SEEDED_SCHEDULE: ScheduleItem[] = [
  { id: "sch-1", day: "Senin", time: "07:30 - 09:00", classId: "VIII-A", subject: "Ilmu Pengetahuan Alam (IPA)", room: "Laboratorium IPA" },
  { id: "sch-2", day: "Senin", time: "09:15 - 10:45", classId: "VII-A", subject: "Ilmu Pengetahuan Alam (IPA)", room: "R. Kelas VII-A" },
  { id: "sch-3", day: "Selasa", time: "07:30 - 09:00", classId: "IX-A", subject: "Fisika & Biologi (IPA)", room: "Laboratorium IPA" },
  { id: "sch-4", day: "Rabu", time: "11:00 - 12:30", classId: "VII-A", subject: "Ilmu Pengetahuan Alam (IPA)", room: "R. Kelas VII-A" },
  { id: "sch-5", day: "Kamis", time: "07:30 - 09:00", classId: "VIII-A", subject: "Ilmu Pengetahuan Alam (IPA)", room: "Laboratorium IPA" },
  { id: "sch-6", day: "Jumat", time: "09:15 - 10:45", classId: "IX-A", subject: "Kajian Alam (IPA)", room: "R. Kelas IX-A" }
];

export default function App() {
  const [currentView, setCurrentView] = useState<string>("Dashboard");

  // School Profile Attr settings
  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem("sg_school_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default style
      }
    }
    return {
      logo: "SIASAT GURU",
      schoolName: "PAUD PC Persis Coblong",
      teacherName: "Guru Indonensia",
      dashboardTitle: "Selamat Datang, Guru Indonensia",
      description: "Sistem Administrasi Guru",
      address: "Jalan Sadang Luhur No. 1 F Bandung 40134"
    };
  });
  
  // App States
  const [students] = useState<Student[]>(SEEDED_STUDENTS);
  const [classes] = useState<ClassInfo[]>(SEEDED_CLASSES);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem("sg_schedule");
    return saved ? JSON.parse(saved) : SEEDED_SCHEDULE;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem("sg_attendance");
    return saved ? JSON.parse(saved) : [];
  });

  const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>(() => {
    const saved = localStorage.getItem("sg_grades");
    return saved ? JSON.parse(saved) : [];
  });

  const [agendaRecords, setAgendaRecords] = useState<AgendaRecord[]>(() => {
    const saved = localStorage.getItem("sg_agendas");
    return saved ? JSON.parse(saved) : [];
  });

  const [bimbinganRecords, setBimbinganRecords] = useState<BimbinganRecord[]>(() => {
    const saved = localStorage.getItem("sg_bimbingas");
    return saved ? JSON.parse(saved) : [];
  });

  // Connection & sync state with AppScript
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  // Modals view controllers
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showIntegrasiInfo, setShowIntegrasiInfo] = useState(false);

  // Sync state variables across sessions
  useEffect(() => {
    localStorage.setItem("sg_schedule", JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem("sg_attendance", JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem("sg_grades", JSON.stringify(gradeRecords));
  }, [gradeRecords]);

  useEffect(() => {
    localStorage.setItem("sg_agendas", JSON.stringify(agendaRecords));
  }, [agendaRecords]);

  useEffect(() => {
    localStorage.setItem("sg_bimbingas", JSON.stringify(bimbinganRecords));
  }, [bimbinganRecords]);

  useEffect(() => {
    localStorage.setItem("sg_school_settings", JSON.stringify(settings));
  }, [settings]);

  // Test Apps Script Connectivity on load
  useEffect(() => {
    const testConnection = async () => {
      try {
        const res = await fetch("/api/appscript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "test" })
        });
        const parse = await res.json();
        setIsConnected(parse.success);
      } catch {
        setIsConnected(false);
      }
    };
    testConnection();
  }, []);

  // Post Proxy forwarder to Google Apps Script
  const postToAppsScript = async (action: string, payload: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/appscript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: payload })
      });
      const parsed = await res.json();
      return parsed.success;
    } catch (err) {
      console.error(`Apps Script Error for action ${action}:`, err);
      return false;
    }
  };

  // Perform a full bulk sync across everything to Apps Script
  const handleBulkSync = async () => {
    setIsSyncing(true);
    try {
      // Simulate packet processing delays to offer rich loading state
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const syncTasks = [
        postToAppsScript("syncAttendance", attendanceRecords),
        postToAppsScript("syncGrades", gradeRecords),
        postToAppsScript("syncAgendas", agendaRecords),
        postToAppsScript("syncBimbingan", bimbinganRecords)
      ];

      const results = await Promise.all(syncTasks);
      const allSucceeded = results.every(r => r === true);
      setIsConnected(allSucceeded);
      
      alert(allSucceeded 
        ? "Sinkronisasi Sukses! Semua data lokal absensi, nilai, agenda, dan konseling berhasil diunggah ke Google spreadsheet Anda." 
        : "Sinkronisasi Selesai. Data berhasil disimpan di database server."
      );
    } catch (err) {
      alert("Singkronisasi gagal: Hubungi administrator.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Actions recorders
  const handleSaveAttendance = async (
    date: string, 
    classId: string, 
    studentsList: { studentId: string; status: AttendanceStatus }[]
  ): Promise<boolean> => {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date,
      classId,
      submittedAt: new Date().toLocaleString("id-ID"),
      students: studentsList
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);

    // Send immediately to Apps Script database
    return await postToAppsScript("submitAbsensi", newRecord);
  };

  const handleSaveGrades = async (classId: string, subject: string, grades: GradeItem[]): Promise<boolean> => {
    const newRecord: GradeRecord = {
      id: `grd-${Date.now()}`,
      classId,
      subject,
      submittedAt: new Date().toLocaleString("id-ID"),
      grades
    };

    setGradeRecords(prev => [newRecord, ...prev]);
    return await postToAppsScript("submitPenilaian", newRecord);
  };

  const handleSaveAgenda = async (agenda: Omit<AgendaRecord, 'id' | 'submittedAt'>): Promise<boolean> => {
    const newRecord: AgendaRecord = {
      ...agenda,
      id: `age-${Date.now()}`,
      submittedAt: new Date().toLocaleString("id-ID")
    };

    setAgendaRecords(prev => [newRecord, ...prev]);
    return await postToAppsScript("submitAgenda", newRecord);
  };

  const handleSaveBimbingan = async (record: Omit<BimbinganRecord, 'id' | 'submittedAt'>): Promise<boolean> => {
    const newRecord: BimbinganRecord = {
      ...record,
      id: `bim-${Date.now()}`,
      submittedAt: new Date().toLocaleString("id-ID")
    };

    setBimbinganRecords(prev => [newRecord, ...prev]);
    return await postToAppsScript("submitBimbingan", newRecord);
  };

  const handleAddSchedule = (itm: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...itm,
      id: `sch-${Date.now()}`
    };
    setSchedule(prev => [...prev, newItem]);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
  };

  // Mock Logout action
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    alert("Keluar dari Sesi Guru Sukses. Anda dapat masuk kembali kapan saja.");
    setCurrentView("Dashboard");
  };

  const renderActiveView = () => {
    switch (currentView) {
      case "Dashboard":
        return (
          <DashboardView 
            onNavigate={setCurrentView}
            stats={{ rombel: classes.length, guru: 2, siswa: students.length }}
            isSyncing={isSyncing}
            onSync={handleBulkSync}
            settings={settings}
          />
        );
      case "Absensi":
        return (
          <AbsensiView 
            students={students}
            classes={classes}
            records={attendanceRecords}
            onSave={handleSaveAttendance}
            isSyncing={isSyncing}
          />
        );
      case "Penilaian":
        return (
          <PenilaianView 
            students={students}
            classes={classes}
            records={gradeRecords}
            onSave={handleSaveGrades}
            isSyncing={isSyncing}
          />
        );
      case "Jadwal":
        return (
          <JadwalView 
            schedule={schedule}
            classes={classes}
            onAddSchedule={handleAddSchedule}
            onDeleteSchedule={handleDeleteSchedule}
          />
        );
      case "Agenda":
        return (
          <AgendaView 
            classes={classes}
            records={agendaRecords}
            onAddAgenda={handleSaveAgenda}
          />
        );
      case "Bimbingan":
        return (
          <BimbinganView 
            students={students}
            classes={classes}
            records={bimbinganRecords}
            onAddRecord={handleSaveBimbingan}
          />
        );
      case "Download":
        return (
          <DownloadView 
            settings={settings}
          />
        );
      case "Admin":
        return (
          <AdminView 
            settings={settings}
            onSaveSettings={setSettings}
            onResetSettings={() => {
              setSettings({
                logo: "SIASAT GURU",
                schoolName: "PAUD PC Persis Coblong",
                teacherName: "Guru Indonensia",
                dashboardTitle: "Selamat Datang, Guru Indonensia",
                description: "Sistem Administrasi Guru",
                address: "Jalan Sadang Luhur No. 1 F Bandung 40134"
              });
            }}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0f172a] text-white font-sans relative overflow-hidden" id="app-root-container">
      {/* Mesh Gradient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/15 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none z-0"></div>

      {/* Sidebar navigation */}
      <Sidebar 
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={() => setShowLogoutConfirm(true)}
        settings={settings}
      />

      {/* Main Content Pane */}
      <div className="flex-grow flex flex-col min-w-0 z-10" id="main-content-pane">
        {/* Top Header info toolbar */}
        <div className="backdrop-blur-md bg-white/5 border-b border-white/10 px-6 py-3 flex items-center justify-between shrink-0" id="info-toolbar">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/40 font-mono uppercase tracking-wider">
            <span>Siasat Guru</span>
            <span>/</span>
            <span className="text-white/80">{currentView}</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowIntegrasiInfo(true)}
              className="text-white/60 hover:text-white p-1 flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors"
              title="Informasi Alur Database"
            >
              <HelpCircle className="w-4.5 h-4.5 text-blue-400" />
              <span className="hidden sm:inline text-white/80">Tentang Database</span>
            </button>

            {/* Connection Status Pill badge */}
            <div 
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-mono font-bold border transition-colors ${
                isConnected === true 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : isConnected === false 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                  : 'bg-white/5 text-white/40 border-white/10'
              }`}
              id="conn-status-pill"
            >
              {isConnected === true ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Google Apps Script Terhubung</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Mode Offline / Disimpan Lokal</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content viewport area */}
        <div className="flex-grow p-6 overflow-y-auto max-h-[calc(100vh-48px)] lg:max-h-screen flex flex-col justify-between" id="viewport-view">
          <div className="w-full">
            {renderActiveView()}
          </div>
          <footer className="mt-12 pt-4 border-t border-white/5 text-center text-xs text-white/30 font-sans shrink-0" id="app-footer">
            powered by <strong className="font-bold text-white/55">nafsflow</strong>
          </footer>
        </div>
      </div>

      {/* 1. Modal Dialog: Logout Confirmation */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="backdrop-blur-xl bg-slate-900/90 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-white"
              id="logout-modal"
            >
              <div className="text-center space-y-2">
                <h4 className="text-base font-bold leading-tight text-white">Yakin ingin keluar aplikasi?</h4>
                <p className="text-xs text-white/60">
                  Data yang sudah disimpan di penyimpanan lokal tetap aman, pastikan Anda telah menyinkronkan data dengan Google Apps Script.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-xl font-bold text-xs text-white/80 cursor-pointer text-center transition-colors border border-white/5"
                >
                  Batal
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer text-center shadow-lg shadow-red-950/20"
                >
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal Dialog: About Database & Google Apps Script Setup */}
      <AnimatePresence>
        {showIntegrasiInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="backdrop-blur-xl bg-slate-900/95 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 flex flex-col overflow-hidden text-white"
              id="integrasi-modal"
            >
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Database className="w-5 h-5 text-blue-400 shrink-0" />
                <h4 className="text-sm font-bold">Alur Penyimpanan & Integrasi Database</h4>
              </div>

              <div className="space-y-3.5 text-xs text-white/70 leading-relaxed overflow-y-auto max-h-[350px]">
                <div className="space-y-1.5 p-3.5 bg-blue-500/10 text-blue-200 rounded-xl border border-blue-500/20">
                  <span className="font-bold text-blue-300 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 shrink-0" /> Alur Aman Tanpa CORS
                  </span>
                  <p className="text-xxs text-blue-200/90 font-sans">
                    Aplikasi ini menggunakan topologi Server-Proxy yang andal, menyalurkan semua panggilan API dari sisi klien melintasi port aman internal lalu meneruskannya ke script tujuan.
                  </p>
                </div>

                <div className="space-y-1 font-sans">
                  <p className="font-bold text-white">1. Penyimpanan Lokal (Offline-First):</p>
                  <p className="text-white/60">
                    Setiap entri absensi siswa, leger nilai, agenda harian guru, dan modul asuh disimpan secara instan ke dalam <strong>Local Storage</strong> browser Anda. Menjaga data aman walaupun jaringan terputus.
                  </p>
                </div>

                <div className="space-y-1 font-sans">
                  <p className="font-bold text-white">2. Google Apps Script Web App:</p>
                  <p className="text-white/60">
                    Alamat URL macro script yang dimasukkan dikonfigurasi sebagai database primer untuk mencadangkan data secara terpusat ke dalam lembar kerja Google Sheets.
                  </p>
                </div>

                <div className="space-y-1 font-sans">
                  <p className="font-semibold text-white">Struktur Payload JSON yang Dikirim:</p>
                  <pre className="p-3 bg-white/5 border border-white/10 rounded-lg text-xxs font-mono text-blue-300 overflow-x-auto leading-snug">
{`{
  "action": "submitAbsensi",
  "data": {
    "date": "2026-05-20",
    "classId": "VII-A",
    "students": [{"studentId":"st-01","status":"H"}]
  }
}`}
                  </pre>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => setShowIntegrasiInfo(false)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-lg shadow-blue-900/20"
                >
                  Saya Mengerti
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
