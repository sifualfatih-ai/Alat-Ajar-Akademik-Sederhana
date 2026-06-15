import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Tangkap evet PWA Install trigger
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Munculkan popup jika belum di-install
      if (!localStorage.getItem('sg_pwa_dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('sg_pwa_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl p-4 flex flex-col gap-3"
        >
          <button onClick={handleDismiss} className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded-full bg-slate-700/50">
            <X size={16} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
               <Download size={24} className="text-white" />
            </div>
            <div>
              <h4 className="text-slate-100 font-semibold text-sm">Install Siasat Guru</h4>
              <p className="text-slate-400 text-xs">Simpan aplikasi ke perangkat agar dapat diakses offline & lebih cepat.</p>
            </div>
          </div>
          <button 
            onClick={handleInstallClick}
            className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-medium rounded-lg text-sm scale-active"
          >
            Install Aplikasi Sekarang
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
