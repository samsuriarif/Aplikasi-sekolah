import React, { useState } from 'react';
import { TeacherReminder } from '../types';
import { Bell, CheckCircle2, Circle, Plus, Trash2, X, Volume2, Calendar, AlertCircle } from 'lucide-react';
import { playChime, triggerBrowserNotification } from '../utils/audioNotification';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: TeacherReminder[];
  onToggleComplete: (id: string) => void;
  onAddReminder: (reminder: TeacherReminder) => void;
  onDeleteReminder: (id: string) => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({
  isOpen,
  onClose,
  reminders,
  onToggleComplete,
  onAddReminder,
  onDeleteReminder,
}) => {
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('10:00');
  const [priority, setPriority] = useState<TeacherReminder['priority']>('tinggi');
  const [category, setCategory] = useState<TeacherReminder['category']>('Koreksi');

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    onToggleComplete(id);
    playChime('pop');
  };

  const handleTestAlarm = async () => {
    playChime('reminder');
    await triggerBrowserNotification(
      'Pengingat Tugas Guru MI Miftahul Huda',
      'Alarm pengingat tugas aktif! Tetap terorganisir untuk mendidik anak-anak.'
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: TeacherReminder = {
      id: `rem-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      dueTime,
      priority,
      category,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onAddReminder(newTask);
    playChime('success');
    setTitle('');
    setDescription('');
    setIsAddOpen(false);
  };

  const filtered = reminders.filter((r) => {
    if (filter === 'pending') return !r.completed;
    if (filter === 'completed') return r.completed;
    return true;
  });

  const pendingCount = reminders.filter((r) => !r.completed).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Pengingat Tugas Guru</span>
                {pendingCount > 0 && (
                  <span className="text-[10px] bg-amber-400 text-emerald-950 font-bold px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-emerald-200">
                Checklist harian agar administrasi & KBM teratur
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleTestAlarm}
              title="Uji Bunyi Alarm / Notifikasi"
              className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Tes Alarm</span>
            </button>
            <button
              onClick={onClose}
              className="min-h-[40px] min-w-[40px] p-2 text-emerald-200 hover:text-white rounded-xl transition-colors flex items-center justify-center"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Add Button */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Menunggu ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'completed'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selesai
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="min-h-[38px] px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tugas Baru</span>
          </button>
        </div>

        {/* Add Form Drawer */}
        {isAddOpen && (
          <form
            onSubmit={handleCreateTask}
            className="p-3.5 bg-emerald-50/70 border-b border-emerald-200 animate-in fade-in duration-150"
          >
            <div className="mb-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nama Tugas / Agenda *
              </label>
              <input
                type="text"
                placeholder="Contoh: Koreksi Buku Tugas Fikih Kelas 4A"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600"
                required
              />
            </div>

            <div className="mb-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Catatan Rincian
              </label>
              <input
                type="text"
                placeholder="Contoh: Nilai harus dimasukkan sebelum jam 12 siang"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Tanggal</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Prioritas</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-lg font-medium"
                >
                  <option value="tinggi">Tinggi (Penting)</option>
                  <option value="sedang">Sedang</option>
                  <option value="biasa">Biasa</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-lg font-medium"
                >
                  <option value="Koreksi">Koreksi</option>
                  <option value="Administrasi">Administrasi</option>
                  <option value="KBM">KBM</option>
                  <option value="Wali Murid">Wali Murid</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 min-h-[40px] py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
              >
                Simpan ke Daftar Pengingat
              </button>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="min-h-[40px] px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {/* Task Checklist Items */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-600">
                {filter === 'pending'
                  ? 'Alhamdulillah, tidak ada tugas yang menunggu!'
                  : 'Belum ada riwayat tugas'}
              </p>
            </div>
          ) : (
            filtered.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 ${
                  task.completed
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200/90 shadow-sm'
                }`}
              >
                <button
                  onClick={() => handleToggle(task.id)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center text-emerald-700 shrink-0"
                  aria-label={task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 hover:text-emerald-600" />
                  )}
                </button>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-xs font-bold leading-tight ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        task.priority === 'tinggi'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'sedang'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {task.dueDate}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium">{task.category}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteReminder(task.id)}
                  className="min-h-[40px] px-2 text-slate-300 hover:text-rose-500 transition-colors shrink-0"
                  title="Hapus"
                  aria-label="Hapus pengingat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Notifikasi tersimpan secara otomatis dan membunyikan alarm pengingat
        </div>
      </div>
    </div>
  );
};
