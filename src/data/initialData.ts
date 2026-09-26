import { AppStateData, Student, Teacher, ALL_CLASSES } from '../types';

const FIRST_NAMES_L = ['Achmad', 'Ahmad', 'Bilal', 'Dzaky', 'Fatih', 'Hafizh', 'Ibrahim', 'M. Alfi', 'M. Naufal', 'Nurul', 'Rayhan', 'Yusuf', 'Wildan', 'Faris', 'Salman'];
const LAST_NAMES_L = ['Ramadhan', 'Mubarak', 'Habibi', 'Syahputra', 'Al-Ghifari', 'Rayyan', 'Syahrin', 'Azka', 'Hidayatullah', 'Maulana', 'Hakim', 'Al-Ayyubi', 'Shiddiq'];

const FIRST_NAMES_P = ['Adiba', 'Aisyah', 'Alifiya', 'Fathimah', 'Hana', 'Kayla', 'Nada', 'Salwa', 'Zahira', 'Naila', 'Maryam', 'Safiyyah', 'Khadijah'];
const LAST_NAMES_P = ['Shakila', 'Putri', 'Nur Azizah', 'Zahra', 'Nafisah', 'Salsabila', 'Karimah', 'Syarifah', 'Talita', 'Husna', 'Kamilah', 'Azzahra'];

// Seed realistic students for each class from 1A to 6B
function generateInitialStudents(): Student[] {
  const list: Student[] = [];
  let globalIndex = 1;

  ALL_CLASSES.forEach((className) => {
    // 12 to 16 students per class
    const count = className === 'Kelas 4A' ? 20 : 14;
    const gradeNum = className.replace(/\D/g, '');
    const gradeLetter = className.includes('A') ? '1' : '2';

    for (let i = 0; i < count; i++) {
      const isMale = i % 2 === 0;
      const fName = isMale
        ? FIRST_NAMES_L[(i + parseInt(gradeNum)) % FIRST_NAMES_L.length]
        : FIRST_NAMES_P[(i + parseInt(gradeNum)) % FIRST_NAMES_P.length];
      const lName = isMale
        ? LAST_NAMES_L[(i + parseInt(gradeNum)) % LAST_NAMES_L.length]
        : LAST_NAMES_P[(i + parseInt(gradeNum)) % LAST_NAMES_P.length];

      const nis = `202${6 - parseInt(gradeNum) + 1}${gradeNum}${gradeLetter}${String(i + 1).padStart(2, '0')}`;

      list.push({
        id: `std-${className.replace(/\s+/g, '')}-${i + 1}`,
        nis,
        name: `${fName} ${lName}`,
        gender: isMale ? 'L' : 'P',
        className,
        parentName: isMale ? `Bpk. ${lName}` : `Ibu ${fName}`,
        phone: i % 3 === 0 ? `08123456${String(globalIndex).padStart(4, '0')}` : undefined,
        notes: i === 2 ? 'Anak aktif di kelas' : undefined,
      });

      globalIndex++;
    }
  });

  return list;
}

