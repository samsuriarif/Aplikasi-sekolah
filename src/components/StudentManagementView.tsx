import React, { useState, useMemo } from 'react';
import { Student, ALL_CLASSES, ClassNameType } from '../types';
import { Users, Plus, Search, Edit3, Trash2, Phone, UserPlus, FileSpreadsheet, Check, X, AlertTriangle, Sparkles, MessageCircle } from 'lucide-react';
import { downloadCSV } from '../utils/formatters';

interface StudentManagementViewProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onBatchAddStudents: (newStudents: Student[]) => void;
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBatchAddStudents,
  onToast,
}) => {
  const [selectedClass, setSelectedClass] = useState<ClassNameType>('Kelas 4A');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form states for adding/editing
  const [formNis, setFormNis] = useState('');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formClass, setFormClass] = useState<ClassNameType>('Kelas 4A');
  const [formPhone, setFormPhone] = useState('');
  const [formParent, setFormParent] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Batch import text state
  const [batchText, setBatchText] = useState('');

  // Open add modal
  const handleOpenAdd = () => {
    setFormNis(String(Date.now()).slice(-6));
    setFormName('');
    setFormGender('L');
    setFormClass(selectedClass);
    setFormPhone('');
    setFormParent('');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormNis(student.nis);
    setFormName(student.name);
    setFormGender(student.gender);
    setFormClass(student.className as ClassNameType);
    setFormPhone(student.phone || '');
    setFormParent(student.parentName || '');
    setFormNotes(student.notes || '');
  };

  // Submit Add / Edit
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onToast('Nama siswa wajib diisi', 'Perhatian', 'error');
      return;
    }

    if (editingStudent) {
      // Update existing
      const updated: Student = {
        ...editingStudent,
        nis: formNis.trim() || editingStudent.nis,
        name: formName.trim(),
        gender: formGender,
        className: formClass,
        phone: formPhone.trim() || undefined,
        parentName: formParent.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };
      onUpdateStudent(updated);
      setEditingStudent(null);
      onToast('Data Siswa Diperbarui', `${updated.name} (${updated.className})`);
    } else {
      // Add new
      const newStd: Student = {
        id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        nis: formNis.trim() || String(Date.now()).slice(-6),
        name: formName.trim(),
        gender: formGender,
        className: formClass,
        phone: formPhone.trim() || undefined,
        parentName: formParent.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };
      onAddStudent(newStd);
      setIsAddModalOpen(false);
      onToast('Siswa Berhasil Ditambahkan', `${newStd.name} masuk ke ${newStd.className}`);
    }
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deletingStudent) return;
    onDeleteStudent(deletingStudent.id);
    onToast('Siswa Dihapus', `${deletingStudent.name} telah dihapus dari sistem`);
    setDeletingStudent(null);
  };

  // Process Batch Import
  const handleProcessBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = batchText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      onToast('Tempelkan minimal 1 nama siswa', 'Gagal Impor', 'error');
      return;
    }

    const createdList: Student[] = lines.map((line, idx) => {
      // Clean leading numbers (e.g. "1. Achmad Danial" or "01 - Achmad Danial")
      const cleanedName = line.replace(/^\d+[\.\-\)\s]+/, '').trim();
      return {
        id: `std-batch-${Date.now()}-${idx}`,
        nis: `${String(new Date().getFullYear()).slice(-2)}${selectedClass.replace(/\D/g, '')}${String(idx + 1).padStart(2, '0')}`,
        name: cleanedName,
        gender: (idx % 2 === 0 ? 'L' : 'P') as 'L' | 'P',
        className: selectedClass,
      };
    });

    onBatchAddStudents(createdList);
    setBatchText('');
    setIsBatchModalOpen(false);
    onToast('Impor Sukses', `${createdList.length} siswa berhasil dimasukkan ke ${selectedClass}`);
  };

  // Export CSV of students
  const handleExportStudentsCSV = () => {
    let csv = 'No,NIS,Nama Lengkap,Jenis Kelamin,Kelas,Nama Wali,No HP/WA,Catatan\n';
    const classList = students.filter((s) => s.className === selectedClass);
    classList.forEach((s, idx) => {
      csv += `${idx + 1},"${s.nis}","${s.name}","${s.gender}","${s.className}","${s.parentName || ''}","${s.phone || ''}","${(s.notes || '').replace(/"/g, '""')}"\n`;
    });
    downloadCSV(csv, `data_siswa_${selectedClass.replace(/\s+/g, '_')}.csv`);
    onToast('Unduh CSV Berhasil', `Data siswa ${selectedClass} siap dibuka di Google Sheets`);
  };

  // Filter students for current class view
  const currentClassStudents = useMemo(() => {
    return students.filter((s) => s.className === selectedClass);
  }, [students, selectedClass]);

  const filteredStudents = useMemo(() => {
    return currentClassStudents.filter((s) => {
      const matchQuery =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGender = genderFilter === 'ALL' || s.gender === genderFilter;
      return matchQuery && matchGender;
    });
  }, [currentClassStudents, searchQuery, genderFilter]);

  // Statistics for active class
  const classStats = useMemo(() => {
    const total = currentClassStudents.length;
    const l = currentClassStudents.filter((s) => s.gender === 'L').length;
    const p = currentClassStudents.filter((s) => s.gender === 'P').length;
    return { total, l, p };
  }, [currentClassStudents]);

  return (
    <div className="pb-24 pt-2 px-3 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 mb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Manajemen Data Siswa</h2>
              <p className="text-[11px] text-slate-500">
                Input manual, edit, hapus, dan simpan data kelas 1A s/d 6B
              </p>
            </div>
          </div>
          <button
            onClick={handleExportStudentsCSV}
            title="Unduh CSV untuk Google Sheets"
            className="min-h-[40px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>CSV</span>
          </button>
        </div>

        {/* 12 Classes Horizontal Segmented Carousel (1A - 6B) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 -mx-1 px-1">
          {ALL_CLASSES.map((cls) => {
            const isSelected = selectedClass === cls;
            const count = students.filter((s) => s.className === cls).length;

            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-950/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cls}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                    isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Stats of Active Class */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-2 text-center">
          <span className="block text-[10px] font-semibold text-emerald-800 uppercase tracking-tight">Total Siswa</span>
          <span className="text-xl font-bold text-emerald-950 tabular-nums">{classStats.total}</span>
          <span className="block text-[10px] text-emerald-700 mt-0.5">{selectedClass}</span>
        </div>
        <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-2 text-center">
          <span className="block text-[10px] font-semibold text-blue-800 uppercase tracking-tight">Laki-Laki</span>
          <span className="text-xl font-bold text-blue-950 tabular-nums">{classStats.l}</span>
          <span className="block text-[10px] text-blue-700 mt-0.5">Siswa (L)</span>
        </div>
        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-2 text-center">
          <span className="block text-[10px] font-semibold text-rose-800 uppercase tracking-tight">Perempuan</span>
          <span className="text-xl font-bold text-rose-950 tabular-nums">{classStats.p}</span>
          <span className="block text-[10px] text-rose-700 mt-0.5">Siswi (P)</span>
        </div>
      </div>

      {/* Action Buttons: Add Manual & Batch Paste */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={handleOpenAdd}
          className="min-h-[44px] py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
        >
          <UserPlus className="w-4 h-4 text-emerald-200" />
          <span>+ Tambah Siswa Manual</span>
        </button>

        <button
          onClick={() => setIsBatchModalOpen(true)}
          className="min-h-[44px] py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Tempel Banyak Nama</span>
        </button>
      </div>

      {/* Search & Gender Filter */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Cari nama / NIS di ${selectedClass}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
          {(['ALL', 'L', 'P'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                genderFilter === g
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {g === 'ALL' ? 'Semua' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Student List Cards */}
      <div className="space-y-2 mb-6">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="text-xs font-bold text-slate-700">Belum Ada Siswa di {selectedClass}</h3>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Tap tombol '+ Tambah Siswa Manual' atau 'Tempel Banyak Nama' untuk memasukkan siswa kelas ini.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Siswa Sekarang</span>
            </button>
          </div>
        ) : (
          filteredStudents.map((student, idx) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm flex items-center justify-between gap-2.5 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-snug">
                      {student.name}
                    </h4>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        student.gender === 'L'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                    <span className="font-mono">NIS: {student.nis}</span>
                    {student.parentName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">Wali: {student.parentName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Phone/WA, Edit, Delete */}
              <div className="flex items-center gap-1 shrink-0">
                {student.phone && (
                  <a
                    href={`https://wa.me/${student.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    title={`Hubungi Wali: ${student.phone}`}
                    className="min-h-[40px] min-w-[36px] px-2 text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={() => handleOpenEdit(student)}
                  title="Edit Data Siswa"
                  className="min-h-[40px] min-w-[36px] px-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeletingStudent(student)}
                  title="Hapus Siswa"
                  className="min-h-[40px] min-w-[36px] px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Manual'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent}>
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kelas Target *
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value as ClassNameType)}
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
                    NIS / Nomor Induk
                  </label>
                  <input
                    type="text"
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    placeholder="Contoh: 20240101"
                    className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="mb-2.5">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Muhammad Rayhan Al-Fatih"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2.5">
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
                    Nama Wali Murid (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formParent}
                    onChange={(e) => setFormParent(e.target.value)}
                    placeholder="Bapak / Ibu..."
                    className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="mb-2.5">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  No. WhatsApp Wali Murid (Opsional)
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Catatan / Keterangan Khusus
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Alergi debu, anak aktif, dll."
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{editingStudent ? 'Simpan Perubahan' : 'Tambahkan Siswa'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
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

      {/* Batch Import Modal (Paste multiple lines) */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Tempel Banyak Nama Siswa ke {selectedClass}
              </h3>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-2">
              Salin dan tempel daftar nama dari WhatsApp atau Excel (satu nama per baris). Nomor urut di depan nama akan otomatis dibersihkan:
            </p>

            <form onSubmit={handleProcessBatch}>
              <textarea
                rows={7}
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={`1. Ahmad Fauzan\n2. Siti Fatimah\n3. Muhammad Bilal\n4. Nurul Hidayah\n...`}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600 font-mono mb-3 resize-none"
                required
              />

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Proses & Masukkan ke {selectedClass}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="min-h-[44px] px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xs rounded-3xl p-4 shadow-2xl text-center border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Hapus Data Siswa?</h3>
            <p className="text-xs text-slate-600 mb-4">
              Apakah Anda yakin ingin menghapus <strong className="text-rose-700">{deletingStudent.name}</strong> dari {deletingStudent.className}?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 min-h-[42px] py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setDeletingStudent(null)}
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
