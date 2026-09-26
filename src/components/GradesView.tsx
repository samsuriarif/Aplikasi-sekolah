import React, { useState, useMemo } from 'react';
import { GradeItem, Student, ALL_CLASSES } from '../types';
import { Award, Plus, FileSpreadsheet, Copy, CheckCircle2, AlertTriangle, Search, ChevronRight, UserPlus } from 'lucide-react';
import { downloadCSV } from '../utils/formatters';

interface GradesViewProps {
  grades: GradeItem[];
  students: Student[];
  onSaveGradeItem: (gradeItem: GradeItem) => void;
  onCopyText: (text: string, title: string) => void;
  teacherName: string;
}

export const GradesView: React.FC<GradesViewProps> = ({
  grades,
  students,
  onSaveGradeItem,
  onCopyText,
  teacherName,
}) => {
  const [selectedGradeId, setSelectedGradeId] = useState<string>(() => grades[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New assessment form state
  const [newSubject, setNewSubject] = useState('Al-Qur\'an Hadits');
  const [newAssessmentName, setNewAssessmentName] = useState('');
  const [newClassName, setNewClassName] = useState('Kelas 4A');
  const [newPassingScore, setNewPassingScore] = useState(75);

  const activeGradeItem = useMemo(() => {
    return grades.find((g) => g.id === selectedGradeId) || grades[0];
  }, [grades, selectedGradeId]);

  // Working scores state
  const [currentScores, setCurrentScores] = useState<GradeItem['studentScores']>(() => {
    return activeGradeItem ? activeGradeItem.studentScores : [];
  });

  React.useEffect(() => {
    if (activeGradeItem) {
      setCurrentScores(activeGradeItem.studentScores);
    }
  }, [activeGradeItem]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (!currentScores || currentScores.length === 0) {
      return { avg: 0, passed: 0, remedial: 0, highest: 0, lowest: 0 };
    }
    const scores = currentScores.map((s) => s.score);
    const sum = scores.reduce((acc, c) => acc + c, 0);
    const avg = Math.round(sum / scores.length);
    const passingScore = activeGradeItem?.passingScore || 75;
    const passed = currentScores.filter((s) => s.score >= passingScore).length;
    const remedial = currentScores.length - passed;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    return { avg, passed, remedial, highest, lowest };
  }, [currentScores, activeGradeItem]);

  const handleScoreChange = (studentId: string, valStr: string) => {
    let score = parseInt(valStr, 10);
    if (isNaN(score)) score = 0;
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    const updated = currentScores.map((s) => (s.studentId === studentId ? { ...s, score } : s));
    setCurrentScores(updated);

    if (activeGradeItem) {
      onSaveGradeItem({
        ...activeGradeItem,
        studentScores: updated,
      });
    }
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessmentName.trim()) return;

    const classStudents = students.filter((s) => s.className === newClassName);
    const newItem: GradeItem = {
      id: `grd-${Date.now()}`,
      subject: newSubject,
      assessmentName: newAssessmentName.trim(),
      className: newClassName,
      date: new Date().toISOString().split('T')[0],
      maxScore: 100,
      passingScore: newPassingScore,
      studentScores: classStudents.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        score: 80,
        notes: '',
      })),
    };

    onSaveGradeItem(newItem);
    setSelectedGradeId(newItem.id);
    setIsNewModalOpen(false);
    setNewAssessmentName('');
  };

  const handleExportCSV = () => {
    if (!activeGradeItem) return;
    let csv = `Mata Pelajaran: ${activeGradeItem.subject}\n`;
    csv += `Penilaian: ${activeGradeItem.assessmentName}\n`;
    csv += `Kelas: ${activeGradeItem.className}\n`;
    csv += `KKM: ${activeGradeItem.passingScore}\n\n`;
    csv += `No,NIS,Nama Siswa,Nilai,Status,Catatan\n`;

    activeGradeItem.studentScores.forEach((sc, idx) => {
      const student = students.find((s) => s.id === sc.studentId);
      const status = sc.score >= activeGradeItem.passingScore ? 'Tuntas' : 'Remedial';
      csv += `${idx + 1},"${student?.nis || ''}","${sc.studentName}",${sc.score},"${status}","${(sc.notes || '').replace(/"/g, '""')}"\n`;
    });

    downloadCSV(csv, `nilai_${activeGradeItem.subject}_${activeGradeItem.className}.csv`);
    onCopyText('File CSV berhasil diunduh untuk Google Sheets', 'Unduhan Berhasil');
  };

  const handleCopyWA = () => {
    if (!activeGradeItem) return;
    let text = `*REKAP NILAI SISWA MI MIFTAHUL HUDA*\n`;
    text += `───────────────────────\n`;
    text += `📖 *Mata Pelajaran:* ${activeGradeItem.subject}\n`;
    text += `📝 *Penilaian:* ${activeGradeItem.assessmentName}\n`;
    text += `🏫 *Kelas:* ${activeGradeItem.className} | *KKM:* ${activeGradeItem.passingScore}\n`;
    text += `📊 *Statistik:* Rata-rata ${stats.avg} | Tuntas: ${stats.passed} anak | Remedial: ${stats.remedial} anak\n\n`;
    text += `📋 *Daftar Nilai Siswa:*\n`;

    activeGradeItem.studentScores.forEach((s, idx) => {
      const pred = s.score >= 90 ? 'A' : s.score >= 80 ? 'B' : s.score >= activeGradeItem.passingScore ? 'C' : 'D';
      text += `${idx + 1}. ${s.studentName}: *${s.score}* (${pred})\n`;
    });

    text += `\n───────────────────────\n`;
    text += `👨‍🏫 *Guru Pengampu:* ${teacherName}\n`;
    text += `_Portal Guru MI Miftahul Huda Kertosono_`;

    onCopyText(text, 'Rekap Nilai Siap Kirim ke WA');
  };

  const filteredScores = currentScores.filter((s) =>
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 pt-2 px-3 max-w-lg mx-auto">
      {/* Header & Assessment Switcher */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 mb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-800">Bank Nilai & Tugas</h2>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="min-h-[40px] px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-[0.98] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Penilaian</span>
          </button>
        </div>

        {/* Assessment Select Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {grades.map((g) => {
            const isSelected = g.id === activeGradeItem?.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGradeId(g.id)}
                className={`px-3 py-2 text-xs font-medium rounded-xl whitespace-nowrap text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-950/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="font-bold text-[11px] truncate">{g.subject}</div>
                <div className="text-[10px] opacity-90 truncate max-w-[150px]">{g.assessmentName}</div>
              </button>
            );
          })}
        </div>
      </div>

      {activeGradeItem && (
        <>
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-2.5 text-center">
              <span className="block text-[10px] font-semibold text-emerald-800 uppercase tracking-tight">Rata-Rata</span>
              <span className="text-2xl font-bold text-emerald-950 tabular-nums">{stats.avg}</span>
              <span className="block text-[10px] text-emerald-700 mt-0.5">KKM {activeGradeItem.passingScore}</span>
            </div>
            <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-2.5 text-center">
              <span className="block text-[10px] font-semibold text-blue-800 uppercase tracking-tight">Tuntas</span>
              <span className="text-2xl font-bold text-blue-950 tabular-nums">{stats.passed}</span>
              <span className="block text-[10px] text-blue-700 mt-0.5">Siswa</span>
            </div>
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-2.5 text-center">
              <span className="block text-[10px] font-semibold text-amber-800 uppercase tracking-tight">Remedial</span>
              <span className="text-2xl font-bold text-amber-950 tabular-nums">{stats.remedial}</span>
              <span className="block text-[10px] text-amber-700 mt-0.5">Siswa</span>
            </div>
          </div>

          {/* Quick Export Bar */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={handleCopyWA}
              className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
            >
              <Copy className="w-4 h-4 text-emerald-400" />
              <span>Salin Rekap WA</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="min-h-[44px] px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Unduh CSV Sheets</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari siswa dalam daftar nilai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
            />
          </div>

          {/* Student Grade Cards List */}
          <div className="space-y-2 mb-6">
            {filteredScores.map((scoreItem, idx) => {
              const isPassing = scoreItem.score >= activeGradeItem.passingScore;
              const predikat =
                scoreItem.score >= 90
                  ? 'Sangat Baik (A)'
                  : scoreItem.score >= 80
                  ? 'Baik (B)'
                  : isPassing
                  ? 'Cukup (C)'
                  : 'Perlu Remedial (D)';

              return (
                <div
                  key={scoreItem.studentId}
                  className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                        {scoreItem.studentName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                        <span
                          className={`font-semibold ${
                            isPassing ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {predikat}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Touch Friendly Score Input with +/- controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        handleScoreChange(scoreItem.studentId, String(Math.max(0, scoreItem.score - 5)))
                      }
                      className="min-h-[40px] min-w-[36px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold flex items-center justify-center active:scale-95 transition-transform"
                      aria-label="Kurangi nilai 5"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={scoreItem.score}
                      onChange={(e) => handleScoreChange(scoreItem.studentId, e.target.value)}
                      className={`w-14 min-h-[40px] text-center font-bold text-sm rounded-lg border focus:outline-none focus:ring-2 tabular-nums ${
                        isPassing
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 focus:ring-emerald-500'
                          : 'bg-rose-50 text-rose-900 border-rose-300 focus:ring-rose-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleScoreChange(scoreItem.studentId, String(Math.min(100, scoreItem.score + 5)))
                      }
                      className="min-h-[40px] min-w-[36px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold flex items-center justify-center active:scale-95 transition-transform"
                      aria-label="Tambah nilai 5"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal Add New Assessment */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-4 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Buat Penilaian / Tugas Baru</h3>
            <form onSubmit={handleCreateAssessment}>
              <div className="mb-2.5">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Contoh: Al-Qur'an Hadits"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="mb-2.5">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Penilaian / Bab
                </label>
                <input
                  type="text"
                  value={newAssessmentName}
                  onChange={(e) => setNewAssessmentName(e.target.value)}
                  placeholder="Contoh: UH 2 - Surat Al-Adiyat"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {ALL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nilai KKM
                  </label>
                  <input
                    type="number"
                    value={newPassingScore}
                    onChange={(e) => setNewPassingScore(parseInt(e.target.value, 10) || 75)}
                    className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan Penilaian
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
