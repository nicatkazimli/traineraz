import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { UserPlus, Mail, Lock, User, Briefcase, Award, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "../components/BackButton";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    specialty: 'Bodibildinq / Fitnes',
    experience: '1-3 il'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        const { error: dbError } = await supabase
          .from('traineraz')
          .insert([
            {
              id: authData.user.id,
              full_name: formData.fullName,
              specialty: formData.specialty,
              experience: formData.experience,
              rating: "5.0",
              image_url: ""
            }
          ]);

        if (dbError) throw dbError;

        setShowSuccess(true);
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      setErrorMsg(err.message || "Qeydiyyat zamanı xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      <BackButton />
      
      {/* Başarı Modalı */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-emerald-500/30 p-8 rounded-3xl text-center w-full max-w-xs shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            >
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Qeydiyyat Uğurludur!</h3>
              <p className="text-zinc-400 text-sm">İndi sistemə keçid edilir...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg bg-zinc-900/40 border border-zinc-900 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-black text-xl mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-4">
            T
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Hesabını Yarat</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1.5">Trainer.az Peşəkarlar Şəbəkəsi</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium uppercase tracking-wider text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Ad və Soyad</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Məs: Nicat Kazımlı" className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-600 font-medium" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">E-poçt Ünvanı</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="example@trainer.az" className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-600 font-medium" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Şifrə</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input type={showPassword ? "text" : "password"} name="password" required minLength={6} value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-12 pr-12 py-3 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-600 font-medium tracking-widest" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">İxtisas / Sahə</label>
            <select name="specialty" value={formData.specialty} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-4 py-3 text-sm focus:border-emerald-500 outline-none font-medium appearance-none cursor-pointer text-zinc-300">
              <option value="Bodibildinq / Fitnes">Bodibildinq / Fitnes</option>
              <option value="Krossfit / Ağır Atletika">Krossfit / Ağır Atletika</option>
              <option value="Kardio / Arıqlama">Kardio / Arıqlama</option>
              <option value="Yoqa / Pilates">Yoqa / Pilates</option>
              <option value="Boks / Kikboks">Boks / Kikboks</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-sm px-5 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.99] mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Qeydiyyatı Tamamla</>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-500 font-medium">
            Artıq hesabın var?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 transition-colors">Giriş et</Link>
          </p>
        </div>
      </div>
    </div>
  );
}