import React, { useState, useEffect } from 'react';
import { AppStateData, DailyAttendance, ClassJournal, GradeItem, TeachingSchedule, TeacherReminder, SentReportLog, Student, Teacher } from './types';
import { INITIAL_APP_STATE } from './data/initialData';
import { fetchAppData, saveAppData } from './services/apiService';
import { Header } from './components/Header';
import { BottomNav, TabKey } from './components/BottomNav';
import { AttendanceView } from './components/AttendanceView';
import { StudentManagementView } from './components/StudentManagementView';
import { TeacherManagementView } from './components/TeacherManagementView';
import { JournalView } from './components/JournalView';
import { WhatsAppGeneratorView } from './components/WhatsAppGeneratorView';
import { GradesView } from './components/GradesView';
import { ScheduleView } from './components/ScheduleView';
import { RemindersModal } from './components/RemindersModal';
import { EmailSyncModal } from './components/EmailSyncModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { playChime } from './utils/audioNotification';

export default function App() {
  const [appState, setAppState] = useState<AppStateData>(INITIAL_APP_STATE);
  const [activeTab, setActiveTab] = useState<TabKey>('absensi');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isEmailSyncOpen, setIsEmailSyncOpen] = useState(false);
  const [waDraftText, setWaDraftText] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  // Initialize data on mount
  useEffect(() => {
    async function loadData() {
      const data = await fetchAppData();
      setAppState(data);
    }
    loadData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync to storage & backend whenever appState updates
  const updateStateAndPersist = (updater: (prev: AppStateData) => AppStateData) => {
    setAppState((prev) => {
      const next = updater(prev);
      saveAppData(next);
      return next;
    });
  };

  // Toast notifications helper
  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    playChime(type === 'error' ? 'reminder' : 'success');

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Clipboard copy helper
  const handleCopyText = (text: string, title: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast(title, 'Teks berhasil disalin ke papan klip!'),
        () => fallbackCopyText(text, title)
      );
    } else {
      fallbackCopyText(text, title);
    }
  };

  const fallbackCopyText = (text: string, title: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(title, 'Teks berhasil disalin!');
    } catch {
      showToast('Gagal menyalin teks', 'Silakan salin teks secara manual', 'error');
    }
  };

  // Navigation to WA with custom draft
  const handleNavigateToWA = (draft: string) => {
    setWaDraftText(draft);
    setActiveTab('pesan-wa');
    showToast('Teks Dipindahkan ke Generator WA', 'Format pesan siap ditinjau dan dikirim');
  };

  // Navigation to Students tab
  const handleNavigateToStudents = () => {
    setActiveTab('siswa');
  };

  // Student management handlers
  const handleAddStudent = (student: Student) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      students: [...prev.students, student],
    }));
  };

  const handleUpdateStudent = (student: Student) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === student.id ? student : s)),
    }));
  };

  const handleDeleteStudent = (id: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
      attendances: prev.attendances.map((att) => ({
        ...att,
        records: att.records.filter((r) => r.studentId !== id),
      })),
    }));
  };

  const handleBatchAddStudents = (newStudents: Student[]) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      students: [...prev.students, ...newStudents],
    }));
  };

  // Teacher management handlers
  const handleAddTeacher = (teacher: Teacher) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      teachers: [...(prev.teachers || []), teacher],
    }));
  };

  const handleUpdateTeacher = (teacher: Teacher) => {
    updateStateAndPersist((prev) => {
      const updatedList = (prev.teachers || []).map((t) => (t.id === teacher.id ? teacher : t));
      const isCurrent = prev.currentTeacher.id === teacher.id || prev.currentTeacher.name === teacher.name;
      return {
        ...prev,
        teachers: updatedList,
        currentTeacher: isCurrent ? teacher : prev.currentTeacher,
      };
    });
  };

  const handleDeleteTeacher = (id: string) => {
    updateStateAndPersist((prev) => {
      const remaining = (prev.teachers || []).filter((t) => t.id !== id);
      const isCurrent = prev.currentTeacher.id === id;
      const nextCurrent = isCurrent && remaining.length > 0 ? remaining[0] : prev.currentTeacher;
      return {
        ...prev,
        teachers: remaining,
        currentTeacher: nextCurrent,
      };
    });
  };

  const handleSelectCurrentTeacher = (teacher: Teacher) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      currentTeacher: teacher,
    }));
    showToast('Profil Guru Aktif Diubah', `Sekarang Anda aktif sebagai ${teacher.name} (${teacher.assignedClass})`);
  };

  // Save attendance
  const handleSaveAttendance = (newAttendance: DailyAttendance) => {
    updateStateAndPersist((prev) => {
      const idx = prev.attendances.findIndex(
        (a) => a.date === newAttendance.date && a.className === newAttendance.className
      );
      let updatedList = [...prev.attendances];
      if (idx >= 0) {
        updatedList[idx] = newAttendance;
      } else {
        updatedList.unshift(newAttendance);
      }
      return { ...prev, attendances: updatedList };
    });
    showToast('Absensi Tersimpan', `Data kehadiran ${newAttendance.className} berhasil direkam.`);
  };

  // Journal handlers
  const handleAddJournal = (journal: ClassJournal) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      journals: [journal, ...prev.journals],
    }));
    showToast('Jurnal Ditambahkan', `Materi ${journal.subject} tersimpan.`);
  };

  const handleDeleteJournal = (id: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      journals: prev.journals.filter((j) => j.id !== id),
    }));
    showToast('Jurnal Dihapus', 'Catatan KBM telah dihapus.');
  };

  // Grades handlers
  const handleSaveGradeItem = (gradeItem: GradeItem) => {
    updateStateAndPersist((prev) => {
      const idx = prev.grades.findIndex((g) => g.id === gradeItem.id);
      let updatedGrades = [...prev.grades];
      if (idx >= 0) {
        updatedGrades[idx] = gradeItem;
      } else {
        updatedGrades.unshift(gradeItem);
      }
      return { ...prev, grades: updatedGrades };
    });
    showToast('Nilai Disimpan', `Rekap penilaian ${gradeItem.subject} diperbarui.`);
  };

  // Schedule handlers
  const handleAddSchedule = (schedule: TeachingSchedule) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      schedules: [...prev.schedules, schedule],
    }));
    showToast('Jadwal Ditambahkan', `${schedule.subject} (${schedule.day}) ditambahkan.`);
  };

  const handleDeleteSchedule = (id: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((s) => s.id !== id),
    }));
    showToast('Jadwal Dihapus', 'Jam mengajar dihapus.');
  };

  // Reminder handlers
  const handleToggleReminder = (id: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) =>
        r.id === id ? { ...r, completed: !r.completed } : r
      ),
    }));
  };

  const handleAddReminder = (reminder: TeacherReminder) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      reminders: [reminder, ...prev.reminders],
    }));
    showToast('Pengingat Disimpan', reminder.title);
  };

  const handleDeleteReminder = (id: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((r) => r.id !== id),
    }));
    showToast('Pengingat Dihapus', 'Tugas dihapus dari daftar.');
  };

  // Data restore & report sent handlers
  const handleRestoreData = (restored: AppStateData) => {
    setAppState(restored);
    saveAppData(restored);
    showToast('Data Dipulihkan', 'Seluruh data berhasil diperbarui dari cadangan.');
  };

  const handleReportSentSuccess = (report: SentReportLog) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      reports: [report, ...(prev.reports || [])],
    }));
  };

  // Count pending tasks
  const pendingRemindersCount = appState.reminders.filter((r) => !r.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Toast Alert System */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Mobile Top Bar */}
      <Header
        teacherName={appState.currentTeacher.name}
        className={appState.currentTeacher.assignedClass}
        pendingRemindersCount={pendingRemindersCount}
        onOpenReminders={() => setIsRemindersOpen(true)}
        onOpenEmailSync={() => setIsEmailSyncOpen(true)}
        onOpenTeachers={() => setActiveTab('guru')}
        onOpenSchedule={() => setActiveTab('jadwal')}
        isOnline={isOnline}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'absensi' && (
          <AttendanceView
            students={appState.students}
            attendances={appState.attendances}
            onSaveAttendance={handleSaveAttendance}
            onCopyText={handleCopyText}
            teacherName={appState.currentTeacher.name}
            onNavigateToWA={handleNavigateToWA}
            onNavigateToStudents={handleNavigateToStudents}
          />
        )}

        {activeTab === 'siswa' && (
          <StudentManagementView
            students={appState.students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onBatchAddStudents={handleBatchAddStudents}
            onToast={showToast}
          />
        )}

        {activeTab === 'guru' && (
          <TeacherManagementView
            teachers={appState.teachers || INITIAL_APP_STATE.teachers}
            currentTeacherId={appState.currentTeacher.id}
            onSelectCurrentTeacher={handleSelectCurrentTeacher}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onToast={showToast}
          />
        )}

        {activeTab === 'jurnal' && (
          <JournalView
            journals={appState.journals}
            onAddJournal={handleAddJournal}
            onDeleteJournal={handleDeleteJournal}
            onCopyText={handleCopyText}
            teacherName={appState.currentTeacher.name}
          />
        )}

        {activeTab === 'pesan-wa' && (
          <WhatsAppGeneratorView
            initialDraft={waDraftText}
            onCopyText={handleCopyText}
            teacherName={appState.currentTeacher.name}
            defaultClass={appState.currentTeacher.assignedClass}
          />
        )}

        {activeTab === 'nilai' && (
          <GradesView
            grades={appState.grades}
            students={appState.students}
            onSaveGradeItem={handleSaveGradeItem}
            onCopyText={handleCopyText}
            teacherName={appState.currentTeacher.name}
          />
        )}

        {activeTab === 'jadwal' && (
          <div>
            <ScheduleView
              schedules={appState.schedules}
              onAddSchedule={handleAddSchedule}
              onDeleteSchedule={handleDeleteSchedule}
              teacherName={appState.currentTeacher.name}
            />

            {/* Quick Link to Supervisor Email & Recap */}
            <div className="px-3 max-w-lg mx-auto pb-24 -mt-20">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">Laporan & Pantauan Guru</h4>
                  <p className="text-[11px] text-emerald-800">Kirim rekap ke samsuriarifkom@gmail.com</p>
                </div>
                <button
                  onClick={() => setIsEmailSyncOpen(true)}
                  className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm"
                >
                  Buka Laporan
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'laporan' && (
          <div className="p-3 max-w-lg mx-auto pb-24">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 mb-3">
              <h2 className="text-sm font-bold text-slate-900 mb-1">
                Pusat Rekap & Pantauan Madrasah
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                Seluruh data tersinkronisasi dan dapat langsung dilaporkan ke email Kepala Madrasah / Supervisor.
              </p>
              <button
                onClick={() => setIsEmailSyncOpen(true)}
                className="w-full min-h-[46px] py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Buka Panel Sinkronisasi & Kirim Laporan</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Total Siswa Terdaftar</span>
                <span className="text-xl font-bold text-emerald-900">{appState.students.length} Siswa</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Jurnal KBM Tercatat</span>
                <span className="text-xl font-bold text-emerald-900">{appState.journals.length} Sesi</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-3">
              <h3 className="text-xs font-bold text-emerald-950 mb-1">
                Pengawas & Penanggung Jawab
              </h3>
              <p className="text-xs text-emerald-800 font-medium">
                Bapak Samsuri Arif, M.Kom (samsuriarifkom@gmail.com)
              </p>
              <p className="text-[11px] text-emerald-700/90 mt-1">
                MI Miftahul Huda Kertosono, Kec. Panggul, Kab. Trenggalek, Jawa Timur
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Ergonomic Bottom Tab Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          playChime('pop');
        }}
      />

      {/* Task Reminders Drawer / Modal */}
      <RemindersModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        reminders={appState.reminders}
        onToggleComplete={handleToggleReminder}
        onAddReminder={handleAddReminder}
        onDeleteReminder={handleDeleteReminder}
      />

      {/* Supervisor Email Report & Sheets Sync Modal */}
      <EmailSyncModal
        isOpen={isEmailSyncOpen}
        onClose={() => setIsEmailSyncOpen(false)}
        appState={appState}
        onRestoreData={handleRestoreData}
        onReportSentSuccess={handleReportSentSuccess}
        onToast={showToast}
      />
    </div>
  );
}
