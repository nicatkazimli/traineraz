import { Link } from 'react-router-dom';
import { LogIn, ArrowRight, Sparkles, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
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
          
          <div className="flex items-center gap-2">
            <Link 
              to="/client" 
              className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-300" />
              <span className="relative text-xs uppercase tracking-widest font-bold text-zinc-400 group-hover:text-emerald-400 transition-colors">
                Müştəri Girişi
              </span>
              <div className="relative p-1 rounded-full bg-zinc-800 group-hover:bg-emerald-500 group-hover:shadow-[0_0_10px_#10b981] transition-all duration-300">
                <LogIn className="w-3 h-3 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO / BAŞLIQ BÖLMƏSİ */}
      <div className="px-6 pt-24 pb-20 text-center relative z-10">
        <div className="mx-auto max-w-4xl space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800/80 rounded-full text-xs font-medium text-emerald-400 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Next-Gen İdarəetmə Sistemi
          </motion.div>
          
          <h1 className="text-5xl font-black tracking-tight uppercase sm:text-7xl leading-[1.1] bg-gradient-to-b from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent">
            Məşqçilikdə <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              Zirvə Sənin Yerindir
            </span>
          </h1>

          <p className="mx-auto max-w-lg text-zinc-400 text-sm sm:text-lg font-medium leading-relaxed mt-6">
            Kağız-qələm dövrü bitdi. 
            <span className="text-emerald-400 font-bold"> TRAINER.AZ </span> 
            ilə rəqəmsal gücünü işə sal, müştərilərini avtomatlaşdır və məşqçilik bazarında 
            <span className="text-white border-b border-emerald-500/50"> Liderliyini elan et. </span>
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link 
              to="/register" 
              className="w-full group inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-sm px-6 py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" /> Platformada Qeydiyyat
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

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

    </div>
  );
}