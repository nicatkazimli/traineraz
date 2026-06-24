import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Supabase Auth ilə giriş edilir
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data?.user) {
        // Giriş uğurludur! İstifadəçini birbaşa şəxsi dashboard-una göndəririk
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Giriş xətası:", err.message);
      setErrorMsg("E-poçt və ya şifrə yanlışdır.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Arka fon işığı */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-900 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
        
        {/* Başlıq */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-black text-xl mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-4">
            T
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Yenidən Xoş Gördük</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1.5">Məşqçi Giriş Paneli</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium uppercase tracking-wider text-center">
            {errorMsg}
          </div>
        )}

        {/* Giriş Formu */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">E-poçt Ünvanı</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@trainer.az"
                className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-600 font-medium"
              />
            </div>
          </div>

          {/* Şifrə */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Şifrə</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-12 pr-12 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-600 font-medium tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Giriş Butonu */}
          <button
            type="submit"
            disabled={loading}
            className="w-full group inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-zinc-950 font-black text-sm px-5 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.99] mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Panelə Daxil Ol
              </>
            )}
          </button>
        </form>

        {/* Qeydiyyata keçid */}
        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-500 font-medium">
            Hesabın yoxdur?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 transition-colors">
              İndi qeydiyyatdan keç
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}