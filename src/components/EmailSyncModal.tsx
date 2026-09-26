import React, { useState } from 'react';
import { AppStateData, SentReportLog } from '../types';
import { Mail, CheckCircle2, ShieldCheck, Download, Upload, Copy, Send, FileSpreadsheet, RefreshCw, X, ExternalLink } from 'lucide-react';
import { generateSupervisorReportEmail, downloadCSV, getTodayDateString } from '../utils/formatters';
import { sendReportToSupervisor } from '../services/apiService';

interface EmailSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppStateData;
  onRestoreData: (restored: AppStateData) => void;
  onReportSentSuccess: (report: SentReportLog) => void;
  onToast: (text: string, title: string) => void;
}

export const EmailSyncModal: React.FC<EmailSyncModalProps> = ({
  isOpen,
  onClose,
  appState,
  onRestoreData,
  onReportSentSuccess,
  onToast,
}) => {
  const [reportType, setReportType] = useState<'Harian Lengkap' | 'Rekap Absensi' | 'Rekap Nilai' | 'Jurnal KBM'>('Harian Lengkap');
  const [selectedClass, setSelectedClass] = useState('Kelas 4A');
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const todayStr = getTodayDateString();
  const currentAttendance = appState.attendances.find((a) => a.date === todayStr && a.className === selectedClass) || appState.attendances[0];
  const todayJournals = appState.journals.filter((j) => j.date === todayStr);

  const { subject, body } = generateSupervisorReportEmail({
    date: todayStr,
    teacherName: appState.currentTeacher.name,
    className: selectedClass,
    attendance: currentAttendance,
    journals: todayJournals.length > 0 ? todayJournals : appState.journals.slice(0, 2),
    grades: appState.grades,
    reminders: appState.reminders,
  });

  const handleSendToSupervisor = async () => {
    setIsSending(true);
    try {
      const summarySnippet = currentAttendance
        ? `Kehadiran: ${currentAttendance.summary.hadir} Hadir, ${currentAttendance.summary.sakit} Sakit, ${currentAttendance.summary.izin} Izin. Jurnal: ${todayJournals.length} KBM.`
        : 'Laporan administrasi harian MI Miftahul Huda Kertosono.';

      const result = await sendReportToSupervisor({
        teacherName: appState.currentTeacher.name,
        className: selectedClass,
        reportType,
        subject,
        body,
        recordsSummary: summarySnippet,
      });

      if (result.report) {
        onReportSentSuccess(result.report);
      }

      onToast('Laporan berhasil direkam di sistem server!', 'Tersimpan Aman');

      // Open email client
      window.location.href = result.mailtoUrl;
    } catch (err: any) {
      onToast('Gagal memproses laporan email: ' + err.message, 'Perhatian');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    onToast('Format laporan lengkap disalin ke clipboard', 'Tersalin');
  };

  const handleExportAttendanceCSV = () => {
    let csv = 'Tanggal,Kelas,NIS,Nama Siswa,Status,Keterangan,Guru\n';
    appState.attendances.forEach((att) => {
      att.records.forEach((rec) => {
        const std = appState.students.find((s) => s.id === rec.studentId);
        csv += `"${att.date}","${att.className}","${std?.nis || ''}","${rec.studentName}","${rec.status}","${(rec.notes || '').replace(/"/g, '""')}","${att.submittedBy}"\n`;
      });
    });
    downloadCSV(csv, `rekap_absensi_miftahul_huda_${todayStr}.csv`);
    onToast('File rekap absensi berhasil diunduh', 'Unduh CSV Selesai');
  };

  const handleExportGradesCSV = () => {
    let csv = 'Mata Pelajaran,Penilaian,Kelas,Tanggal,KKM,Nama Siswa,Nilai,Status\n';
    appState.grades.forEach((g) => {
      g.studentScores.forEach((sc) => {
        const status = sc.score >= g.passingScore ? 'Tuntas' : 'Remedial';
        csv += `"${g.subject}","${g.assessmentName}","${g.className}","${g.date}",${g.passingScore},"${sc.studentName}",${sc.score},"${status}"\n`;
      });
    });
    downloadCSV(csv, `rekap_nilai_miftahul_huda_${todayStr}.csv`);
    onToast('File rekap nilai berhasil diunduh', 'Unduh CSV Selesai');
  };

  const handleBackupJSON = () => {
    const dataStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_portal_guru_mi_miftahul_huda_${todayStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onToast('Cadangan data berhasil disimpan', 'Backup Selesai');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.schoolProfile) {
          onRestoreData(parsed);
          onToast('Data berhasil dipulihkan dari file cadangan', 'Pemulihan Sukses');
        } else {
          alert('Format file cadangan tidak valid');
        }
      } catch (err) {
        alert('Gagal membaca file JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 border border-emerald-700/60 flex items-center justify-center text-amber-300">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Pusat Laporan & Sinkronisasi
              </h3>
              <p className="text-[11px] text-emerald-300 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Terhubung ke samsuriarifkom@gmail.com</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] p-2 text-emerald-300 hover:text-white rounded-xl transition-colors flex items-center justify-center"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Supervisor Card */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              SA
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold text-emerald-800 uppercase tracking-tight">
                Penerima & Pemantau Utama
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                Bapak Samsuri Arif, M.Kom / Kepala Madrasah
              </h4>
              <p className="text-xs text-emerald-800 font-mono mt-0.5 truncate">
                samsuriarifkom@gmail.com
              </p>
            </div>
          </div>

          {/* Quick 1-Tap Action: Send Report */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 mb-2">
              Kirim Laporan Terpadu Hari Ini
            </h4>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Pilih Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Kelas 4A">Kelas 4A</option>
                  <option value="Kelas 4B">Kelas 4B</option>
                  <option value="Kelas 5A">Kelas 5A</option>
                  <option value="Kelas 5B">Kelas 5B</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Jenis Laporan</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Harian Lengkap">Harian Lengkap</option>
                  <option value="Rekap Absensi">Rekap Absensi</option>
                  <option value="Jurnal KBM">Jurnal KBM</option>
                  <option value="Rekap Nilai">Rekap Nilai</option>
                </select>
              </div>
            </div>

            {/* Toggle Preview */}
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline"
              >
                {showPreview ? 'Sembunyikan Pratinjau Teks Laporan' : 'Lihat Pratinjau Teks Laporan Email'}
              </button>

              {showPreview && (
                <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                  <pre className="text-[11px] text-slate-700 whitespace-pre-wrap font-sans">
                    {body}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSendToSupervisor}
                disabled={isSending}
                className="flex-1 min-h-[46px] py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-emerald-300" />
                )}
                <span>Kirim ke samsuriarifkom@gmail.com</span>
              </button>

              <button
                onClick={handleCopyBody}
                title="Salin Isi Email"
                className="min-h-[46px] min-w-[46px] p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center transition-colors"
                aria-label="Salin Teks Email"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Export for Google Sheets */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Integrasi Google Sheets / Excel</span>
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Unduh data dalam format CSV yang kompatibel langsung dengan Google Sheets
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportAttendanceCSV}
                className="min-h-[42px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Unduh CSV Absensi</span>
              </button>

              <button
                onClick={handleExportGradesCSV}
                className="min-h-[42px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Unduh CSV Nilai</span>
              </button>
            </div>
          </div>

          {/* Backup & Restore Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Cadangan Database Sekolah (JSON)
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Simpan seluruh data absensi, nilai, jurnal, dan jadwal ke perangkat agar tidak hilang
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBackupJSON}
                className="flex-1 min-h-[42px] px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Backup JSON</span>
              </button>

              <label className="flex-1 min-h-[42px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Pulihkan Data</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Sent Reports History Log */}
          {appState.reports && appState.reports.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <h4 className="text-xs font-bold text-slate-800 mb-2">
                Riwayat Pengiriman Laporan
              </h4>
              <div className="space-y-2">
                {appState.reports.slice(0, 4).map((rep) => (
                  <div
                    key={rep.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-semibold text-emerald-800">{rep.reportType}</span>
                      <span>{new Date(rep.timestamp).toLocaleDateString('id-ID')}</span>
                    </div>
                    <p className="font-medium text-slate-800 truncate">{rep.subject}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {rep.contentSnippet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
