import React, { useState } from 'react';
import { Teacher, ALL_CLASSES } from '../types';
import { UserCheck, Plus, Search, Edit3, Trash2, Phone, Mail, BookOpen, Check, X, AlertTriangle, ShieldCheck, FileSpreadsheet, ExternalLink, School } from 'lucide-react';
import { downloadCSV } from '../utils/formatters';

interface TeacherManagementViewProps {
  teachers: Teacher[];
  currentTeacherId?: string;
  onSelectCurrentTeacher: (teacher: Teacher) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const TeacherManagementView: React.FC<TeacherManagementViewProps> = ({
  teachers,
  currentTeacherId,
  onSelectCurrentTeacher,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formSubject, setFormSubject] = useState(''); // Mata pelajaran manual
  const [formPhone, setFormPhone] = useState(''); // No WA manual
  const [formEmail, setFormEmail] = useState(''); // Email manual
  const [formClass, setFormClass] = useState('Kelas 4A');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formNotes, setFormNotes] = useState('');

  const handleOpenAdd = () => {
    setFormName('');
    setFormNip('');
    setFormSubject('');
    setFormPhone('');
    setFormEmail('');
    setFormClass('Kelas 4A');
    setFormGender('L');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormName(teacher.name);
    setFormNip(teacher.nip);
    setFormSubject(teacher.subject);
    setFormPhone(teacher.phone);
    setFormEmail(teacher.email);
    setFormClass(teacher.assignedClass);
    setFormGender(teacher.gender || 'L');
    setFormNotes(teacher.notes || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onToast('Nama guru wajib diisi', 'Perhatian', 'error');
      return;
    }

    if (editingTeacher) {
      const updated: Teacher = {
        ...editingTeacher,
        name: formName.trim(),
        nip: formNip.trim() || '-',
        subject: formSubject.trim() || 'Guru Kelas',
        phone: formPhone.trim(),
        email: formEmail.trim(),
        assignedClass: formClass,
        gender: formGender,
        notes: formNotes.trim() || undefined,
      };
      onUpdateTeacher(updated);
      setEditingTeacher(null);
      onToast('Data Guru Diperbarui', `${updated.name}`);
    } else {
      const newTeacher: Teacher = {
        id: `tch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: formName.trim(),
        nip: formNip.trim() || '-',
        subject: formSubject.trim() || 'Guru Kelas',
        phone: formPhone.trim(),
        email: formEmail.trim(),
        assignedClass: formClass,
        gender: formGender,
        notes: formNotes.trim() || undefined,
      };
      onAddTeacher(newTeacher);
      setIsAddModalOpen(false);
      onToast('Guru Baru Ditambahkan', `${newTeacher.name} berhasil disimpan`);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingTeacher) return;
    if (teachers.length <= 1) {
      onToast('Tidak dapat menghapus', 'Minimal harus ada 1 data guru di sistem', 'error');
      setDeletingTeacher(null);
      return;
    }
    onDeleteTeacher(deletingTeacher.id);
    onToast('Guru Dihapus', `${deletingTeacher.name} telah dihapus dari data`);
    setDeletingTeacher(null);
  };

  const handleExportCSV = () => {
    let csv = 'No,Nama Guru,NIP/NUPTK,Mata Pelajaran,No WhatsApp,Email,Kelas Binaan,Gender,Catatan\n';
    teachers.forEach((t, idx) => {
      csv += `${idx + 1},"${t.name}","${t.nip}","${t.subject}","${t.phone}","${t.email}","${t.assignedClass}","${t.gender || 'L'}","${(t.notes || '').replace(/"/g, '""')}"\n`;
    });
    downloadCSV(csv, 'daftar_guru_mi_miftahul_huda.csv');
    onToast('Unduh CSV Berhasil', 'Data dewan guru siap dibuka di Excel/Sheets');
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.nip.toLowerCase().includes(q) ||
      t.assignedClass.toLowerCase().includes(q)
    );
  });

  return (
    <div className="pb-24 pt-2 px-3 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 mb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Data Dewan Guru</h2>
              <p className="text-[11px] text-slate-500">
                MI Miftahul Huda Kertosono, Panggul - Trenggalek
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            title="Unduh Rekap Guru (CSV)"
            className="min-h-[40px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>CSV</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Total Guru Terdaftar: <strong className="text-emerald-800 font-bold tabular-nums">{teachers.length} Orang</strong>
          </span>
          <button
            onClick={handleOpenAdd}
            className="min-h-[40px] px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Guru Baru</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama guru, mapel, NIP, atau kelas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {/* Teacher Cards List */}
      <div className="space-y-2.5 mb-6">
        {filteredTeachers.map((teacher, idx) => {
          const isActive = currentTeacherId ? teacher.id === currentTeacherId : idx === 0;

          return (
            <div
              key={teacher.id}
              className={`bg-white rounded-2xl p-3.5 border transition-all ${
                isActive
                  ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20 bg-emerald-50/15'
                  : 'border-slate-200/90 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      teacher.gender === 'P'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {teacher.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {teacher.name}
                      </h4>
                      {isActive && (
                        <span className="text-[10px] bg-emerald-700 text-white font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Profil Aktif</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                      <span className="font-mono text-slate-600">NIP: {teacher.nip || '-'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {teacher.assignedClass}
                      </span>
                    </div>

                    {/* Mata Pelajaran (Diisi Manual) */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-700">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-semibold text-slate-900">Mapel:</span>
                      <span className="truncate">{teacher.subject}</span>
                    </div>

                    {/* No WhatsApp & Email (Diisi Manual) */}
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
                      {teacher.phone && (
                        <a
                          href={`https://wa.me/${teacher.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-emerald-700 font-medium hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{teacher.phone}</span>
                        </a>
                      )}

                      {teacher.email && (
                        <a
                          href={`mailto:${teacher.email}`}
                          className="flex items-center gap-1 text-slate-600 font-medium hover:underline truncate"
                        >
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{teacher.email}</span>
                        </a>
                      )}
                    </div>

                    {teacher.notes && (
                      <p className="mt-1 text-[10px] text-slate-400 italic">
                        {teacher.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    title="Edit Data Guru"
                    className="min-h-[40px] min-w-[36px] px-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingTeacher(teacher)}
                    title="Hapus Guru"
                    className="min-h-[40px] min-w-[36px] px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom active profile switch */}
              {!isActive && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => onSelectCurrentTeacher(teacher)}
                    className="min-h-[38px] px-3 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Gunakan Profil Guru Ini</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Teacher Modal */}
      {(isAddModalOpen || editingTeacher) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTeacher(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="mb-2.5">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Lengkap Guru (dengan Gelar) *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzi, S.Pd.I"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    NIP / NUPTK (Manual)
                  </label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="19880415..."
                    className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kelas Tugas / Binaan
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {ALL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                    <option value="Guru Mapel">Guru Mapel / Non-Wali</option>
                  </select>
                </div>
              </div>

              {/* Mata Pelajaran (Diisi Manual) */}
              <div className="mb-2.5">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Mata Pelajaran (Diisi Manual) *
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="Contoh: Fikih & Akidah Akhlak / Guru Kelas 1A"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              {/* No WhatsApp (Diisi Manual) */}
              <div className="mb-2.5">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp (Diisi Manual) *
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600 font-mono"
                  required
                />
              </div>

              {/* Email (Diisi Manual) */}
              <div className="mb-2.5">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Alamat Email Guru (Diisi Manual) *
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Contoh: ahmadfauzi@miftahulhuda.sch.id"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormGender('L')}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        formGender === 'L'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Laki-laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormGender('P')}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        formGender === 'P'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Perempuan
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tugas Tambahan / Catatan
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Wali Kelas, Pembina, dll."
                    className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{editingTeacher ? 'Simpan Perubahan Guru' : 'Tambahkan Guru'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTeacher(null);
                  }}
                  className="min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTeacher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xs rounded-3xl p-4 shadow-2xl text-center border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Hapus Data Guru?</h3>
            <p className="text-xs text-slate-600 mb-4">
              Apakah Anda yakin ingin menghapus data <strong className="text-rose-700">{deletingTeacher.name}</strong>?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 min-h-[42px] py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setDeletingTeacher(null)}
                className="min-h-[42px] px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
