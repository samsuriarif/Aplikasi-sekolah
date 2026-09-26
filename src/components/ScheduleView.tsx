import React, { useState, useMemo } from 'react';
import { TeachingSchedule } from '../types';
import { CalendarDays, Clock, MapPin, Plus, Sparkles, BookOpen, Trash2 } from 'lucide-react';

interface ScheduleViewProps {
  schedules: TeachingSchedule[];
  onAddSchedule: (schedule: TeachingSchedule) => void;
  onDeleteSchedule: (id: string) => void;
  teacherName: string;
}

const DAYS: TeachingSchedule['day'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedules,
  onAddSchedule,
  onDeleteSchedule,
  teacherName,
}) => {
  // Determine today's day of week in Indonesian
  const todayDayName = useMemo<TeachingSchedule['day']>(() => {
    const dayIdx = new Date().getDay();
    const map: Record<number, TeachingSchedule['day']> = {
      1: 'Senin',
      2: 'Selasa',
      3: 'Rabu',
      4: 'Kamis',
      5: 'Jumat',
      6: 'Sabtu',
      0: 'Senin', // Sunday fallback to Monday
    };
    return map[dayIdx] || 'Senin';
  }, []);

  const [selectedDay, setSelectedDay] = useState<TeachingSchedule['day']>(todayDayName);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New schedule form state
  const [newTime, setNewTime] = useState('07.15 - 08.25');
  const [newPeriod, setNewPeriod] = useState('1-2');
  const [newSubject, setNewSubject] = useState('Fikih');
  const [newClass, setNewClass] = useState('Kelas 4A');
  const [newRoom, setNewRoom] = useState('R. 4A');

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => s.day === selectedDay);
  }, [schedules, selectedDay]);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const newSched: TeachingSchedule = {
      id: `sch-${Date.now()}`,
      day: selectedDay,
      timeSlot: newTime,
      periodNumber: newPeriod,
      subject: newSubject.trim(),
      className: newClass,
      room: newRoom.trim() || 'R. Kelas',
    };

    onAddSchedule(newSched);
    setIsAddOpen(false);
    setNewSubject('');
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-emerald-700" />
            <span>Jadwal Mengajar Harian</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Agar agenda mengajar tertata rapi dan tidak terlewat
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="min-h-[40px] px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-[0.98] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Day Selector Segmented Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 mb-2">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = todayDayName === day;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 relative ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-950/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-amber-300' : 'bg-emerald-600'
                  }`}
                  title="Hari Ini"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Add Schedule Form Drawer */}
      {isAddOpen && (
        <form
          onSubmit={handleCreateSchedule}
          className="bg-white rounded-2xl p-4 shadow-md border border-emerald-300 mb-3 animate-in fade-in duration-200"
        >
          <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2.5">
            Tambah Jam Mengajar ({selectedDay})
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jam KBM</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="07.15 - 08.25"
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jam Ke-</label>
              <input
                type="text"
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
                placeholder="1-2"
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kelas</label>
              <select
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Kelas 4A">Kelas 4A</option>
                <option value="Kelas 4B">Kelas 4B</option>
                <option value="Kelas 5A">Kelas 5A</option>
                <option value="Kelas 5B">Kelas 5B</option>
                <option value="Kelas 6A">Kelas 6A</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ruang</label>
              <input
                type="text"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                placeholder="R. 4A"
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 min-h-[44px] py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
            >
              Simpan Jadwal
            </button>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Schedule Items Timeline */}
      <div className="space-y-2.5">
        {filteredSchedules.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-slate-500 border border-slate-200">
            <CalendarDays className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-medium">Tidak ada jadwal mengajar pada hari {selectedDay}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Tap tombol '+ Tambah' untuk menambahkan jadwal
            </p>
          </div>
        ) : (
          filteredSchedules.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-sm flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 leading-none">Jam</span>
                  <span className="text-sm font-extrabold leading-tight mt-0.5">{item.periodNumber}</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-0.5">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.timeSlot} WIB
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.room}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate">
                    {item.subject}
                  </h3>
                  <span className="inline-block mt-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {item.className}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onDeleteSchedule(item.id)}
                className="min-h-[40px] px-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                title="Hapus Jadwal"
                aria-label="Hapus Jadwal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
