import React, { useState, useMemo } from 'react';
import { DailyAttendance, Student, AttendanceStatus, ALL_CLASSES } from '../types';
import { Check, CheckCheck, Copy, Share2, Search, Calendar, Users, AlertCircle, UserPlus } from 'lucide-react';
import { formatIndonesianDate } from '../utils/formatters';

interface AttendanceViewProps {
  students: Student[];
  attendances: DailyAttendance[];
  onSaveAttendance: (attendance: DailyAttendance) => void;
  onCopyText: (text: string, title: string) => void;
  teacherName: string;
  onNavigateToWA?: (draft: string) => void;
  onNavigateToStudents?: (className?: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendances,
  onSaveAttendance,
  onCopyText,
  teacherName,
  onNavigateToWA,
  onNavigateToStudents,
}) => {
  const [selectedClass, setSelectedClass] = useState('Kelas 4A');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Find attendance for selected date and class
  const existingAttendance = useMemo(() => {
    return attendances.find((a) => a.date === selectedDate && a.className === selectedClass);
  }, [attendances, selectedDate, selectedClass]);

  // Current working records
  const [records, setRecords] = useState<DailyAttendance['records']>(() => {
    if (existingAttendance) return existingAttendance.records;
    return students
      .filter((s) => s.className === selectedClass)
      .map((s) => ({
        studentId: s.id,
        studentName: s.name,
        status: 'H' as AttendanceStatus,
        notes: '',
      }));
  });

  // Re-sync if existingAttendance changes or date/class changes
  React.useEffect(() => {
    if (existingAttendance) {
      setRecords(existingAttendance.records);
    } else {
      setRecords(
        students
          .filter((s) => s.className === selectedClass)
          .map((s) => ({
            studentId: s.id,
            studentName: s.name,
            status: 'H' as AttendanceStatus,
            notes: '',
          }))
      );
    }
    setHasUnsavedChanges(false);
  }, [existingAttendance, selectedDate, selectedClass, students]);

  // Summary counts
  const summary = useMemo(() => {
    const hadir = records.filter((r) => r.status === 'H').length;
    const sakit = records.filter((r) => r.status === 'S').length;
    const izin = records.filter((r) => r.status === 'I').length;
    const alpa = records.filter((r) => r.status === 'A').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { hadir, sakit, izin, alpa, total, percentage };
  }, [records]);

  // Handle status update
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((rec) => (rec.studentId === studentId ? { ...rec, status } : rec))
    );
    setHasUnsavedChanges(true);
  };

  // Handle note change
  const handleNoteChange = (studentId: string, notes: string) => {
    setRecords((prev) =>
      prev.map((rec) => (rec.studentId === studentId ? { ...rec, notes } : rec))
    );
    setHasUnsavedChanges(true);
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    setRecords((prev) =>
      prev.map((rec) => ({
        ...rec,
        status: 'H',
        notes: '',
      }))
    );
    setHasUnsavedChanges(true);
  };

  // Save attendance
  const handleSave = () => {
    const newAttendance: DailyAttendance = {
      id: existingAttendance ? existingAttendance.id : `att-${selectedDate}-${selectedClass.replace(/\s+/g, '')}`,
      date: selectedDate,
      className: selectedClass,
      records,
      summary: {
        hadir: summary.hadir,
        sakit: summary.sakit,
        izin: summary.izin,
        alpa: summary.alpa,
        total: summary.total,
      },
      submittedBy: teacherName,
      updatedAt: new Date().toISOString(),
    };
    onSaveAttendance(newAttendance);
    setHasUnsavedChanges(false);
  };

  // Generate WA text
  const generateWhatsAppText = () => {
    const dateFormatted = formatIndonesianDate(selectedDate);
    const absentList = records.filter((r) => r.status !== 'H');

    let text = `*LAPORAN KEHADIRAN SISWA*\n`;
    text += `*MI MIFTAHUL HUDA KERTOSONO*\n`;
    text += `───────────────────────\n`;
    text += `📅 *Hari, Tanggal:* ${dateFormatted}\n`;
    text += `🏫 *Kelas:* ${selectedClass}\n`;
    text += `👨‍🏫 *Wali Kelas:* ${teacherName}\n\n`;
    text += `📊 *Ringkasan Kehadiran:*\n`;
    text += `• Total Siswa : ${summary.total} anak\n`;
    text += `• Hadir       : ${summary.hadir} anak (${summary.percentage}%)\n`;
    text += `• Sakit (S)   : ${summary.sakit} anak\n`;
    text += `• Izin (I)    : ${summary.izin} anak\n`;
    text += `• Alpa (A)    : ${summary.alpa} anak\n\n`;

    if (absentList.length > 0) {
      text += `📝 *Siswa Tidak Hadir:*\n`;
      absentList.forEach((r, idx) => {
        const st = r.status === 'S' ? 'Sakit' : r.status === 'I' ? 'Izin' : 'Alpa';
        text += `${idx + 1}. ${r.studentName} (${st})${r.notes ? ` - _${r.notes}_` : ''}\n`;
      });
      text += `\n`;
    } else {
      text += ` Alhamdulillah seluruh siswa hadir lengkap! ✨\n\n`;
    }

    text += `Semoga ananda yang sedang sakit lekas diberikan kesembuhan oleh Allah SWT. Aamiin.\n`;
    text += `───────────────────────\n`;
    text += `_Disampaikan dari Portal Guru MI Miftahul Huda_`;

    return text;
  };

  const handleCopyWA = () => {
    const text = generateWhatsAppText();
    onCopyText(text, 'Rekap Absensi Disalin');
  };

  const handleOpenInWAGenerator = () => {
    if (onNavigateToWA) {
      onNavigateToWA(generateWhatsAppText());
    }
  };

  // Filtered student list
  const filteredRecords = records.filter((r) =>
    r.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 pt-2 px-3 max-w-lg mx-auto">
      {/* Top Filter & Control Card */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/90 mb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>Pilih Tanggal:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                selectedDate === new Date().toISOString().split('T')[0]
                  ? 'bg-emerald-100 text-emerald-800 font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hari Ini
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-medium bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Class Tabs - All 12 Classes 1A to 6B */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {ALL_CLASSES.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedClass === cls
                  ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-900/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-2.5 text-center">
          <span className="block text-[11px] font-semibold text-emerald-800 uppercase tracking-tight">Hadir</span>
          <span className="text-xl font-bold text-emerald-900 tabular-nums">{summary.hadir}</span>
          <span className="block text-[10px] text-emerald-700/80 mt-0.5">{summary.percentage}%</span>
        </div>
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-2.5 text-center">
          <span className="block text-[11px] font-semibold text-amber-800 uppercase tracking-tight">Sakit</span>
          <span className="text-xl font-bold text-amber-900 tabular-nums">{summary.sakit}</span>
          <span className="block text-[10px] text-amber-700/80 mt-0.5">Siswa</span>
        </div>
        <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-2.5 text-center">
          <span className="block text-[11px] font-semibold text-blue-800 uppercase tracking-tight">Izin</span>
          <span className="text-xl font-bold text-blue-900 tabular-nums">{summary.izin}</span>
          <span className="block text-[10px] text-blue-700/80 mt-0.5">Siswa</span>
        </div>
        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-2.5 text-center">
          <span className="block text-[11px] font-semibold text-rose-800 uppercase tracking-tight">Alpa</span>
          <span className="text-xl font-bold text-rose-900 tabular-nums">{summary.alpa}</span>
          <span className="block text-[10px] text-rose-700/80 mt-0.5">Siswa</span>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          onClick={handleMarkAllPresent}
          className="flex-1 min-h-[44px] px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
        >
          <CheckCheck className="w-4 h-4 text-emerald-200" />
          <span>Semua Hadir</span>
        </button>

        <button
          onClick={handleCopyWA}
          className="flex-1 min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
        >
          <Copy className="w-4 h-4 text-slate-300" />
          <span>Salin ke WA</span>
        </button>

        {onNavigateToWA && (
          <button
            onClick={handleOpenInWAGenerator}
            title="Kirim Format WA"
            className="min-h-[44px] min-w-[44px] px-2.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center shadow-sm active:scale-[0.98] transition-all"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama siswa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
        />
      </div>

      {/* Student List Cards */}
      <div className="space-y-2 mb-6">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-slate-500 border border-slate-200">
            <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <h3 className="text-xs font-bold text-slate-700">Belum Ada Siswa di {selectedClass}</h3>
            <p className="text-[11px] text-slate-400 mt-1 mb-3">
              Data kehadiran akan otomatis muncul setelah siswa diinput ke kelas ini.
            </p>
            {onNavigateToStudents && (
              <button
                onClick={() => onNavigateToStudents(selectedClass)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Kelola / Tambah Siswa {selectedClass}</span>
              </button>
            )}
          </div>
        ) : (
          filteredRecords.map((record, index) => {
            const studentInfo = students.find((s) => s.id === record.studentId);
            const isNonPresent = record.status !== 'H';

            return (
              <div
                key={record.studentId}
                className={`bg-white rounded-2xl p-3 border transition-all ${
                  isNonPresent
                    ? 'border-amber-300 shadow-sm bg-amber-50/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Student Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate leading-snug">
                          {record.studentName}
                        </span>
                        <span className="text-[10px] text-slate-600 shrink-0">
                          ({studentInfo?.gender})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600 block mt-0.5">
                        NIS: {studentInfo?.nis || '-'}
                      </span>
                    </div>
                  </div>

                  {/* 44px Ergonomic Thumb Hitbox Status Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Hadir */}
                    <button
                      onClick={() => handleStatusChange(record.studentId, 'H')}
                      className={`min-h-[44px] min-w-[38px] px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        record.status === 'H'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20 scale-105'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      aria-label="Hadir"
                    >
                      H
                    </button>

                    {/* Sakit */}
                    <button
                      onClick={() => handleStatusChange(record.studentId, 'S')}
                      className={`min-h-[44px] min-w-[38px] px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        record.status === 'S'
                          ? 'bg-amber-500 text-white shadow-sm shadow-amber-600/20 scale-105'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      aria-label="Sakit"
                    >
                      S
                    </button>

                    {/* Izin */}
                    <button
                      onClick={() => handleStatusChange(record.studentId, 'I')}
                      className={`min-h-[44px] min-w-[38px] px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        record.status === 'I'
                          ? 'bg-blue-500 text-white shadow-sm shadow-blue-600/20 scale-105'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      aria-label="Izin"
                    >
                      I
                    </button>

                    {/* Alpa */}
                    <button
                      onClick={() => handleStatusChange(record.studentId, 'A')}
                      className={`min-h-[44px] min-w-[38px] px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        record.status === 'A'
                          ? 'bg-rose-500 text-white shadow-sm shadow-rose-600/20 scale-105'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      aria-label="Alpa"
                    >
                      A
                    </button>
                  </div>
                </div>

                {/* Note input if Sakit, Izin, or Alpa */}
                {isNonPresent && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <input
                      type="text"
                      placeholder={`Keterangan ${record.status === 'S' ? 'sakit (cth: demam, rawat jalan)' : record.status === 'I' ? 'izin (cth: ada hajat keluarga)' : 'tanpa kabar'}...`}
                      value={record.notes || ''}
                      onChange={(e) => handleNoteChange(record.studentId, e.target.value)}
                      className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Thumb Save Button Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={handleSave}
            className="w-full min-h-[48px] py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-950/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Check className="w-5 h-5 text-emerald-300" />
            <span>Simpan Perubahan Absensi Hari Ini</span>
          </button>
        </div>
      )}
    </div>
  );
};
