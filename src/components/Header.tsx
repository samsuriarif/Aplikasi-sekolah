import React from 'react';
import { Bell, CloudCheck, Mail, Calendar, CalendarDays, School, UserCog } from 'lucide-react';
import { formatIndonesianDate, getEstimatedHijriDate, getTodayDateString } from '../utils/formatters';

interface HeaderProps {
  teacherName: string;
  className: string;
  pendingRemindersCount: number;
  onOpenReminders: () => void;
  onOpenEmailSync: () => void;
  onOpenTeachers?: () => void;
  onOpenSchedule?: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  teacherName,
  className,
  pendingRemindersCount,
  onOpenReminders,
  onOpenEmailSync,
  onOpenTeachers,
  onOpenSchedule,
  isOnline,
}) => {
  const todayStr = getTodayDateString();
  const hijriStr = getEstimatedHijriDate();

  return (
    <header className="sticky top-0 z-30 bg-emerald-900 text-white shadow-md border-b border-emerald-800/80">
      <div className="max-w-4xl mx-auto px-3.5 py-2.5 flex items-center justify-between gap-2.5">
        {/* Madrasah Brand & Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-emerald-800 flex items-center justify-center shrink-0 border border-emerald-700/60 shadow-inner">
            <img
              src="/src/assets/images/madrasah_logo_emblem_1790399941104.jpg"
              alt="Logo MI Miftahul Huda"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback styled crest if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-amber-300 pointer-events-none -z-10">
              <School className="w-5 h-5" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate leading-tight">
                MI Miftahul Huda
              </h1>
              <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.5 rounded font-medium shrink-0">
                Panggul - Trenggalek
              </span>
            </div>
            <button
              onClick={onOpenTeachers}
              className="flex items-center gap-1 text-[11px] text-emerald-200/90 truncate mt-0.5 text-left hover:text-white group transition-colors"
              title="Kelola Data Guru & Ganti Profil"
            >
              <span className="font-semibold text-emerald-100 group-hover:underline">{teacherName}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-300">{className}</span>
              <UserCog className="w-3 h-3 text-emerald-300 group-hover:text-white shrink-0 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Action Buttons: Schedule, Reminders & Cloud Sync */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Teaching Schedule Quick Button */}
          {onOpenSchedule && (
            <button
              onClick={onOpenSchedule}
              title="Jadwal Mengajar Harian"
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-emerald-800/80 active:bg-emerald-800 flex items-center justify-center relative transition-colors"
              aria-label="Jadwal Mengajar"
            >
              <CalendarDays className="w-5 h-5" />
            </button>
          )}

          {/* Email / Cloud Report Button */}
          <button
            onClick={onOpenEmailSync}
            title="Laporan & Sinkronisasi Email"
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-emerald-800/80 active:bg-emerald-800 flex items-center justify-center relative transition-colors"
            aria-label="Laporan Email Supervisor"
          >
            <Mail className="w-5 h-5" />
            <span className="sr-only">Laporan Email</span>
            {isOnline && (
              <span className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-900" />
            )}
          </button>

          {/* Task Reminder Button with Badge */}
          <button
            onClick={onOpenReminders}
            title="Pengingat Tugas Guru"
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-emerald-800/80 active:bg-emerald-800 flex items-center justify-center relative transition-colors"
            aria-label="Pengingat Tugas"
          >
            <Bell className="w-5 h-5" />
            <span className="sr-only">Pengingat Tugas</span>
            {pendingRemindersCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-amber-400 text-emerald-950 text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                {pendingRemindersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Date sub-strip with calendar info */}
      <div className="bg-emerald-950/60 px-3.5 py-1 text-[11px] text-emerald-200/80 border-t border-emerald-800/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate">
          <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{formatIndonesianDate(todayStr)}</span>
        </div>
        <div className="text-[10px] text-amber-300 font-medium shrink-0 ml-2">
          {hijriStr}
        </div>
      </div>
    </header>
  );
};