export const INITIAL_STUDENTS: Student[] = generateInitialStudents();

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-01',
    name: 'Ahmad Fauzi, S.Pd.I',
    nip: '19880415 201403 1 002',
    subject: 'Fikih & Akidah Akhlak',
    phone: '081234567891',
    email: 'ahmadfauzi@miftahulhuda.sch.id',
    assignedClass: 'Kelas 4A',
    gender: 'L',
    notes: 'Wali Kelas 4A',
  },
  {
    id: 'tch-02',
    name: 'Siti Nur Halimah, S.Pd.',
    nip: '19910520 201902 2 004',
    subject: 'Guru Kelas 1A & Tematik',
    phone: '081398765432',
    email: 'halimah@miftahulhuda.sch.id',
    assignedClass: 'Kelas 1A',
    gender: 'P',
    notes: 'Wali Kelas 1A',
  },
  {
    id: 'tch-03',
    name: 'Moh. Zainul Muttaqin, S.Pd.I',
    nip: '19850212 201001 1 015',
    subject: 'Al-Qur\'an Hadits & Bahasa Arab',
    phone: '085233445566',
    email: 'zainul@miftahulhuda.sch.id',
    assignedClass: 'Kelas 5A',
    gender: 'L',
    notes: 'Wali Kelas 5A',
  },
  {
    id: 'tch-04',
    name: 'Lilik Rahmawati, S.Pd.SD',
    nip: '19890918 201503 2 003',
    subject: 'Matematika & IPAS',
    phone: '087755667788',
    email: 'lilik@miftahulhuda.sch.id',
    assignedClass: 'Kelas 6A',
    gender: 'P',
    notes: 'Wali Kelas 6A',
  },
  {
    id: 'tch-05',
    name: 'Muhammad Ridwan, S.Pd.',
    nip: '19940304 202012 1 007',
    subject: 'PJOK & Ke-NU-an / Aswaja',
    phone: '082144556677',
    email: 'ridwan@miftahulhuda.sch.id',
    assignedClass: 'Kelas 3B',
    gender: 'L',
    notes: 'Wali Kelas 3B',
  },
  {
    id: 'tch-06',
    name: 'Nurul Maghfiroh, S.Hum',
    nip: '19931125 201903 2 011',
    subject: 'Sejarah Kebudayaan Islam & Seni Budaya',
    phone: '085811223344',
    email: 'maghfiroh@miftahulhuda.sch.id',
    assignedClass: 'Kelas 5B',
    gender: 'P',
    notes: 'Wali Kelas 5B',
  },
];

