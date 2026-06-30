import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, ArrowRight, Sparkles, UserPlus, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const headingLine1 = 'Məşqçilikdə'.split('');
const headingLine2 = 'Zirvə Sənin Yerindir'.split('');

const letterVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.025, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Home() {
  const heroRef = useRef(null);
  const [spot, setSpot] = useState({ x: 50, y: 50 });

  function handleMouseMove(e) {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased relative overflow-hidden selection:bg-emerald-500 selection:text-zinc-950">

      {/* Ejdaha Nəfəsi — animasiyalı arxa fon glow-ları */}
      <motion.div
        className="absolute top-[-10%] left-[-20%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none"
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[30%] right-[-20%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none"
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[20%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[130px] pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* İncə pulcuq (scale) toxuması — ejdaha dərisi hissi */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="scales" width="44" height="44" patternUnits="userSpaceOnUse">
            <path
              d="M22 0 C34 0 44 10 44 22 C34 22 22 32 22 44 C10 44 0 34 0 22 C0 10 10 0 22 0 Z"
              fill="none"
              stroke="rgb(16,185,129)"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scales)" />
      </svg>

      {/* 1. NAVBAR */}
      <nav className="border-b border-zinc-900/80 bg-zinc-950/40 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-black text-base shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              T
            </div>
            <span className="font-extrabold text-xl tracking-wider uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              TRAINER<span className="text-emerald-400 font-black">.AZ</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/client"
              className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
              aria-label="Müştəri girişi"
            >
              <span className="text-xs uppercase tracking-widest font-bold text-zinc-400 group-hover:text-emerald-400">
                Müştəri Girişi
              </span>
              <LogIn className="w-3 h-3 text-zinc-400 group-hover:text-emerald-400" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO */}
      <div
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="px-6 pt-20 pb-20 text-center relative z-10"
        style={{
          background: `radial-gradient(600px circle at ${spot.x}% ${spot.y}%, rgba(16,185,129,0.07), transparent 70%)`,
        }}
      >
        <div className="mx-auto max-w-4xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full text-xs font-medium text-emerald-400"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Next-Gen İdarəetmə Sistemi
          </motion.div>

          <h1 className="text-5xl font-black tracking-tight uppercase sm:text-7xl leading-[1.1]">
            <span className="block bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              {headingLine1.map((char, i) => (
                <motion.span
                  key={`l1-${i}`}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={letterVariants}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </span>
            <span className="block bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
              {headingLine2.map((char, i) => (
                <motion.span
                  key={`l2-${i}`}
                  custom={i + headingLine1.length}
                  initial="hidden"
                  animate="visible"
                  variants={letterVariants}
                  className="inline-block"
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.7 }}
            className="mx-auto max-w-lg text-zinc-400 text-sm sm:text-lg font-medium leading-relaxed"
          >
            Kağız-qələm dövrü bitdi. Rəqəmsal gücünü işə sal və məşqçilik bazarında
            <span className="text-white border-b border-emerald-500/50"> Liderliyini elan et.</span>
          </motion.p>

          {/* DÜYMƏLƏR */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="pt-4 flex flex-col items-center justify-center gap-3 max-w-[280px] mx-auto"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full">
              <Link
                to="/register"
                className="w-full flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-sm px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_45px_rgba(16,185,129,0.4)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="Platformada qeydiyyatdan keç"
              >
                <UserPlus className="w-4 h-4" /> Platformada Qeydiyyat
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full">
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2.5 bg-zinc-900/50 border border-zinc-800 text-zinc-200 font-bold text-sm px-6 py-4 rounded-2xl transition-all duration-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group relative overflow-hidden"
                aria-label="Məşqçi girişi"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full skew-x-[-20deg]" />
                <LogIn className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                <span className="relative">Məşqçi Girişi</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="sm:hidden w-full">
              <Link
                to="/client"
                className="w-full flex items-center justify-center gap-2.5 bg-zinc-900/40 border border-zinc-800 text-zinc-400 font-bold text-sm px-6 py-4 rounded-2xl transition-all duration-500 hover:border-teal-500/50 hover:bg-teal-500/10 hover:text-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.2)] group relative overflow-hidden"
                aria-label="Müştəri girişi"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full skew-x-[-20deg]" />
                <LogIn className="w-4 h-4 group-hover:text-teal-400 transition-colors" />
                <span className="relative">Müştəri Girişi</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Etibar göstəricisi */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="pt-10 flex items-center justify-center gap-6 text-zinc-600 text-xs uppercase tracking-widest font-bold"
          >
            <span className="text-emerald-400">500+</span> Məşqçi
            <span className="w-px h-3 bg-zinc-800" />
            <span className="text-emerald-400">12K+</span> Müştəri
            <span className="w-px h-3 bg-zinc-800" />
            <span className="text-emerald-400">99%</span> Məmnuniyyət
          </motion.div>
        </div>
      </div>
    </div>
  );
}
