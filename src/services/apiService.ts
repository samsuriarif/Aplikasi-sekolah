import { AppStateData, SentReportLog } from '../types';
import { INITIAL_APP_STATE } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'portal_guru_miftahul_huda_state';

export async function fetchAppData(): Promise<AppStateData> {
  // First attempt backend API
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend fetch failed, falling back to local storage:', err);
  }

  // Fallback to localStorage
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // parse error, use initial
    }
  }

  // Initial fallback
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_APP_STATE));
  return INITIAL_APP_STATE;
}

export async function saveAppData(data: AppStateData): Promise<boolean> {
  // Save to localStorage immediately
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage save error:', err);
  }

  // Sync to backend API
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend sync failed, saved locally:', err);
    return false;
  }
}

export async function sendReportToSupervisor(payload: {
  teacherName: string;
  className: string;
  reportType: 'Harian Lengkap' | 'Rekap Absensi' | 'Rekap Nilai' | 'Jurnal KBM';
  subject: string;
  body: string;
  recordsSummary: string;
}): Promise<{ success: boolean; message: string; report?: SentReportLog; mailtoUrl: string }> {
  const fallbackMailto = `mailto:samsuriarifkom@gmail.com?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.body)}`;

  try {
    const res = await fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      return {
        success: true,
        message: json.message || 'Laporan berhasil disimpan dan disiapkan ke email supervisor',
        report: json.report,
        mailtoUrl: json.mailtoUrl || fallbackMailto,
      };
    }
  } catch (err) {
    console.warn('Server send report error:', err);
  }

  return {
    success: true,
    message: 'Laporan disimpan di memori & email siap dikirim via mailto',
    mailtoUrl: fallbackMailto,
  };
}
