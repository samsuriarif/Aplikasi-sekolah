import { UserCheck, Users, UserCog, BookOpen, MessageSquare, GraduationCap, CalendarDays } from 'lucide-react';

export type TabKey = 'absensi' | 'siswa' | 'guru' | 'jurnal' | 'nilai' | 'pesan-wa' | 'jadwal' | 'laporan';

interface BottomNavProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    {
      id: 'absensi' as TabKey,
      label: 'Absensi',
      icon: UserCheck,
    },
    {
      id: 'siswa' as TabKey,
      label: 'Siswa',
      icon: Users,
    },
    {
      id: 'guru' as TabKey,
      label: 'Guru',
      icon: UserCog,
    },
    {
      id: 'jurnal' as TabKey,
      label: 'Jurnal',
      icon: BookOpen,
    },
    {
      id: 'nilai' as TabKey,
      label: 'Nilai',
      icon: GraduationCap,
    },
    {
      id: 'pesan-wa' as TabKey,
      label: 'Pesan WA',
      icon: MessageSquare,
      highlight: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg shadow-slate-900/5 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-6 items-center h-16 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Active bar/dot indicator */}
              {isActive && (
                <span className="absolute top-0.5 w-6 h-1 rounded-full bg-emerald-600" />
              )}
              
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700 stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] tracking-tight leading-none mt-0.5 truncate max-w-full ${isActive ? 'text-emerald-800 font-bold' : 'text-slate-600 font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
