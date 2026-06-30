import React, { useState } from "react";
import { 
  Home, 
  ClipboardCheck, 
  Star, 
  Clock, 
  NotebookPen, 
  HeartHandshake, 
  Download, 
  LogOut,
  Menu,
  X,
  Settings,
  Users,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SchoolSettings } from "../types";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  settings: SchoolSettings;
  userEmail?: string | null;
}

export default function Sidebar({ currentView, onNavigate, onLogout, settings, userEmail }: SidebarProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const menuItems = [
    { view: "Dashboard", label: "Dashboard", icon: Home },
    { view: "DataSiswa", label: "Data Siswa", icon: Users },
    { view: "Absensi", label: "Absensi", icon: ClipboardCheck },
    { view: "Penilaian", label: "Penilaian", icon: Star },
    { view: "Jadwal", label: "Jadwal Mengajar", icon: Clock },
    { view: "Agenda", label: "Jurnal Agenda", icon: NotebookPen },
    { view: "JurnalGuru", label: "Jurnal Guru", icon: BookOpen },
    { view: "Bimbingan", label: "Bimbingan Wali", icon: HeartHandshake },
    { view: "Download", label: "Berbagi Dokumen Ajar", icon: Download },
    { view: "Admin", label: "Pengaturan Admin", icon: Settings }
  ];

  if (userEmail === "sitimulyati.alfatih@gmail.com") {
    menuItems.push({ view: "SuperAdmin", label: "Super Admin", icon: Users });
  }

  const handleMobileNavigate = (view: string) => {
    onNavigate(view);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden backdrop-blur-md bg-slate-900/80 border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0 z-20" id="mobile-header">
        <div className="flex items-center gap-2.5">
          {/* Circular School Logo */}
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border-2 border-blue-400 overflow-hidden shrink-0">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="School Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="p-1 w-full h-full">
                <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-900 fill-current">
                  <path d="M50 15 L20 40 L30 40 L30 80 L70 80 L70 40 L80 40 Z" />
                  <path d="M50 45 L40 55 L45 55 L45 70 L55 70 L55 55 L60 55 Z" fill="#3b82f6" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-wide font-sans m-0">{settings.logo}</h1>
            <p className="text-xxs text-blue-400 font-mono font-medium tracking-wider uppercase m-0 leading-none">{settings.teacherName}</p>
          </div>
        </div>

        <button 
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="text-slate-200 hover:text-white p-1.5 bg-white/5 hover:bg-white/10 rounded-lg active:scale-95 transition-all cursor-pointer border border-white/10"
          id="mobile-menu-toggle"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="md:hidden fixed inset-0 z-40 bg-[#0f172a]/95 backdrop-blur-2xl flex flex-col pt-16 px-4 pb-6"
            id="mobile-drawer"
          >
            {/* Nav List */}
            <div className="flex-grow space-y-2.5 overflow-y-auto pr-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => handleMobileNavigate(item.view)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-xs font-sans scale-active transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/30 border border-blue-500/30' 
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Logout mobile */}
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 bg-red-950/20 text-red-400 border border-red-900/40 rounded-xl font-bold font-sans text-xs active:scale-95 transition-all text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Aplikasi</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Rail */}
      <div 
        className="hidden md:flex flex-col w-56 backdrop-blur-xl bg-white/5 border-r border-white/10 shrink-0 h-screen sticky top-0 z-20"
        id="desktop-sidebar"
      >
        {/* User Card Header */}
        <div className="p-4 flex items-center gap-3 border-b border-white/10" id="sidebar-user-header">
          {/* Logo Circle */}
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-blue-500 shrink-0 shadow-sm relative group overflow-hidden">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="School Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="p-1 w-full h-full">
                <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-900 fill-current">
                  {/* school shape */}
                  <circle cx="50" cy="50" r="45" fill="none" strokeWidth="4" stroke="#1e1b4b" />
                  <path d="M50 15 L20 40 L30 40 L30 80 L70 80 L70 40 L80 40 Z" />
                  <path d="M50 45 L40 55 L45 55 L45 70 L55 70 L55 55 L60 55 Z" fill="#3b82f6" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-blue-500/15 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <div className="space-y-0.5 min-w-0">
            <h3 className="text-xs font-bold text-white font-sans truncate tracking-tight m-0" title={settings.teacherName}>
              {settings.teacherName}
            </h3>
            <p 
              className="text-xs text-blue-400 truncate uppercase tracking-widest leading-none m-0"
              style={{ fontFamily: "'Segoe UI', sans-serif", fontWeight: 400 }}
              title={settings.subject || "Guru Mata Pelajaran"}
            >
              {settings.subject || "Guru Mata Pelajaran"}
            </p>
          </div>
        </div>

        {/* Navigation Items Links */}
        <div className="flex-grow p-3 space-y-1.5 overflow-y-auto" id="sidebar-links-container">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left scale-active transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white/10 text-white font-bold border-l-4 border-blue-500 shadow-md' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110 text-blue-400' : 'text-white/60'}`} />
                  <span className="text-xs font-sans font-semibold tracking-wide">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Logout At bottom */}
        <div className="p-3 border-t border-white/10 shrink-0" id="sidebar-footer">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-red-500/10 text-white/60 hover:text-red-400 rounded-xl text-left font-sans font-bold text-xs scale-active transition-all cursor-pointer"
            id="logout-btn"
          >
            <LogOut className="w-4 h-4 shrink-0 text-red-400/80" />
            <span>Logout Aplikasi</span>
          </button>
        </div>
      </div>
    </>
  );
}
