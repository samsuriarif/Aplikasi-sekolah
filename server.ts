import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { INITIAL_APP_STATE } from './src/data/initialData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure data folder and store file exist
function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_APP_STATE, null, 2), 'utf-8');
  }
}

function readStoreData() {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading store data, using fallback:', err);
    return INITIAL_APP_STATE;
  }
}

function writeStoreData(data: any) {
  ensureDataStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// REST API Endpoints
app.get('/api/data', (req, res) => {
  const data = readStoreData();
  res.json({ success: true, data });
});

app.post('/api/data', (req, res) => {
  try {
    const updatedData = req.body;
    if (!updatedData || typeof updatedData !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }
    writeStoreData(updatedData);
    res.json({ success: true, message: 'Data berhasil disimpan secara aman di sistem server' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send Report to Supervisor Email (samsuriarifkom@gmail.com)
app.post('/api/send-report', (req, res) => {
  try {
    const { teacherName, className, reportType, subject, body, recordsSummary } = req.body;
    const recipientEmail = 'samsuriarifkom@gmail.com';
    const store = readStoreData();

    const newReport = {
      id: `rep-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teacherName: teacherName || store.currentTeacher?.name || 'Guru MI',
      className: className || 'Kelas 4A',
      reportType: reportType || 'Harian Lengkap',
      recipientEmail,
      subject: subject || `[LAPORAN MI MIFTAHUL HUDA] ${reportType} - ${new Date().toLocaleDateString('id-ID')}`,
      contentSnippet: recordsSummary || body?.substring(0, 160) || 'Laporan administrasi kelas telah direkam',
      status: 'Tersimpan di Cloud',
    };

    if (!Array.isArray(store.reports)) {
      store.reports = [];
    }
    store.reports.unshift(newReport);
    writeStoreData(store);

    // Prepare direct mailto URL
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(newReport.subject)}&body=${encodeURIComponent(body || '')}`;

    res.json({
      success: true,
      message: `Laporan berhasil direkam & siap disinkronkan ke email ${recipientEmail}`,
      report: newReport,
      mailtoUrl,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/reports', (req, res) => {
  const store = readStoreData();
  res.json({
    success: true,
    recipientEmail: 'samsuriarifkom@gmail.com',
    reports: store.reports || [],
  });
});

// CSV Export for Google Sheets
app.get('/api/export-sheets', (req, res) => {
  try {
    const type = req.query.type as string || 'attendance';
    const store = readStoreData();

    if (type === 'attendance') {
      let csv = 'Tanggal,Kelas,NIS,Nama Siswa,Status (H/S/I/A),Keterangan,Guru Penginput\n';
      (store.attendances || []).forEach((att: any) => {
        (att.records || []).forEach((rec: any) => {
          const student = (store.students || []).find((s: any) => s.id === rec.studentId);
          csv += `"${att.date}","${att.className}","${student?.nis || ''}","${rec.studentName}","${rec.status}","${(rec.notes || '').replace(/"/g, '""')}","${att.submittedBy || ''}"\n`;
        });
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="rekap_absensi_miftahul_huda.csv"');
      return res.send(csv);
    }

    if (type === 'grades') {
      let csv = 'Mata Pelajaran,Nama Penilaian,Kelas,Tanggal,KKM,Nama Siswa,Nilai,Status,Catatan\n';
      (store.grades || []).forEach((grd: any) => {
        (grd.studentScores || []).forEach((sc: any) => {
          const status = sc.score >= grd.passingScore ? 'Tuntas' : 'Remedial';
          csv += `"${grd.subject}","${grd.assessmentName}","${grd.className}","${grd.date}","${grd.passingScore}","${sc.studentName}","${sc.score}","${status}","${(sc.notes || '').replace(/"/g, '""')}"\n`;
        });
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="rekap_nilai_miftahul_huda.csv"');
      return res.send(csv);
    }

    // Default backup JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="backup_portal_guru_miftahul_huda.json"');
    return res.send(JSON.stringify(store, null, 2));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
