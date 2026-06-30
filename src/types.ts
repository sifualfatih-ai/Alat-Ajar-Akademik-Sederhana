export interface Student {
  id: string;
  name: string;
  gender: 'L' | 'P';
  classId?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  major?: string;
}

export type AttendanceStatus = 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpha

export interface AttendanceItem {
  studentId: string;
  status: AttendanceStatus;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  submittedAt: string;
  students: AttendanceItem[];
}

export interface GradeItem {
  studentId: string;
  task1: number;
  task2: number;
  uts: number;
  uas: number;
}

export interface GradeRecord {
  id: string;
  classId: string;
  subject: string;
  submittedAt: string;
  grades: GradeItem[];
}

export interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  classId: string;
  subject: string;
  room: string;
}

export interface AgendaRecord {
  id: string;
  date: string;
  classId: string;
  jam: string;
  topic: string;
  notes: string;
  status: 'Selesai' | 'Tertunda' | 'Pengganti';
  submittedAt: string;
}

export interface BimbinganRecord {
  id: string;
  date: string;
  studentId: string;
  classId: string;
  category: 'Akademik' | 'Pribadi' | 'Sosial' | 'Karier';
  issue: string;
  solution: string;
  submittedAt: string;
}

export interface SchoolSettings {
  logo: string;
  logoUrl?: string;
  schoolName: string;
  teacherName: string;
  subject?: string;
  dashboardTitle: string;
  description: string;
  address: string;
}

