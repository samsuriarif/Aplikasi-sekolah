import React, { useState } from 'react';
import { ClassJournal, ALL_CLASSES } from '../types';
import { BookOpen, Plus, Calendar, Clock, Copy, Trash2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatIndonesianDate, getTodayDateString } from '../utils/formatters';

interface JournalViewProps {
  journals: ClassJournal[];
  onAddJournal: (journal: ClassJournal) => void;
  onDeleteJournal: (id: string) => void;
  onCopyText: (text: string, title: string) => void;
  teacherName: string;
}

const MI_SUBJECTS = [
  'Fikih',
  'Al-Qur\'an Hadits',
  'Akidah Akhlak',
  'Sejarah Kebudayaan Islam (SKI)',
  'Bahasa Arab',
  'Matematika',
  'Bahasa Indonesia',
  'IPAS (Ilmu Pengetahuan Alam & Sosial)',
  'Pendidikan Pancasila',
  'Seni Budaya & Prakarya',
  'Bahasa Jawa',
  'PJOK',
];

export const JournalView: React.FC<JournalViewProps> = ({
  journals,
  onAddJournal,
  onDeleteJournal,
  onCopyText,
  teacherName,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [date, setDate] = useState(getTodayDateString());
  const [className, setClassName] = useState('Kelas 4A');
  const [subject, setSubject] = useState('Fikih');
  const [period, setPeriod] = useState('Jam 1-2 (07.15 - 08.25)');
  const [topic, setTopic] = useState('');
  const [activities, setActivities] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const newJournal: ClassJournal = {
      id: `jrn-${Date.now()}`,
      date,
      className,
      subject,
      period,
      topic: topic.trim(),
      activities: activities.trim() || 'Pembelajaran interaktif, penyampaian materi, dan latihan soal.',
      notes: notes.trim() || 'KBM berjalan lancar dan kondusif.',
      attendanceSummaryText: 'Kehadiran tertib',
      teacherName,
      createdAt: new Date().toISOString(),
    };

    onAddJournal(newJournal);
    setTopic('');
    setActivities('');
    setNotes('');
    setIsFormOpen(false);
  };

  const handleCopyJournalWA = (j: ClassJournal) => {
    const formatted = `*JURNAL KBM MI MIFTAHUL HUDA*\n` +
      `───────────────────────\n` +
      `📅 *Tanggal:* ${formatIndonesianDate(j.date)}\n` +
      `🏫 *Kelas:* ${j.className} | *Sesi:* ${j.period}\n` +
      `📖 *Mata Pelajaran:* ${j.subject}\n` +
      `📌 *Materi Pokok:* ${j.topic}\n` +
      `📝 *Kegiatan KBM:*\n${j.activities}\n` +
      (j.notes ? `💡 *Catatan:* ${j.notes}\n` : '') +
      `👨‍🏫 *Guru Pengampu:* ${j.teacherName}\n` +
      `───────────────────────\n` +
      `_Tercatat di Portal Guru MI Miftahul Huda_`;

    onCopyText(formatted, 'Jurnal KBM Disalin');
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-lg mx-auto">
      {/* Header Banner & Add Trigger */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>Jurnal Harian KBM</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Catatan materi & evaluasi KBM madrasah</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="min-h-[44px] px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
        >
          {isFormOpen ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isFormOpen ? 'Tutup Form' : 'Tulis Jurnal'}</span>
        </button>
      </div>

      {/* Expandable Journal Input Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-4 shadow-md border border-emerald-300/80 mb-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Input Jurnal KBM Baru
            </h3>
            <span className="text-[11px] text-slate-400">Semua kolom wajib diisi</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kelas</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {ALL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {MI_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jam Pelajaran</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="Jam 1-2 (07.15 - 08.25)">Jam 1-2 (07.15 - 08.25)</option>
                <option value="Jam 3-4 (08.45 - 09.55)">Jam 3-4 (08.45 - 09.55)</option>
                <option value="Jam 5-6 (10.15 - 11.25)">Jam 5-6 (10.15 - 11.25)</option>
                <option value="Jam 7-8 (11.45 - 12.55)">Jam 7-8 (11.45 - 12.55)</option>
              </select>
            </div>
          </div>

          <div className="mb-2.5">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Topik / Materi Pokok Pembelajaran *
            </label>
            <input
              type="text"
              placeholder="Contoh: Bab 2 Thaharah & Mandi Wajib"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              required
            />
          </div>

          <div className="mb-2.5">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Ringkasan Kegiatan & Metode KBM
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Ceramah interaktif, tanya jawab, dan diskusi kelompok."
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 resize-none"
            />
          </div>

          <div className="mb-3.5">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Catatan Khusus / Kendala / Pencapaian Siswa
            </label>
            <input
              type="text"
              placeholder="Contoh: Siswa aktif bertanya, beberapa siswa butuh pengulangan dalil."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 min-h-[44px] py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Simpan Jurnal KBM</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="min-h-[44px] px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Journal History List */}
      <div className="space-y-3">
        {journals.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-slate-500 border border-slate-200">
            <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-medium">Belum ada jurnal KBM yang tercatat</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Tap tombol 'Tulis Jurnal' untuk merekam aktivitas kelas hari ini
            </p>
          </div>
        ) : (
          journals.map((j) => (
            <div
              key={j.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 hover:border-slate-300 transition-all"
            >
              {/* Header card info */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-emerald-800">{j.className}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatIndonesianDate(j.date)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{j.subject}</h3>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-2 py-0.5 rounded-lg whitespace-nowrap shrink-0">
                  {j.period}
                </span>
              </div>

              {/* Topic */}
              <div className="bg-slate-50 rounded-xl p-2.5 mb-2.5 border border-slate-100">
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                  Materi Pokok
                </span>
                <p className="text-xs font-medium text-slate-800 mt-0.5 leading-relaxed">{j.topic}</p>
              </div>

              {/* Activities */}
              {j.activities && (
                <div className="text-xs text-slate-600 mb-2 leading-relaxed">
                  <span className="font-semibold text-slate-700">Kegiatan: </span>
                  {j.activities}
                </div>
              )}

              {/* Notes */}
              {j.notes && (
                <div className="text-xs text-amber-800 bg-amber-50/70 rounded-lg p-2 mb-3 border border-amber-200/60 leading-relaxed">
                  <span className="font-semibold">Catatan Guru: </span>
                  {j.notes}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-[10px] text-slate-400 truncate">
                  Oleh: <span className="font-medium text-slate-600">{j.teacherName}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopyJournalWA(j)}
                    className="min-h-[40px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Salin untuk WhatsApp"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </button>
                  <button
                    onClick={() => onDeleteJournal(j.id)}
                    className="min-h-[40px] px-2 py-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs transition-colors"
                    title="Hapus Jurnal"
                    aria-label="Hapus Jurnal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
