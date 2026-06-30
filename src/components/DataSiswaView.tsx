import React, { useState, useRef } from "react";
import { Users, Plus, Trash2, Search, UserCircle2, FileSpreadsheet, X, Activity, BookOpen, Clock } from "lucide-react";
import { Student, ClassInfo, AttendanceRecord, GradeRecord } from "../types";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "motion/react";

interface DataSiswaViewProps {
  students: Student[];
  classes: ClassInfo[];
  attendanceRecords?: AttendanceRecord[];
  gradeRecords?: GradeRecord[];
  onAddStudent: (student: Student | Student[]) => void;
  onDeleteStudent: (id: string) => void;
}

export default function DataSiswaView({ students, classes, attendanceRecords = [], gradeRecords = [], onAddStudent, onDeleteStudent }: DataSiswaViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState<'L'|'P'>('L');
  const [newClassId, setNewClassId] = useState(classes[0]?.id || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const importedStudents: Student[] = [];
        data.forEach((row: any) => {
          const rawName = row['Nama'] || row['NAMA'] || row['Name'] || row['name'] || row['Nama Siswa'] || Object.values(row)[0];
          const rawGender = row['Jenis Kelamin'] || row['L/P'] || row['Gender'] || row['gender'] || row['JK'] || 'L';
          const rawClass = row['Kelas'] || row['KELAS'] || row['Class'] || row['class'];

          if (rawName && typeof rawName === 'string') {
             let genderStr = rawGender.toString().toUpperCase().startsWith('P') ? 'P' : 'L';
             let classId = "";
             if (rawClass) {
               const match = classes.find(c => c.name.toLowerCase() === rawClass.toString().toLowerCase() || c.id.toLowerCase() === rawClass.toString().toLowerCase());
               if (match) classId = match.id;
               else classId = rawClass.toString();
             }
             
             importedStudents.push({
                id: `st-import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: rawName.trim(),
                gender: genderStr as 'L'|'P',
                classId: classId
             });
          }
        });
        
        if (importedStudents.length > 0) {
          onAddStudent(importedStudents);
        }
        
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        console.error("Error parsing file", err);
        alert("Gagal membaca file. Pastikan formatnya benar.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStudent: Student = {
      id: `st-${Date.now()}`,
      name: newName,
      gender: newGender,
      classId: newClassId
    };

    onAddStudent(newStudent);
    setNewName("");
    setShowAddForm(false);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 flex-grow flex flex-col h-full font-sans" id="data-siswa-view">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" /> Data Siswa
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Kelola data siswa yang Anda ampu. Tambahkan siswa baru atau hapus data siswa.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 font-bold text-xs px-4 py-2 rounded-xl transition-all scale-active"
            title="Import dari Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" /> 
            <span className="hidden sm:inline">Import Data</span>
          </button>
          
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all scale-active shadow-lg shadow-blue-900/20"
          >
            <Plus className={`w-4 h-4 transition-transform ${showAddForm ? "rotate-45" : ""}`} /> 
            {showAddForm ? "Batal" : "Tambah Siswa"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow space-y-1 w-full sm:w-auto">
            <label className="text-xxs uppercase tracking-wider text-white/40 font-bold">Nama Lengkap</label>
            <input 
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Misal: Budi Santoso"
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900"
            />
          </div>
          <div className="w-full sm:w-32 space-y-1">
            <label className="text-xxs uppercase tracking-wider text-white/40 font-bold">Jenis Kelamin</label>
            <select 
              value={newGender}
              onChange={(e) => setNewGender(e.target.value as 'L'|'P')}
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>
          <div className="w-full sm:w-48 space-y-1">
            <label className="text-xxs uppercase tracking-wider text-white/40 font-bold">Kelas</label>
            <input 
              type="text"
              required
              list="classes-list"
              value={newClassId}
              onChange={(e) => setNewClassId(e.target.value)}
              placeholder="Contoh: VII-A"
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
            />
            <datalist id="classes-list">
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </datalist>
          </div>
          <button 
            type="submit"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2 rounded-lg transition-all"
          >
            Simpan
          </button>
        </form>
      )}

      {/* Main Content Area */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl flex flex-col flex-grow overflow-hidden shadow-xl" id="data-siswa-content">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 shrink-0">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              placeholder="Cari nama siswa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all"
            />
          </div>
          <div className="text-xs font-semibold text-white/40">
            Total: {filteredStudents.length} Siswa
          </div>
        </div>

        {/* Scrollable list area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {filteredStudents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-2">
              <Users className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm font-bold">Tidak ada data siswa</p>
              <p className="text-xs">Gunakan form di atas untuk menambahkan data.</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div 
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 rounded-xl transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0 text-white/40">
                    <UserCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{student.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xxs font-mono text-white/40 uppercase tracking-wider">
                      <span className="bg-white/5 px-1.5 py-0.5 rounded">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                      {student.classId && (
                        <>
                          <span>•</span>
                          <span className="bg-white/5 px-1.5 py-0.5 rounded">{classes.find(c => c.id === student.classId)?.name || student.classId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStudent(student.id);
                  }}
                  className="p-2 text-white/20 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Hapus Siswa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
                    <UserCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{selectedStudent.name}</h3>
                    <p className="text-sm text-white/50">{classes.find(c => c.id === selectedStudent.classId)?.name || selectedStudent.classId} • {selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                // Calculate Stats
                const studentAttendance = attendanceRecords.flatMap(r => 
                  r.students.filter(s => s.studentId === selectedStudent.id).map(s => ({ date: r.date, status: s.status }))
                );
                
                const stats = { H: 0, S: 0, I: 0, A: 0 };
                studentAttendance.forEach(a => {
                  if (stats[a.status] !== undefined) {
                    stats[a.status]++;
                  }
                });

                const studentGrades = gradeRecords.flatMap(r => 
                  r.grades.filter(g => g.studentId === selectedStudent.id).map(g => ({ subject: r.subject, ...g }))
                );

                return (
                  <div className="space-y-6">
                    {/* Kehadiran */}
                    <div>
                      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400" /> Ringkasan Kehadiran
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
                          <p className="text-2xl font-bold text-emerald-400">{stats.H}</p>
                          <p className="text-xxs uppercase font-bold tracking-wider text-emerald-500/70">Hadir</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-center">
                          <p className="text-2xl font-bold text-blue-400">{stats.I}</p>
                          <p className="text-xxs uppercase font-bold tracking-wider text-blue-500/70">Izin</p>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl text-center">
                          <p className="text-2xl font-bold text-orange-400">{stats.S}</p>
                          <p className="text-xxs uppercase font-bold tracking-wider text-orange-500/70">Sakit</p>
                        </div>
                        <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-center">
                          <p className="text-2xl font-bold text-rose-400">{stats.A}</p>
                          <p className="text-xxs uppercase font-bold tracking-wider text-rose-500/70">Alpha</p>
                        </div>
                      </div>
                    </div>

                    {/* Nilai Akademik */}
                    <div>
                      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-400" /> Histori Nilai
                      </h4>
                      {studentGrades.length === 0 ? (
                        <p className="text-xs text-white/40 italic bg-white/5 p-4 rounded-xl text-center border border-white/5">
                          Belum ada data nilai tercatat.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {studentGrades.map((g, idx) => {
                            const avg = (g.task1 + g.task2 + g.uts + g.uas) / 4;
                            return (
                              <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-bold text-white">{g.subject}</p>
                                  <div className="flex gap-3 mt-1 text-xs text-white/50">
                                    <span>T1: {g.task1}</span>
                                    <span>T2: {g.task2}</span>
                                    <span>UTS: {g.uts}</span>
                                    <span>UAS: {g.uas}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xxs text-white/40 uppercase tracking-wider font-bold mb-0.5">Rata-rata</p>
                                  <p className={`text-lg font-bold ${avg >= 75 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                    {avg.toFixed(1)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
