import { DailyAttendance, ClassJournal, GradeItem, TeacherReminder } from '../types';

export function formatIndonesianDate(dateString: string): string {
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getEstimatedHijriDate(): string {
  // Approximate Hijri calendar calculation for Indonesian Madrasah context
  // 2026-09-25 is approximately Rabiul Awwal / Rabiul Akhir 1448 H
  return '14 Rabiul Awwal 1448 H';
}

// Generate formatted email body for Supervisor (samsuriarifkom@gmail.com)
export function generateSupervisorReportEmail(params: {
  date: string;
  teacherName: string;
  className: string;
  attendance?: DailyAttendance;
  journals?: ClassJournal[];
  grades?: GradeItem[];
  reminders?: TeacherReminder[];
}): { subject: string; body: string } {
  const { date, teacherName, className, attendance, journals, grades, reminders } = params;
  const dateFormatted = formatIndonesianDate(date);

  const subject = `[LAPORAN HARIAN MI MIFTAHUL HUDA] ${className} - ${dateFormatted}`;

  let body = `Yth. Bapak Samsuri Arif, M.Kom / Kepala Madrasah\n`;
  body += `Supervisor MI Miftahul Huda Kertosono, Kec. Panggul, Kab. Trenggalek (samsuriarifkom@gmail.com)\n\n`;
  body += `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\n`;
  body += `Berikut adalah laporan administrasi harian KBM dan peserta didik di MI Miftahul Huda Kertosono, Kec. Panggul, Kab. Trenggalek:\n\n`;
  body += `=========================================\n`;
  body += `DATA GURU & KELAS\n`;
  body += `=========================================\n`;
  body += `• Guru Pengampu : ${teacherName}\n`;
  body += `• Kelas         : ${className}\n`;
  body += `• Hari, Tanggal : ${dateFormatted}\n\n`;

  if (attendance) {
    const s = attendance.summary;
    const pct = s.total > 0 ? Math.round((s.hadir / s.total) * 100) : 0;
    body += `=========================================\n`;
    body += `1. REKAPITULASI KEHADIRAN SISWA\n`;
    body += `=========================================\n`;
    body += `• Total Siswa : ${s.total} Siswa\n`;
    body += `• Hadir       : ${s.hadir} (${pct}%)\n`;
    body += `• Sakit       : ${s.sakit}\n`;
    body += `• Izin        : ${s.izin}\n`;
    body += `• Alpa        : ${s.alpa}\n\n`;

    const absentStudents = attendance.records.filter(r => r.status !== 'H');
    if (absentStudents.length > 0) {
      body += `Daftar Siswa Tidak Hadir:\n`;
      absentStudents.forEach((r, idx) => {
        const stName = r.status === 'S' ? 'Sakit' : r.status === 'I' ? 'Izin' : 'Alpa';
        body += `${idx + 1}. ${r.studentName} [${stName}]${r.notes ? ` - Catatan: ${r.notes}` : ''}\n`;
      });
      body += `\n`;
    }
  }

  if (journals && journals.length > 0) {
    body += `=========================================\n`;
    body += `2. JURNAL KEGIATAN BELAJAR MENGAJAR (KBM)\n`;
    body += `=========================================\n`;
    journals.forEach((j, idx) => {
      body += `Sesi ${idx + 1}: ${j.subject} (${j.period})\n`;
      body += `• Materi Pokok : ${j.topic}\n`;
      body += `• Kegiatan     : ${j.activities}\n`;
      if (j.notes) body += `• Catatan/Kls  : ${j.notes}\n`;
      body += `\n`;
    });
  }

  if (grades && grades.length > 0) {
    body += `=========================================\n`;
    body += `3. REKAP NILAI / TUGAS TERAKHIR\n`;
    body += `=========================================\n`;
    grades.slice(0, 2).forEach(g => {
      const avg = Math.round(g.studentScores.reduce((acc, c) => acc + c.score, 0) / (g.studentScores.length || 1));
      const passed = g.studentScores.filter(s => s.score >= g.passingScore).length;
      body += `• Mapel: ${g.subject} - ${g.assessmentName}\n`;
      body += `  Rata-rata: ${avg} | Tuntas: ${passed}/${g.studentScores.length} siswa (KKM: ${g.passingScore})\n\n`;
    });
  }

  if (reminders && reminders.length > 0) {
    const uncompleted = reminders.filter(r => !r.completed);
    body += `=========================================\n`;
    body += `4. AGENDA & CATATAN TUGAS GURU\n`;
    body += `=========================================\n`;
    body += `• Tugas Menunggu: ${uncompleted.length} tugas\n`;
    uncompleted.forEach((r, idx) => {
      body += `  ${idx + 1}. [${r.priority.toUpperCase()}] ${r.title} (Deadline: ${r.dueDate})\n`;
    });
    body += `\n`;
  }

  body += `Demikian laporan harian ini kami sampaikan sebagai bahan pantauan dan dokumentasi madrasah.\n\n`;
  body += `Wassalamu'alaikum Warahmatullahi Wabarakatuh,\n`;
  body += `Hormat kami,\n`;
  body += `${teacherName}\n`;
  body += `MI Miftahul Huda Kertosono`;

  return { subject, body };
}

// Download CSV helper
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
