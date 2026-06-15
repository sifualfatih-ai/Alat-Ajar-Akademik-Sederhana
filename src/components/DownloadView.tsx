import React, { useState } from "react";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Info, 
  Trash2,
  ExternalLink,
  FolderOpen,
  ArrowDownToLine,
  Eye
} from "lucide-react";
import { SchoolSettings } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DownloadViewProps {
  settings: SchoolSettings;
}

export default function DownloadView({ settings }: DownloadViewProps) {

  // Preset boilerplate files
  const presetFiles = [
    {
      id: "preset-1",
      title: "Silabus Kurikulum Merdeka - IPA Kelas VII",
      classLevel: "Kelas VII",
      format: "PDF",
      size: "1.4 MB",
      category: "Silabus"
    },
    {
      id: "preset-2",
      title: "Alur Tujuan Pembelajaran (ATP) - IPA Fase D",
      classLevel: "Umum",
      format: "DOCX",
      size: "820 KB",
      category: "ATP"
    },
    {
      id: "preset-3",
      title: "Template Spreadsheet Leger Penilaian Excel",
      classLevel: "Umum",
      format: "XLSX",
      size: "340 KB",
      category: "Template Nilai"
    },
    {
      id: "preset-4",
      title: "Program Semester (PROSEM) IPA Kelas IX",
      classLevel: "Kelas IX",
      format: "DOCX",
      size: "1.1 MB",
      category: "Prosem"
    },
    {
      id: "preset-5",
      title: "Buku Catatan Wali Sensus Kelas VIII",
      classLevel: "Kelas VIII",
      format: "PDF",
      size: "950 KB",
      category: "Wali Kelas"
    }
  ];

  const triggerPresetDownload = (name: string, format: string) => {
    const textStr = `Isi Dokumen Simulasi:\n${name}\nKategori Berkas Penunjang Guru.\nDiunduh otomatis dari Sistem Administrasi Guru ${settings.schoolName}.`;
    const element = document.createElement("a");
    const file = new Blob([textStr], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${name.replace(/\s+/g, "_")}.${format.toLowerCase()}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadCustom = (doc: AIDocument) => {
    const element = document.createElement("a");
    const file = new Blob([doc.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6" id="download-view-wrapper">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-blue-400" /> Hub Perangkat Ajar & Dokumen
        </h2>
        <p className="text-xs text-white/50 font-sans mt-0.5">
          Akses repositori dokumen kurikulum sekolah dan unduh lembar kerja hasil desain AI Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6" id="downloads-grid">
        {/* Left Column: Preset Templates */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl space-y-4 text-white" id="preset-library">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-white/50 font-mono uppercase tracking-wider">Daftar Dokumen Penunjang (Preset)</h3>
            <span className="text-xxs text-white/40">Total: {presetFiles.length} file</span>
          </div>

          <div className="divide-y divide-white/5" id="presets-list">
            {presetFiles.map(file => {
              const isExcel = file.format === 'XLSX';
              return (
                <div 
                  key={file.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs font-sans group hover:bg-white/5 px-2 rounded-lg transition-colors text-white"
                >
                  <div className="flex items-center gap-3 w-3/4">
                    <div className={`p-2.5 rounded-lg text-xs font-bold leading-none shrink-0 ${
                      isExcel 
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' 
                        : file.format === 'PDF' 
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' 
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                    }`}>
                      {isExcel ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>

                    <div className="space-y-0.5">
                      <p className="font-semibold text-white/90 group-hover:text-blue-300 transition-colors">{file.title}</p>
                      <div className="flex items-center gap-2 text-xxs text-white/40">
                        <span className="font-mono bg-white/10 px-1 rounded uppercase tracking-wider">{file.format}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>Fase: {file.classLevel}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => triggerPresetDownload(file.title, file.format)}
                    className="flex items-center gap-1 text-blue-300 bg-blue-600/20 hover:bg-blue-600/35 text-xxs px-3 py-1.5 rounded-lg font-bold border border-blue-500/20 transform transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
