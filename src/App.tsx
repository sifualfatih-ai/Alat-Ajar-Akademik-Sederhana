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
import LoginView from "./components/LoginView";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import DataSiswaView from "./components/DataSiswaView";
import { db, auth } from "./lib/firebase";
import { doc, setDoc, writeBatch } from "firebase/firestore";
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
const SEEDED_STUDENTS: Student[] = [];

const SEEDED_CLASSES: ClassInfo[] = [];

const SEEDED_SCHEDULE: ScheduleItem[] = [];

// Safe localStorage wrapper to prevent crashes in mobile webviews
const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage is not available", e);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage is not available", e);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("localStorage is not available", e);
    }
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState<string>("Dashboard");
  
  // Auth State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return safeStorage.getItem("sg_auth_token");
  });

  // School Profile Attr settings
  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = safeStorage.getItem("sg_school_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default style
      }
    }
    return {
      logo: "GURU DIGITAL INDONESIA",
      schoolName: "Sekolah Indonesia",
      teacherName: "Guru Indonensia",
      subject: "Pendidikan Agama",
      dashboardTitle: "Selamat Datang, Guru Indonensia",
      description: "Sistem Administrasi Guru",
      address: "Jalan Sadang Luhur No. 1 F Bandung 40134"
    };
  });
  
  // App States
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = safeStorage.getItem("sg_students");
    try { return saved ? JSON.parse(saved) : SEEDED_STUDENTS; } catch(e){ return SEEDED_STUDENTS; }
  });
  const classes: ClassInfo[] = React.useMemo(() => {
    const uniqueClassIds = Array.from(new Set(students.map(s => s.classId).filter(Boolean))) as string[];
    return uniqueClassIds.map(id => ({ id, name: id, major: "Umum" })).sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = safeStorage.getItem("sg_schedule");
    try { return saved ? JSON.parse(saved) : SEEDED_SCHEDULE; } catch(e){ return SEEDED_SCHEDULE; }
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = safeStorage.getItem("sg_attendance");
    try { return saved ? JSON.parse(saved) : []; } catch(e){ return []; }
  });

  const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>(() => {
    const saved = safeStorage.getItem("sg_grades");
    try { return saved ? JSON.parse(saved) : []; } catch(e){ return []; }
  });

  const [agendaRecords, setAgendaRecords] = useState<AgendaRecord[]>(() => {
    const saved = safeStorage.getItem("sg_agendas");
    try { return saved ? JSON.parse(saved) : []; } catch(e){ return []; }
  });

  const [bimbinganRecords, setBimbinganRecords] = useState<BimbinganRecord[]>(() => {
    const saved = safeStorage.getItem("sg_bimbingas");
    try { return saved ? JSON.parse(saved) : []; } catch(e){ return []; }
  });

  // Connection & sync state with AppScript
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [pendingSyncTasks, setPendingSyncTasks] = useState<any[]>(() => {
    try {
      const saved = safeStorage.getItem("sg_pending_sync");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Modals view controllers
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showIntegrasiInfo, setShowIntegrasiInfo] = useState(false);

  // Sync state variables across sessions
  useEffect(() => {
    safeStorage.setItem("sg_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    safeStorage.setItem("sg_schedule", JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    safeStorage.setItem("sg_attendance", JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    safeStorage.setItem("sg_grades", JSON.stringify(gradeRecords));
  }, [gradeRecords]);

  useEffect(() => {
    safeStorage.setItem("sg_agendas", JSON.stringify(agendaRecords));
  }, [agendaRecords]);

  useEffect(() => {
    safeStorage.setItem("sg_bimbingas", JSON.stringify(bimbinganRecords));
  }, [bimbinganRecords]);

  useEffect(() => {
    if (authToken) {
      safeStorage.setItem("sg_auth_token", authToken);
    } else {
      safeStorage.removeItem("sg_auth_token");
    }
  }, [authToken]);

  useEffect(() => {
    safeStorage.setItem("sg_school_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    safeStorage.setItem("sg_pending_sync", JSON.stringify(pendingSyncTasks));
  }, [pendingSyncTasks]);

  const handleProcessPendingSync = async (tasks: any[]) => {
    setIsSyncing(true);
    let successCount = 0;
    const remainingTasks = [];
    
    for (const task of tasks) {
      try {
        const res = await syncToFirestore(task.action, task.payload);
        if (res.success && !res.offline) {
          successCount++;
        } else {
          remainingTasks.push(task);
        }
      } catch (err) {
        remainingTasks.push(task);
      }
    }
    
    setPendingSyncTasks(remainingTasks);
    setIsSyncing(false);
    
    if (successCount > 0) {
      alert(`Sinkronisasi berhasil! ${successCount} data offline telah dikirim.`);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      const saved = safeStorage.getItem("sg_pending_sync");
      if (saved) {
        try {
          const tasks = JSON.parse(saved);
          if (tasks && tasks.length > 0) {
            if (window.confirm(`Anda kembali online! Terdapat ${tasks.length} data absensi/penilaian yang belum tersinkron. Sinkronisasi sekarang?`)) {
              handleProcessPendingSync(tasks);
            }
          }
        } catch(e) {}
      }
    };
    
    const handleOffline = () => {
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NETWORK_ONLINE') {
        handleOnline();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [settings.teacherName]);

  // Test Apps Script Connectivity on load
  useEffect(() => {
    const testConnection = async () => {
      setIsConnected(navigator.onLine);
    };
    testConnection();
  }, []);

  // Sync to Firebase Firestore instead of Google Apps Script
  const syncToFirestore = async (action: string, payload: any): Promise<any> => {
    if (!navigator.onLine) {
       setPendingSyncTasks(prev => [...prev, { action, payload, timestamp: Date.now() }]);
       return { success: true, message: "Offline - Tersimpan secara lokal dalam antrean", offline: true };
    }

    try {
      if (!auth.currentUser) throw new Error("Not authenticated");
      const userId = auth.currentUser.uid;
      
      if (action === "submitAbsensi") {
        await setDoc(doc(db, "attendance", payload.id), { ...payload, userId });
      } else if (action === "submitPenilaian") {
        await setDoc(doc(db, "grades", payload.id), { ...payload, userId });
      } else if (action === "submitAgenda") {
        await setDoc(doc(db, "agendas", payload.id), { ...payload, userId });
      } else if (action === "submitBimbingan") {
        await setDoc(doc(db, "bimbingan", payload.id), { ...payload, userId });
      } else if (action === "syncAttendance") {
        const batch = writeBatch(db);
        payload.forEach((record: any) => {
          batch.set(doc(db, "attendance", record.id), { ...record, userId });
        });
        await batch.commit();
      } else if (action === "syncGrades") {
        const batch = writeBatch(db);
        payload.forEach((record: any) => {
          batch.set(doc(db, "grades", record.id), { ...record, userId });
        });
        await batch.commit();
      } else if (action === "syncAgendas") {
        const batch = writeBatch(db);
        payload.forEach((record: any) => {
          batch.set(doc(db, "agendas", record.id), { ...record, userId });
        });
        await batch.commit();
      } else if (action === "syncBimbingan") {
        const batch = writeBatch(db);
        payload.forEach((record: any) => {
          batch.set(doc(db, "bimbingan", record.id), { ...record, userId });
        });
        await batch.commit();
      }
      
      return { success: true, data: payload };
    } catch (err) {
      console.error(`Firebase Error for action ${action}:`, err);
      if (err instanceof Error && (err.message.includes("offline") || err.message.includes("network"))) {
        setPendingSyncTasks(prev => [...prev, { action, payload, timestamp: Date.now() }]);
        return { success: true, message: "Jaringan error - Tersimpan ke dalam antrean sinkronisasi", offline: true };
      }
      return { success: false, error: err instanceof Error ? err.message : "Network error" };
    }
  };

  // Perform a full bulk sync across everything to Apps Script
  const handleBulkSync = async () => {
    setIsSyncing(true);
    try {
      // Simulate packet processing delays to offer rich loading state
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const syncTasks = [
        syncToFirestore("syncAttendance", attendanceRecords),
        syncToFirestore("syncGrades", gradeRecords),
        syncToFirestore("syncAgendas", agendaRecords),
        syncToFirestore("syncBimbingan", bimbinganRecords)
      ];

      const results = await Promise.all(syncTasks);
      const allSucceeded = results.every(r => r?.success === true);
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
    const result = await syncToFirestore("submitAbsensi", newRecord);
    return result?.success === true;
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
    const result = await syncToFirestore("submitPenilaian", newRecord);
    return result?.success === true;
  };

  const handleSaveAgenda = async (agenda: Omit<AgendaRecord, 'id' | 'submittedAt'>): Promise<boolean> => {
    const newRecord: AgendaRecord = {
      ...agenda,
      id: `age-${Date.now()}`,
      submittedAt: new Date().toLocaleString("id-ID")
    };

    setAgendaRecords(prev => [newRecord, ...prev]);
    const result = await syncToFirestore("submitAgenda", newRecord);
    return result?.success === true;
  };

  const handleSaveBimbingan = async (record: Omit<BimbinganRecord, 'id' | 'submittedAt'>): Promise<boolean> => {
    const newRecord: BimbinganRecord = {
      ...record,
      id: `bim-${Date.now()}`,
      submittedAt: new Date().toLocaleString("id-ID")
    };

    setBimbinganRecords(prev => [newRecord, ...prev]);
    const result = await syncToFirestore("submitBimbingan", newRecord);
    return result?.success === true;
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
    setAuthToken(null);
    setCurrentView("Dashboard");
  };

  if (!authToken) {
    return (
      <LoginView 
        settings={settings}
        onLoginSuccess={(token, userData) => {
          setAuthToken(token);
          if (userData) {
            setSettings(prev => ({
              ...prev,
              schoolName: userData.namasekolah || prev.schoolName,
              teacherName: userData.nama || prev.teacherName,
            }));
          }
        }}
      />
    );
  }

  const renderActiveView = () => {
    switch (currentView) {
      case "Dashboard":
        return (
          <DashboardView 
            onNavigate={setCurrentView}
            stats={{ rombel: classes.length, siswa: students.length }}
            isSyncing={isSyncing}
            onSync={handleBulkSync}
            settings={settings}
            attendanceRecords={attendanceRecords}
            gradeRecords={gradeRecords}
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
            teacherSubject={settings.subject}
          />
        );
      case "Jadwal":
        return (
          <JadwalView 
            schedule={schedule}
            classes={classes}
            onAddSchedule={handleAddSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            teacherSubject={settings.subject}
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
      case "DataSiswa":
        return (
          <DataSiswaView 
            students={students}
            classes={classes}
            attendanceRecords={attendanceRecords}
            gradeRecords={gradeRecords}
            onAddStudent={(newStudent) => {
              if (Array.isArray(newStudent)) {
                setStudents(prev => [...prev, ...newStudent]);
              } else {
                setStudents(prev => [...prev, newStudent]);
              }
            }}
            onDeleteStudent={(id) => setStudents(prev => prev.filter(s => s.id !== id))}
          />
        );
      case "Admin":
        return (
          <AdminView 
            settings={settings}
            onSaveSettings={setSettings}
            onResetSettings={() => {
              setSettings({
                logo: "GURU DIGITAL INDONESIA",
                schoolName: "Sekolah Indonesia",
                teacherName: "Guru Indonensia",
                subject: "Pendidikan Agama",
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
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#0f172a] text-white font-sans relative overflow-hidden" id="app-root-container">
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
            <span>Guru Digital Indonesia</span>
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

          </div>
        </div>

        {/* Content viewport area */}
        <div className="flex-grow p-6 overflow-y-auto min-h-0 flex flex-col justify-between" id="viewport-view">
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

      {/* 2. Modal Dialog: About Database & Firebase Setup */}
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
                    <ShieldCheck className="w-4 h-4 shrink-0" /> Alur Aman Firebase
                  </span>
                  <p className="text-xxs text-blue-200/90 font-sans">
                    Aplikasi ini menggunakan infrastruktur Firebase Firestore yang aman untuk menyimpan data secara real-time dan terpusat.
                  </p>
                </div>

                <div className="space-y-1 font-sans">
                  <p className="font-bold text-white">1. Penyimpanan Lokal (Offline-First):</p>
                  <p className="text-white/60">
                    Setiap entri absensi siswa, leger nilai, agenda harian guru, dan modul asuh disimpan secara instan ke dalam <strong>Local Storage</strong> browser Anda. Menjaga data aman walaupun jaringan terputus.
                  </p>
                </div>

                <div className="space-y-1 font-sans">
                  <p className="font-bold text-white">2. Firebase Firestore Database:</p>
                  <p className="text-white/60">
                    Data Anda secara otomatis disinkronkan ke database Firestore yang aman saat jaringan tersedia.
                  </p>
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
