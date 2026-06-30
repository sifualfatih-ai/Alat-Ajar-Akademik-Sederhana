import React, { useState } from "react";
import { 
  Clock, 
  Calendar, 
  Plus, 
  Bookmark, 
  Trash2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { ScheduleItem, ClassInfo } from "../types";
import { motion } from "motion/react";

interface JadwalViewProps {
  schedule: ScheduleItem[];
  classes: ClassInfo[];
  onAddSchedule: (item: Omit<ScheduleItem, 'id'>) => void;
  onDeleteSchedule: (id: string) => void;
  teacherSubject?: string;
}

export default function JadwalView({ schedule, classes, onAddSchedule, onDeleteSchedule, teacherSubject }: JadwalViewProps) {
  const [day, setDay] = useState<string>("Senin");
  const [time, setTime] = useState<string>("07:30 - 09:00");
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || "");
  const [subject, setSubject] = useState<string>(teacherSubject || "Ilmu Pengetahuan Alam (IPA)");
  const [room, setRoom] = useState<string>("Laboratorium IPA");
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const popularTimes = [
    "07:30 - 09:00",
    "09:15 - 10:45",
    "11:00 - 12:30",
    "13:00 - 14:30"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time || !subject) return;

    onAddSchedule({
      day,
      time,
      classId: selectedClass,
      subject,
      room
    });
    setAlert("Jadwal mengajar baru berhasil ditambahkan!");
    setTimeout(() => setAlert(null), 3000);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6" id="jadwal-view-wrapper">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" /> Jadwal Mengajar Guru
          </h2>
          <p className="text-xs text-white/50 font-sans mt-0.5">
            Berikut jadwal mingguan mengajar tatap muka dan koordinasi laboratorium Anda.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold font-sans tracking-wide active:scale-95 transition-all cursor-pointer self-start sm:self-center shadow-md shadow-blue-900/30"
          id="toggle-add-schedule-btn"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? "Batal Tambah" : "Tambah Jadwal Baru"}
        </button>
      </div>

      {alert && (
        <div className="p-3 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2 font-medium" id="schedule-alert">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {alert}
        </div>
      )}

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl max-w-xl text-white"
          id="add-schedule-form"
        >
          <h3 className="text-xs font-bold text-white/50 font-mono uppercase tracking-wider mb-4">Input Blok Mengajar Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Hari</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                >
                  {days.map(d => (
                    <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Jam Pertemuan</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                >
                  {popularTimes.map(t => (
                    <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Kelas Ajar</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                >
                  {classes.map(cl => (
                    <option key={cl.id} value={cl.id} className="bg-slate-900 text-white">{cl.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 font-mono uppercase">Mata Pelajaran</label>
                {teacherSubject ? (
                  <div className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white/70 font-sans cursor-not-allowed">
                    {teacherSubject}
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Ilmu Pengetahuan Alam (IPA)"
                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 font-mono uppercase">Ruang / Laboratorium</label>
              <input
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Laboratorium IPA / R. Kelas VII-A"
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-white/5 hover:bg-white/10 border border-white/5 text-white/80 text-xs px-4 py-2 rounded-lg font-bold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-5 py-2 rounded-lg font-bold cursor-pointer shadow-md transition-colors"
              >
                Simpan Jadwal
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid Day Visual Planner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="schedule-weekly-layout">
        {days.map(d => {
          const itemsForDay = schedule.filter(item => item.day === d);
          return (
            <div 
              key={d} 
              className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-xl p-4 overflow-hidden space-y-3 hover:border-white/20 transition-all flex flex-col min-h-[160px] text-white"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-sm text-white flex items-center gap-1.5 font-sans">
                  <Calendar className="w-4 h-4 text-blue-400 shrink-0" /> {d}
                </span>
                <span className="text-xxs font-mono font-bold text-white/50 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {itemsForDay.length} Pertemuan
                </span>
              </div>

              <div className="space-y-2 flex-grow transition-all">
                {itemsForDay.length === 0 ? (
                  <p className="text-xxs text-white/30 italic py-8 text-center">Bebas Tugas Mengajar</p>
                ) : (
                  itemsForDay.map(it => (
                    <div 
                      key={it.id} 
                      className="group relative p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1 hover:bg-blue-500/20 transition-colors"
                    >
                      {/* Delete item hover button */}
                      <button 
                        onClick={() => onDeleteSchedule(it.id)}
                        className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 text-rose-400 hover:text-rose-300 p-1 bg-slate-900/80 hover:bg-slate-900 border border-white/10 rounded transition-all cursor-pointer"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1 text-xxs font-mono font-semibold text-blue-200">
                        <Clock className="w-3 h-3 text-blue-400" /> {it.time}
                      </div>
                      
                      <div className="text-xs font-bold text-white tracking-tight leading-tight pt-0.5">
                        {it.subject}
                      </div>

                      <div className="flex items-center gap-3 text-xxs text-white/50 mt-1">
                        <span>Kelas <strong className="text-white/80">{it.classId}</strong></span>
                        <span className="flex items-center gap-1">
                          <Bookmark className="w-2.5 h-2.5 text-white/30" /> {it.room}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
