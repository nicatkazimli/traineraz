import { Link } from 'react-router-dom';
import { LogIn, ArrowRight, Sparkles, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased relative overflow-hidden selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Neon Arxa Fon Işıqları */}
      <div className="absolute top-[-10%] left-[-20%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-20%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. NAVBAR */}
      <nav className="border-b border-zinc-900/80 bg-zinc-950/40 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-black text-base shadow-[0_0_20px_rgba(16,185,129,0.4)]">T</div>
            <span className="font-extrabold text-xl tracking-wider uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              TRAINER<span className="text-emerald-400 font-black">.AZ</span>
            </span>
          </div>
          
          {/* Mobil versiyada bu gizlədildi, çünki aşağıdakı düymələrlə birləşəcək */}
          <div className="hidden sm:flex items-center gap-2">
            <Link to="/client" className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all">
              <span className="text-xs uppercase tracking-widest font-bold text-zinc-400 group-hover:text-emerald-400">Müştəri Girişi</span>
              <LogIn className="w-3 h-3 text-zinc-400 group-hover:text-emerald-400" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO */}
      <div className="px-6 pt-20 pb-20 text-center relative z-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <motion.div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full text-xs font-medium text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Next-Gen İdarəetmə Sistemi
          </motion.div>
          
          <h1 className="text-5xl font-black tracking-tight uppercase sm:text-7xl leading-[1.1] bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Məşqçilikdə <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">Zirvə Sənin Yerindir</span>
          </h1>

          <p className="mx-auto max-w-lg text-zinc-400 text-sm sm:text-lg font-medium leading-relaxed">
            Kağız-qələm dövrü bitdi. Rəqəmsal gücünü işə sal və məşqçilik bazarında 
            <span className="text-white border-b border-emerald-500/50"> Liderliyini elan et.</span>
          </p>

          {/* BÜTÜN DÜYMƏLƏR BURADA ALT-ALTA DÜZÜLÜR */}
          <div className="pt-4 flex flex-col items-center justify-center gap-3 max-w-[280px] mx-auto">
            
            <Link to="/register" className="w-full flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-sm px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all">
              <UserPlus className="w-4 h-4" /> Platformada Qeydiyyat
            </Link>

         <Link 
  to="/login" 
  className="w-full flex items-center justify-center gap-2.5 bg-zinc-900/50 border border-zinc-800 text-zinc-200 font-bold text-sm px-6 py-4 rounded-2xl transition-all duration-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group relative overflow-hidden"
>
  {/* İşıq dalğası effekti (Məşqçi üçün fərqli bir rəng tonu) */}
  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full skew-x-[-20deg]" />
  
  <LogIn className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" /> 
  <span className="relative">Məşqçi Girişi</span>
</Link>

            {/* Mobil üçün görünən Müştəri Girişi */}
          <Link 
  to="/client" 
  className="sm:hidden w-full flex items-center justify-center gap-2.5 bg-zinc-900/40 border border-zinc-800 text-zinc-400 font-bold text-sm px-6 py-4 rounded-2xl transition-all duration-500 hover:border-teal-500/50 hover:bg-teal-500/10 hover:text-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.2)] group relative overflow-hidden"
>
  {/* Neon parıltı effekti */}
  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full skew-x-[-20deg]" />
  
  <LogIn className="w-4 h-4 group-hover:text-teal-400 transition-colors" /> 
  <span className="relative">Müştəri Girişi</span>
</Link>
          </div>
        </div>
      </div>
    </div>
  );
}