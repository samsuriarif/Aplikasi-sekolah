import React, { useState, useEffect } from 'react';
import { ALL_CLASSES } from '../types';
import { MessageSquare, Copy, Send, Sparkles, Check, RefreshCw, FileText, HeartHandshake, BookOpen, BellRing, School } from 'lucide-react';
import { formatIndonesianDate, getTodayDateString } from '../utils/formatters';

interface WhatsAppGeneratorViewProps {
  initialDraft?: string;
  onCopyText: (text: string, title: string) => void;
  teacherName: string;
  defaultClass: string;
}

type TemplateType = 'tugas' | 'pengumuman' | 'infaq' | 'ulangan' | 'libur' | 'bebas';

export const WhatsAppGeneratorView: React.FC<WhatsAppGeneratorViewProps> = ({
  initialDraft,
  onCopyText,
  teacherName,
  defaultClass,
}) => {
  const [template, setTemplate] = useState<TemplateType>('tugas');
  const [className, setClassName] = useState(defaultClass || 'Kelas 4A');
  const [subject, setSubject] = useState('Matematika');
  const [title, setTitle] = useState('Latihan Soal Pecahan Halaman 24');
  const [details, setDetails] = useState('Kerjakan soal nomor 1 sampai 10 di buku tulis bergaris matematika. Tuliskan cara pengerjaannya secara rapi.');
  const [deadline, setDeadline] = useState('Besok pagi, Jum\'at pukul 07.15 WIB');
  const [customNotes, setCustomNotes] = useState('Bagi yang belum memahami materi penjumlahan penyebut berbeda, dapat berdiskusi atau bertanya saat KBM besok.');
  const [freeText, setFreeText] = useState('');
  const [includeIslamicGreeting, setIncludeIslamicGreeting] = useState(true);
  const [formattedMessage, setFormattedMessage] = useState('');
  const [targetPhone, setTargetPhone] = useState('');

  // Switch templates
  const handleSelectTemplate = (t: TemplateType) => {
    setTemplate(t);
    if (t === 'tugas') {
      setSubject('Matematika');
      setTitle('Latihan Soal Pecahan Halaman 24');
      setDetails('Kerjakan soal nomor 1 sampai 10 di buku tulis matematika. Mohon didampingi untuk menuliskan langkah perhitungannya.');
      setDeadline('Besok pagi pukul 07.15 WIB');
      setCustomNotes('Pastikan buku tugas sudah dimasukkan ke dalam tas sekolah malam ini.');
    } else if (t === 'pengumuman') {
      setSubject('Informasi Madrasah');
      setTitle('Pemberitahuan Kegiatan Ekstrakurikuler Pramuka');
      setDetails('Seluruh siswa mengenakan seragam pramuka lengkap (hasduk, baret/topi, dan sepatu hitam bertali). Membawa tongkat dan tali kur bagi regu penggalang.');
      setDeadline('Sabtu pagi pukul 06.45 WIB');
      setCustomNotes('Kegiatan berlangsung hingga pukul 10.30 WIB. Mohon anak-anak sarapan terlebih dahulu.');
    } else if (t === 'infaq') {
      setSubject('Gerakan Peduli Madrasah');
      setTitle('Pengingat Infaq Jum\'at Berkah & Peduli Dhuafa');
      setDetails('Mengajak ananda membiasakan gemar bersedekah melalui kotak Infaq Jum\'at Barokah MI Miftahul Huda Kertosono.');
      setDeadline('Setiap hari Jum\'at pagi');
      setCustomNotes('Nominal seikhlasnya. Semoga menjadi pembuka pintu keberkahan dan kecerdasan bagi ananda tercinta.');
    } else if (t === 'ulangan') {
      setSubject('Fikih Ibadah');
      setTitle('Penilaian Harian (UH 1) - Bab Thaharah & Mandi Wajib');
      setDetails('Materi mencakup: 1. Syarat dan rukun wudhu, 2. Hal-hal yang membatalkan wudhu, 3. Praktik mandi wajib dan doanya.');
      setDeadline('Hari Rabu depan, 30 September 2026');
      setCustomNotes('Anak-anak diharapkan mengulang bacaan rangkuman di buku catatan dan modul fikih.');
    } else if (t === 'libur') {
      setSubject('Agenda Madrasah');
      setTitle('Pemberitahuan Libur Peringatan Maulid Nabi Muhammad SAW');
      setDetails('Pembelajaran di madrasah diliburkan untuk memperingati Maulid Nabi. Siswa masuk kembali secara normal pada hari berikutnya.');
      setDeadline('Masuk kembali: Kamis pukul 07.00 WIB');
      setCustomNotes('Mari isi waktu bersama keluarga dengan memperbanyak sholawat dan keteladanan akhlak Rasulullah SAW.');
    }
  };

  // Compile final formatted WhatsApp message
  useEffect(() => {
    if (initialDraft && template === 'bebas') {
      setFormattedMessage(initialDraft);
      return;
    }

    if (template === 'bebas' && freeText) {
      let msg = '';
      if (includeIslamicGreeting) {
        msg += `*Assalamu'alaikum Warahmatullahi Wabarakatuh*\n\n`;
      }
      msg += `Yth. Bapak/Ibu Wali Murid ${className}\n`;
      msg += `*MI Miftahul Huda Kertosono*\n`;
      msg += `─────────────────────────\n\n`;
      msg += `${freeText}\n\n`;
      msg += `─────────────────────────\n`;
      msg += `Wassalamu'alaikum Warahmatullahi Wabarakatuh\n\n`;
      msg += `Hormat kami,\n`;
      msg += `*${teacherName}*\n`;
      msg += `_Wali Kelas ${className} - MI Miftahul Huda Kertosono_`;
      setFormattedMessage(msg);
      return;
    }

    let msg = '';
    if (includeIslamicGreeting) {
      msg += `*Assalamu'alaikum Warahmatullahi Wabarakatuh*\n\n`;
    }
    msg += `Yth. Bapak/Ibu Wali Murid ${className}\n`;
    msg += `*MI Miftahul Huda Kertosono*\n`;
    msg += `─────────────────────────\n\n`;

    if (template === 'tugas') {
      msg += `📝 *PEMBERITAHUAN TUGAS / PR KELAS*\n`;
      msg += `• *Mata Pelajaran:* ${subject}\n`;
      msg += `• *Materi / Judul:* ${title}\n\n`;
      msg += `📌 *Petunjuk Pengerjaan:*\n${details}\n\n`;
      msg += `⏰ *Batas Waktu Pengumpulan:*\n${deadline}\n\n`;
    } else if (template === 'pengumuman') {
      msg += `📢 *PENGUMUMAN PENTING MADRASAH*\n`;
      msg += `• *Perihal:* ${title}\n\n`;
      msg += `📌 *Isi Pengumuman:*\n${details}\n\n`;
      if (deadline) msg += `🗓️ *Waktu Pelaksanaan:*\n${deadline}\n\n`;
    } else if (template === 'infaq') {
      msg += `🕌 *PENGINGAT INFAQ JUM'AT BERKAH*\n`;
      msg += `• *Agenda:* ${title}\n\n`;
      msg += `${details}\n\n`;
      msg += `🗓️ *Jadwal Pengumpulan:* ${deadline}\n\n`;
    } else if (template === 'ulangan') {
      msg += `📚 *JADWAL PENILAIAN HARIAN (UH) / PTS*\n`;
      msg += `• *Mata Pelajaran:* ${subject}\n`;
      msg += `• *Materi Ulangan:* ${title}\n\n`;
      msg += `📌 *Kisi-kisi & Bahan Belajar:*\n${details}\n\n`;
      msg += `🗓️ *Hari & Tanggal Pelaksanaan:*\n${deadline}\n\n`;
    } else if (template === 'libur') {
      msg += `🏖️ *INFORMASI AGENDA & LIBUR MADRASAH*\n`;
      msg += `• *Perihal:* ${title}\n\n`;
      msg += `${details}\n\n`;
      msg += `🗓️ *Ketentuan:* ${deadline}\n\n`;
    }

    if (customNotes) {
      msg += `💡 *Catatan Tambahan:*\n_${customNotes}_\n\n`;
    }

    msg += `Demikian pemberitahuan ini kami sampaikan. Atas perhatian, bimbingan, dan kerjasama Bapak/Ibu kami haturkan terima kasih. Jazakumullah khairan katsiran.\n\n`;
    msg += `*Wassalamu'alaikum Warahmatullahi Wabarakatuh*\n\n`;
    msg += `Hormat kami,\n`;
    msg += `*${teacherName}*\n`;
    msg += `_Wali Kelas ${className} - MI Miftahul Huda Kertosono_`;

    setFormattedMessage(msg);
  }, [template, className, subject, title, details, deadline, customNotes, freeText, includeIslamicGreeting, teacherName, initialDraft]);

  const handleCopy = () => {
    onCopyText(formattedMessage, 'Pesan WhatsApp Siap Dikirim');
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(formattedMessage);
    let url = `https://wa.me/?text=${encoded}`;
    if (targetPhone.trim()) {
      // Clean phone number (replace leading 0 with 62)
      let phone = targetPhone.replace(/\D/g, '');
      if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
      }
      url = `https://wa.me/${phone}?text=${encoded}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Generator Pesan WhatsApp</h2>
            <p className="text-[11px] text-slate-500">
              Format instan pengumuman tugas & info wali murid MI Miftahul Huda
            </p>
          </div>
        </div>

        {/* Template Selector Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 -mx-1 px-1">
          {[
            { id: 'tugas', label: 'Tugas/PR', icon: FileText },
            { id: 'pengumuman', label: 'Pengumuman', icon: BellRing },
            { id: 'infaq', label: 'Infaq Jum\'at', icon: HeartHandshake },
            { id: 'ulangan', label: 'Ulangan Harian', icon: BookOpen },
            { id: 'libur', label: 'Info Libur', icon: School },
            { id: 'bebas', label: 'Tulis Bebas', icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = template === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTemplate(item.id as TemplateType)}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-950/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Form Inputs */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 mb-3">
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kelas Penerima</label>
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

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Matematika"
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {template === 'bebas' ? (
          <div className="mb-2.5">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Isi Pengumuman Bebas
            </label>
            <textarea
              rows={4}
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Ketik draf pengumuman kelas di sini, sistem akan otomatis merapikan salam dan footer madrasah..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 resize-none"
            />
          </div>
        ) : (
          <>
            <div className="mb-2.5">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Judul / Topik Pengumuman
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="mb-2.5">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Rincian / Petunjuk Pengerjaan
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 resize-none"
              />
            </div>

            <div className="mb-2.5">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Batas Pengumpulan / Waktu Pelaksanaan
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Contoh: Besok pagi pukul 07.15 WIB"
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="mb-2.5">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Catatan Tambahan / Pesan Khusus
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={includeIslamicGreeting}
              onChange={(e) => setIncludeIslamicGreeting(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <span>Sertakan Salam Islami Resmi</span>
          </label>
        </div>
      </div>

      {/* Optional Direct Target WhatsApp Number */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200/90 mb-3">
        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
          Kirim ke Nomor WA Tertentu (Opsional)
        </label>
        <input
          type="tel"
          placeholder="Kosongkan jika ingin memilih grup di WhatsApp (atau isi 0812xxxxxx)"
          value={targetPhone}
          onChange={(e) => setTargetPhone(e.target.value)}
          className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {/* WhatsApp Message Bubble Live Preview */}
      <div className="mb-4">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Pratinjau Pesan WhatsApp
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">Tampilan Asli Obrolan</span>
        </div>

        {/* Authentic WhatsApp Bubble */}
        <div className="bg-[#EFEAE2] p-3.5 rounded-2xl border border-slate-300/80 shadow-inner relative">
          <div className="bg-[#DCF8C6] text-slate-900 rounded-2xl rounded-tr-none p-3.5 shadow-sm max-w-[94%] ml-auto border border-[#cbeabb]">
            <pre className="text-xs font-sans whitespace-pre-wrap leading-relaxed text-slate-800 select-all">
              {formattedMessage}
            </pre>
            <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-500">
              <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-blue-500 font-bold">✓✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Ergonomic Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleCopy}
          className="min-h-[48px] py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
        >
          <Copy className="w-4 h-4 text-emerald-400" />
          <span>Salin Teks WA</span>
        </button>

        <button
          onClick={handleSendWhatsApp}
          className="min-h-[48px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-transform"
        >
          <Send className="w-4 h-4 text-white" />
          <span>Buka WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