export const INITIAL_APP_STATE: AppStateData = {
  schoolProfile: {
    name: 'MI Miftahul Huda Kertosono',
    nsm: '111235180024',
    npsn: '60718912',
    address: 'Jl. Raya Miftahul Huda, Desa Kertosono, Kec. Panggul, Kab. Trenggalek, Jawa Timur',
    supervisorEmail: 'samsuriarifkom@gmail.com',
  },
  currentTeacher: INITIAL_TEACHERS[0],
  teachers: INITIAL_TEACHERS,
  students: INITIAL_STUDENTS,
  attendances: [
    {
      id: 'att-20260925-4A',
      date: '2026-09-25',
      className: 'Kelas 4A',
      records: INITIAL_STUDENTS.filter((s) => s.className === 'Kelas 4A').map((s, idx) => {
        let status: 'H' | 'S' | 'I' | 'A' = 'H';
        let notes = '';
        if (idx === 2) {
          status = 'S';
          notes = 'Demam flu sejak kemarin sore';
        } else if (idx === 9) {
          status = 'I';
          notes = 'Acara keluarga silaturahmi';
        }
        return {
          studentId: s.id,
          studentName: s.name,
          status,
          notes,
        };
      }),
      summary: {
        hadir: 18,
        sakit: 1,
        izin: 1,
        alpa: 0,
        total: 20,
      },
      submittedBy: 'Ahmad Fauzi, S.Pd.I',
      updatedAt: '2026-09-25T07:45:00.000Z',
    },
  ],
  journals: [
    {
      id: 'jrn-1',
      date: '2026-09-25',
      className: 'Kelas 4A',
      subject: 'Fikih',
      period: 'Jam 1-2 (07.15 - 08.25)',
      topic: 'Tanda-Tanda Baligh Bagi Laki-laki & Perempuan',
      activities: 'Ceramah interaktif, tanya jawab fiqih thaharah, dan pemaparan poster tanda baligh menurut Islam.',
      notes: 'Anak-anak sangat antusias dan tertib. Ahmad Zaidan sakit flu, materi akan disusulkan.',
      attendanceSummaryText: '18 Hadir, 1 Sakit, 1 Izin',
      teacherName: 'Ahmad Fauzi, S.Pd.I',
      createdAt: '2026-09-25T08:30:00.000Z',
    },
    {
      id: 'jrn-2',
      date: '2026-09-25',
      className: 'Kelas 4A',
      subject: 'Matematika',
      period: 'Jam 3-4 (08.45 - 09.55)',
      topic: 'Penjumlahan dan Pengurangan Pecahan Biasa',
      activities: 'Latihan soal kelompok menggunakan kertas lipat warna untuk visualisasi penyebut pecahan.',
      notes: 'Sebagian besar tuntas, 3 siswa butuh penguatan perkalian silang penyebut sama.',
      attendanceSummaryText: '18 Hadir, 1 Sakit, 1 Izin',
      teacherName: 'Ahmad Fauzi, S.Pd.I',
      createdAt: '2026-09-25T10:05:00.000Z',
    },
  ],
  grades: [
    {
      id: 'grd-1',
      subject: 'Fikih',
      assessmentName: 'Tugas 1 - Rukun & Syarat Thaharah',
      className: 'Kelas 4A',
      date: '2026-09-22',
      maxScore: 100,
      passingScore: 75,
      studentScores: INITIAL_STUDENTS.filter((s) => s.className === 'Kelas 4A').map((s, idx) => ({
        studentId: s.id,
        studentName: s.name,
        score: [88, 92, 78, 85, 90, 76, 82, 95, 84, 80, 86, 90, 88, 74, 85, 92, 79, 88, 75, 94][idx % 20],
        notes: idx === 13 ? 'Remedial soal nomor 4 dan 5' : 'Lengkap dan rapi',
      })),
    },
    {
      id: 'grd-2',
      subject: 'Matematika',
      assessmentName: 'UH 1 - Pecahan Senilai & Sederhana',
      className: 'Kelas 4A',
      date: '2026-09-24',
      maxScore: 100,
      passingScore: 75,
      studentScores: INITIAL_STUDENTS.filter((s) => s.className === 'Kelas 4A').map((s, idx) => ({
        studentId: s.id,
        studentName: s.name,
        score: [85, 90, 75, 88, 95, 78, 80, 92, 85, 72, 84, 88, 86, 76, 82, 90, 74, 85, 78, 92][idx % 20],
        notes: idx === 9 || idx === 16 ? 'Remedial hitungan penyebut berbeda' : 'Memuaskan',
      })),
    },
  ],
  schedules: [
    { id: 'sch-1', day: 'Senin', timeSlot: '07.00 - 07.45', periodNumber: 'Upacara', subject: 'Upacara Bendera & Doa Pagi', className: 'Halaman Madrasah', room: 'Lapangan' },
    { id: 'sch-2', day: 'Senin', timeSlot: '07.45 - 09.00', periodNumber: '1-2', subject: 'Al-Qur\'an Hadits', className: 'Kelas 4A', room: 'R. 4A' },
    { id: 'sch-3', day: 'Senin', timeSlot: '09.30 - 10.45', periodNumber: '3-4', subject: 'Bahasa Indonesia', className: 'Kelas 4A', room: 'R. 4A' },
    { id: 'sch-4', day: 'Senin', timeSlot: '11.00 - 12.10', periodNumber: '5-6', subject: 'Akidah Akhlak', className: 'Kelas 4B', room: 'R. 4B' },
    
    { id: 'sch-5', day: 'Selasa', timeSlot: '07.15 - 08.25', periodNumber: '1-2', subject: 'Matematika', className: 'Kelas 4A', room: 'R. 4A' },
    { id: 'sch-6', day: 'Selasa', timeSlot: '08.45 - 09.55', periodNumber: '3-4', subject: 'IPAS (Sains)', className: 'Kelas 4A', room: 'R. 4A' },
    { id: 'sch-7', day: 'Selasa', timeSlot: '10.15 - 11.25', periodNumber: '5-6', subject: 'Bahasa Jawa', className: 'Kelas 4A', room: 'R. 4A' },

    { id: 'sch-8', day: 'Rabu', timeSlot: '07.15 - 08.25', periodNumber: '1-2', subject: 'Fikih Ibadah', className: 'Kelas 4A', room: 'R. 4A' },
    { id: 'sch-9', day: 'Rabu', timeSlot: '08.45 - 09.55', periodNumber: '3-4', subject: 'Bahasa Arab', className: 'Kelas 4A', room: 'R. 4A' },
    { id: 'sch-10', day: 'Rabu', timeSlot: '10.15 - 11.25', periodNumber: '5-6', subject: 'Sejarah Kebudayaan Islam (SKI)', className: 'Kelas 5B', room: 'R. 5B' },

    { id: 'sch-11', day: 'Kamis', timeSlot: '07.15 - 08.25', periodNumber: '1-2', subject: 'Matematika Lanjut', className: 'Kelas 4A', room: 'R. 4A' },
    { id: 'sch-12', day: 'Kamis', timeSlot: '08.45 - 09.55', periodNumber: '3-4', subject: 'Seni Budaya & Prakarya', className: 'Kelas 4A', room: 'R. 4A' },
    { id: 'sch-13', day: 'Kamis', timeSlot: '10.15 - 11.25', periodNumber: '5-6', subject: 'Pendidikan Pancasila', className: 'Kelas 4A', room: 'R. 4A' },

    { id: 'sch-14', day: 'Jumat', timeSlot: '06.45 - 07.30', periodNumber: 'Sholat Dhuha', subject: 'Dhuha Bersama & Istighosah', className: 'Seluruh Siswa', room: 'Musholla Madrasah' },
    { id: 'sch-15', day: 'Jumat', timeSlot: '07.30 - 08.40', periodNumber: '1-2', subject: 'Fikih Praktik Ibadah', className: 'Kelas 4A', room: 'Musholla' },
    { id: 'sch-16', day: 'Jumat', timeSlot: '09.00 - 10.15', periodNumber: '3-4', subject: 'Infaq Jum\'at & Tahsin Qur\'an', className: 'Kelas 4A', room: 'R. 4A' },

    { id: 'sch-17', day: 'Sabtu', timeSlot: '07.00 - 08.30', periodNumber: 'Ekstra 1', subject: 'Pramuka Penggalang / Siaga MI', className: 'Kelas 3-4', room: 'Lapangan' },
    { id: 'sch-18', day: 'Sabtu', timeSlot: '09.00 - 10.30', periodNumber: 'Ekstra 2', subject: 'Bimbingan Baca Kitab / Khot Arab', className: 'Kelas 4A', room: 'R. 4A' },
  ],
  reminders: [
    {
      id: 'rem-1',
      title: 'Koreksi PR Matematika Pecahan Kelas 4A',
      description: 'Periksa buku tugas halaman 24 nomor 1-10 sebelum jam istirahat kedua.',
      dueDate: '2026-09-26',
      dueTime: '09:30',
      priority: 'tinggi',
      completed: false,
      category: 'Koreksi',
      createdAt: '2026-09-25T06:00:00.000Z',
    },
    {
      id: 'rem-2',
      title: 'Kirim Rekap Absensi Harian ke Pak Samsuri Arif',
      description: 'Kirimkan laporan harian via tombol email ke samsuriarifkom@gmail.com.',
      dueDate: '2026-09-25',
      dueTime: '13:00',
      priority: 'tinggi',
      completed: true,
      category: 'Administrasi',
      createdAt: '2026-09-25T06:30:00.000Z',
    },
    {
      id: 'rem-3',
      title: 'Kirim Pengumuman Infaq Jum\'at ke Grup WA Wali Murid',
      description: 'Gunakan Generator WA untuk memformat pengingat sedekah Jum\'at berkah.',
      dueDate: '2026-09-25',
      dueTime: '19:30',
      priority: 'sedang',
      completed: false,
      category: 'Wali Murid',
      createdAt: '2026-09-25T07:00:00.000Z',
    },
    {
      id: 'rem-4',
      title: 'Siapkan Modul Ajar Fikih Bab Mandi Wajib',
      description: 'Cetak lembar rukun mandi wajib untuk pertemuan Rabu depan.',
      dueDate: '2026-09-28',
      dueTime: '08:00',
      priority: 'biasa',
      completed: false,
      category: 'KBM',
      createdAt: '2026-09-25T08:00:00.000Z',
    },
  ],
  reports: [
    {
      id: 'rep-init-1',
      timestamp: '2026-09-25T13:02:15.000Z',
      teacherName: 'Ahmad Fauzi, S.Pd.I',
      className: 'Kelas 4A',
      reportType: 'Harian Lengkap',
      recipientEmail: 'samsuriarifkom@gmail.com',
      subject: '[LAPORAN HARIAN MI MIFTAHUL HUDA] Kelas 4A - 25 September 2026',
      contentSnippet: 'Kehadiran: 18 Hadir, 1 Sakit (Ahmad Zaidan), 1 Izin (Hana). Jurnal: 2 Sesi KBM (Fikih & Matematika).',
      status: 'Tersimpan di Cloud',
    },
  ],
};
