export type AttendanceStatus = 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpa

export const ALL_CLASSES = [
  'Kelas 1A', 'Kelas 1B',
  'Kelas 2A', 'Kelas 2B',
  'Kelas 3A', 'Kelas 3B',
  'Kelas 4A', 'Kelas 4B',
  'Kelas 5A', 'Kelas 5B',
  'Kelas 6A', 'Kelas 6B',
] as const;

export type ClassNameType = typeof ALL_CLASSES[number];

export interface Student {
  id: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  className: string;
  parentName?: string;
  phone?: string;
  notes?: string;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface DailyAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  className: string;
  records: AttendanceRecord[];
  summary: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    total: number;
  };
  submittedBy: string;
  updatedAt: string;
}

export interface ClassJournal {
  id: string;
  date: string; // YYYY-MM-DD
  className: string;
  subject: string;
  period: string; // e.g. "Jam 1-2 (07.15 - 08.25)"
  topic: string;
  activities: string;
  notes: string;
  attendanceSummaryText?: string;
  teacherName: string;
  createdAt: string;
}

export interface GradeItem {
  id: string;
  subject: string;
  assessmentName: string; // e.g., "Tugas 1 - Bab Fikih Thaharah", "UH 2 - Matematika Pecahan"
  className: string;
  date: string;
  maxScore: number;
  passingScore: number; // KKM, default 75
  studentScores: {
    studentId: string;
    studentName: string;
    score: number;
    notes?: string;
  }[];
}

export interface TeachingSchedule {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  timeSlot: string; // e.g. "07.15 - 08.25"
  periodNumber: string; // "1-2"
  subject: string;
  className: string;
  room: string;
}

export interface TeacherReminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: 'tinggi' | 'sedang' | 'biasa';
  completed: boolean;
  category: 'Koreksi' | 'Administrasi' | 'KBM' | 'Wali Murid' | 'Lainnya';
  createdAt: string;
}

export interface SentReportLog {
  id: string;
  timestamp: string;
  teacherName: string;
  className: string;
  reportType: 'Harian Lengkap' | 'Rekap Absensi' | 'Rekap Nilai' | 'Jurnal KBM';
  recipientEmail: string; // samsuriarifkom@gmail.com
  subject: string;
  contentSnippet: string;
  status: 'Tersimpan di Cloud' | 'Terkirim';
}

export interface Teacher {
  id: string;
  name: string;
  nip: string; // NIP / NUPTK
  subject: string; // Mata pelajaran (diisi manual)
  phone: string; // No WhatsApp (diisi manual)
  email: string; // Email (diisi manual)
  assignedClass: string; // Kelas tugas (1A s/d 6B / Guru Mapel)
  gender?: 'L' | 'P';
  notes?: string;
}

export interface AppStateData {
  schoolProfile: {
    name: string;
    nsm: string;
    npsn: string;
    address: string;
    supervisorEmail: string;
  };
  currentTeacher: {
    id?: string;
    name: string;
    nip: string;
    assignedClass: string;
    subject?: string;
    phone?: string;
    email?: string;
  };
  teachers: Teacher[];
  students: Student[];
  attendances: DailyAttendance[];
  journals: ClassJournal[];
  grades: GradeItem[];
  schedules: TeachingSchedule[];
  reminders: TeacherReminder[];
  reports: SentReportLog[];
}
