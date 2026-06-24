import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { LogIn, ArrowRight, Star, Sparkles, UserPlus, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTrainers() {
      try {
        setLoading(true);
        // Cədvəl adını rəsmi olaraq 'traineraz' etdik ki data düzgün gəlsin
        const { data, error } = await supabase
          .from('traineraz')
          .select('*');

        if (error) throw error;
        setTrainers(data || []);
      } catch (err) {
        console.error('Məlumat yüklənərkən xəta:', err.message);
      } finally {
        setLoading(false);
      }
    }

    getTrainers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-4 border-zinc-900 border-t-emerald-500 shadow-[0_0_15px_#10b981]"></div>
          <span className="text-xs font-black tracking-widest text-emerald-500 uppercase animate-pulse">TRAINER</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased relative overflow-hidden selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Kiber Göz Oxşayan Neon Arxa Fon Işıqları */}
      <div className="absolute top-[-10%] left-[-20%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-20%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. ÜST NAVİQASİYA (NAVBAR) */}
      <nav className="border-b border-zinc-900/80 bg-zinc-950/40 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 transition-all">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Premium Logo */}
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-black text-base shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">
              T
            </div>
            <span className="font-extrabold text-xl tracking-wider uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              TRAINER<span className="text-emerald-400 font-black">.AZ</span>
            </span>
          </div>
          
          {/* Sağ tərəf sadə və elit qaldı */}
          <div className="flex items-center gap-2">
            <Link 
              to="/client" 
              className="text-xs uppercase tracking-widest font-semibold text-zinc-400 hover:text-emerald-400 transition-colors px-4 py-2"
            >
              Demo Müştəri
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO / BAŞLIQ BÖLMƏSİ (Bütün Diqqət Butonlarda) */}
      <div className="px-6 pt-24 pb-20 text-center relative z-10">
        <div className="mx-auto max-w-4xl space-y-8">
          
          {/* Mini Premium Nişan */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800/80 rounded-full text-xs font-medium text-emerald-400 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Next-Gen İdarəetmə Sistemi
          </motion.div>
          
          {/* Böyük Ejdaha Başlıq */}
          <h1 className="text-5xl font-black tracking-tight uppercase sm:text-7xl leading-[1.1] bg-gradient-to-b from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent">
            Məşq Biznesini <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              Rəqəmsallaşdır
            </span>
          </h1>
          
          {/* Alt Açıqlama */}
          <p className="mx-auto max-w-xl text-zinc-400 text-sm sm:text-base font-medium leading-relaxed">
            Müştərilərini izlə, qrafikini saat kimi idarə et və gəlirlərini analitika ilə böyüt. TRAINER.AZ peşəkar məşqçilər üçün hazırlanmış kiber-lüks platformadır.
          </p>

          {/* Sənin İstədiyin - Mərkəzdəki Möhtəşəm Butonlar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            
            {/* Qeydiyyat Butonu (Yeni əlavə olundu - Premium Vizualla) */}
            <Link 
              to="/register" 
              className="w-full group inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-sm px-6 py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" /> Platformada Qeydiyyat
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Giriş Butonu (Neon kənarlı lüks variant) */}
            <Link 
              to="/login" 
              className="w-full group inline-flex items-center justify-center gap-2.5 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-bold text-sm px-6 py-4 rounded-2xl transition-all backdrop-blur-md active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" /> Məşqçi Girişi
            </Link>

          </div>
        </div>
      </div>

      {/* Xətt Ayrıcı (Glow effektli) */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-900 to-transparent relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </div>

      {/* 3. MƏŞQÇİ KARTLARI (GRID SECTION) */}
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-24 relative z-10">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-wider uppercase text-white">
              Sistemdəki Aktiv <span className="text-emerald-400">Məşqçilər</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Real vaxt rejimində verilənlər bazasından yenilənir</p>
          </div>
          <div className="h-px flex-1 bg-zinc-900 max-w-xs hidden md:block" />
        </div>

        {trainers.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/10 border border-zinc-900/60 rounded-3xl p-8 backdrop-blur-sm max-w-md mx-auto">
            <ShieldAlert className="w-8 h-8 text-zinc-600 mx-auto mb-3 animate-pulse" />
            <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider">Hələlik Aktiv Məşqçi Yoxdur</h3>
            <p className="text-zinc-600 text-xs mt-1">Yuxarıdakı butonla ilk "ejdaha" qeydiyyatı sən et!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {trainers.map((trainer) => (
              <div 
                key={trainer.id} 
                className="group relative overflow-hidden rounded-3xl bg-zinc-900/10 p-4 border border-zinc-900/60 transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/30 hover:shadow-[0_15px_40px_rgba(16,185,129,0.04)] backdrop-blur-md"
              >
                {/* Şəkil zonası */}
                <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900/40">
                  <img 
                    src={trainer.image_url || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=500"} 
                    alt={trainer.full_name}
                    className="h-full w-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-700 group-hover:scale-[1.03]"
                  />
                  {/* Kölgə Layeri */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90" />
                  
                  {/* Premium Reytinq Nişanı */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-xl bg-zinc-950/80 px-3 py-1.5 backdrop-blur-md border border-zinc-850 shadow-lg">
                    <Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    <span className="text-xs font-black text-zinc-200">{trainer.rating || "5.0"}</span>
                  </div>
                </div>

                {/* Məlumatlar bölməsi */}
                <div className="mt-5 px-1.5 pb-1">
                  <h3 className="text-xl font-bold tracking-wide text-zinc-200 group-hover:text-emerald-400 transition-colors duration-300">
                    {trainer.full_name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {trainer.specialty}
                  </p>
                  
                  {/* Təcrübə paneli */}
                  <div className="mt-5 flex items-center justify-between border-t border-zinc-900/80 pt-4">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Status / Təcrübə</span>
                    <span className="rounded-lg bg-emerald-500/5 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/10 uppercase tracking-wide">
                      {trainer.experience}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}