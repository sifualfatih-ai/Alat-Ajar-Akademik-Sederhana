import React, { useState } from 'react';
import { Smartphone, Lock, User, Mail, School, Loader2, ArrowRight } from 'lucide-react';
import { SchoolSettings } from '../types';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../lib/firebase';

interface LoginViewProps {
  settings: SchoolSettings;
  onLoginSuccess: (token: string, userData?: any) => void;
}

export default function LoginView({ settings, onLoginSuccess }: LoginViewProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Form fields
  const [nama, setNama] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [namasekolah, setNamasekolah] = useState(settings.schoolName || '');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    if (isLoginMode) {
      if (!email || !password) {
        setError("Email dan Password wajib diisi.");
        return;
      }
      setIsLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = await user.getIdToken();
        onLoginSuccess(token, {
          uid: user.uid,
          email: user.email,
          nama: user.displayName || 'User',
        });
      } catch (err: any) {
        setError(err.message || "Login gagal. Periksa kembali email dan password Anda.");
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!nama || !whatsapp || !email || !namasekolah || !password) {
        setError("Semua kolom wajib diisi.");
        return;
      }
      setIsLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: nama });
        
        // Save user details to Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          nama,
          whatsapp,
          email,
          namasekolah,
          role: "teacher",
          createdAt: new Date().toISOString()
        });

        const token = await user.getIdToken();
        onLoginSuccess(token, {
          uid: user.uid,
          email,
          nama,
          whatsapp,
          namasekolah
        });
      } catch (err: any) {
        setError(err.message || "Pendaftaran gagal. Coba lagi.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 relative overflow-hidden py-10">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {settings.logo || 'GURU DIGITAL INDONESIA'}
          </h1>
          <p className="text-slate-400 text-sm">
            {settings.schoolName}
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              {isLoginMode ? 'Masuk ke Akun Anda' : 'Daftar Akun Baru'}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {isLoginMode 
                ? 'Masukkan email dan password Anda' 
                : 'Lengkapi data di bawah untuk bergabung'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}
          
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-3 rounded-xl mb-6">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Nama lengkap Anda"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Smartphone className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                    Nama Sekolah
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <School className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={namasekolah}
                      onChange={(e) => setNamasekolah(e.target.value)}
                      placeholder="Nama Instansi/Sekolah"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email aktif Anda"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password || (!isLoginMode && (!nama || !whatsapp || !namasekolah))}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 mt-6"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLoginMode ? 'Masuk' : 'Daftar Sekarang'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              {isLoginMode 
                ? 'Belum punya akun? Daftar di sini' 
                : 'Sudah punya akun? Masuk di sini'}
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Nafsflow. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </div>
  );
}
