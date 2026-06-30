import React, { useState, useRef, useEffect } from "react";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Info, 
  Trash2,
  ExternalLink,
  FolderOpen,
  ArrowDownToLine,
  Eye,
  Upload
} from "lucide-react";
import { SchoolSettings } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DownloadViewProps {
  settings: SchoolSettings;
}

export interface SharedDocument {
  id: string;
  title: string;
  format: string;
  size: string;
  category: string;
  uploader: string;
  date: string;
}

export default function DownloadView({ settings }: DownloadViewProps) {
  const [documents, setDocuments] = useState<SharedDocument[]>(() => {
    const defaultDocs = [
      {
        id: "preset-1",
        title: "Silabus Kurikulum Merdeka - IPA Kelas VII",
        format: "PDF",
        size: "1.4 MB",
        category: "Silabus",
        uploader: "Admin Sekolah",
        date: "2024-05-10"
      },
      {
        id: "preset-2",
        title: "Alur Tujuan Pembelajaran (ATP) - IPA Fase D",
        format: "DOCX",
        size: "820 KB",
        category: "ATP",
        uploader: "Admin Sekolah",
        date: "2024-05-12"
      },
      {
        id: "preset-3",
        title: "Template Spreadsheet Leger Penilaian Excel",
        format: "XLSX",
        size: "340 KB",
        category: "Template Nilai",
        uploader: "Admin Sekolah",
        date: "2024-05-15"
      },
      {
        id: "preset-4",
        title: "Template RPP (Rencana Pelaksanaan Pembelajaran)",
        format: "DOCX",
        size: "450 KB",
        category: "Template RPP",
        uploader: "Admin Sekolah",
        date: "2024-06-29"
      }
    ];

    const saved = localStorage.getItem("sg_shared_documents");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.some((d: SharedDocument) => d.id === "preset-4")) {
          return [defaultDocs[3], ...parsed];
        }
        return parsed;
      } catch (e) {
        return defaultDocs;
      }
    }
    return defaultDocs;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("sg_shared_documents", JSON.stringify(documents));
  }, [documents]);

  const triggerDownload = (doc: SharedDocument) => {
    const textStr = `Isi Dokumen Simulasi:\n${doc.title}\nKategori: ${doc.category}\nDiunduh dari Guru Digital Indonesia - ${settings.schoolName}.`;
    const element = document.createElement("a");
    const file = new Blob([textStr], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/\s+/g, "_")}.${doc.format.toLowerCase()}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      const sizeKB = (file.size / 1024).toFixed(0);
      const sizeStr = parseInt(sizeKB) > 1024 ? `${(parseInt(sizeKB) / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

      const newDoc: SharedDocument = {
        id: `doc-${Date.now()}`,
        title: file.name,
        format: extension,
        size: sizeStr,
        category: "Materi Baru",
        uploader: settings.teacherName || "Guru",
        date: new Date().toISOString().split("T")[0]
      };

      setDocuments(prev => [newDoc, ...prev]);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="space-y-6" id="download-view-wrapper">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-400" /> Berbagi Dokumen Ajar
          </h2>
          <p className="text-xs text-white/50 font-sans mt-0.5">
            Pusat berbagi dokumen modul ajar. Anda dapat mengunggah dan mengunduh berkas.
          </p>
        </div>
        
        <div>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all scale-active shadow-lg shadow-blue-900/20"
          >
            <Upload className="w-4 h-4" /> Unggah Dokumen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6" id="downloads-grid">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl space-y-4 text-white" id="preset-library">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-white/50 font-mono uppercase tracking-wider">Repositori Dokumen Bersama</h3>
            <span className="text-xxs text-white/40">Total: {documents.length} file</span>
          </div>

          <div className="divide-y divide-white/5" id="presets-list">
            {documents.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-xs">Belum ada dokumen.</div>
            ) : (
              documents.map(file => {
                const isExcel = file.format.includes('XLS');
                const isPdf = file.format.includes('PDF');
                return (
                  <div 
                    key={file.id}
                    className="py-3 flex items-center justify-between gap-4 text-xs font-sans group hover:bg-white/5 px-2 rounded-lg transition-colors text-white"
                  >
                    <div className="flex items-center gap-3 w-3/4">
                      <div className={`p-2.5 rounded-lg text-xs font-bold leading-none shrink-0 ${
                        isExcel 
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' 
                          : isPdf 
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' 
                          : 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                      }`}>
                        {isExcel ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>

                      <div className="space-y-0.5">
                        <p className="font-semibold text-white/90 group-hover:text-blue-300 transition-colors">{file.title}</p>
                        <div className="flex items-center gap-2 text-xxs text-white/40 flex-wrap">
                          <span className="font-mono bg-white/10 px-1 rounded uppercase tracking-wider">{file.format}</span>
                          <span>•</span>
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>Diunggah oleh: {file.uploader}</span>
                          <span>•</span>
                          <span>{file.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => triggerDownload(file)}
                        className="flex items-center gap-1 text-blue-300 bg-blue-600/20 hover:bg-blue-600/35 text-xxs px-3 py-1.5 rounded-lg font-bold border border-blue-500/20 transform transition-all active:scale-95 cursor-pointer"
                        title="Unduh File"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Unduh</span>
                      </button>
                      
                      {file.uploader === settings.teacherName && (
                        <button 
                          onClick={() => handleDelete(file.id)}
                          className="flex items-center gap-1 text-rose-300 bg-rose-600/20 hover:bg-rose-600/35 text-xxs px-2 py-1.5 rounded-lg font-bold border border-rose-500/20 transform transition-all active:scale-95 cursor-pointer"
                          title="Hapus File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
