import { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, ArrowRight, UserPlus, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const line2Words = 'Zirvə Sənin Yerindir'.split(' ');

const wordVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.35 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Home() {
  const heroRef = useRef(null);

  // CSS variable ilə idarə olunur — React state/re-render YOXDUR,
  // ona görə mouse hərəkəti zamanı donma olmur.
  const handleMouseMove = useCallback((e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    heroRef.current.style.setProperty('--spot-x', `${x}%`);
    heroRef.current.style.setProperty('--spot-y', `${y}%`);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased relative overflow-hidden selection:bg-emerald-500 selection:text-zinc-950">

      {/* Ejdaha Nəfəsi — yüngül, GPU-composited CSS animasiyası (framer-motion yox,
          ona görə ana thread-i bloklamır) */}
      <div className="absolute top-[-10%] left-[-20%] w-[380px] h-[380px] sm:w-[800px] sm:h-[800px] bg-emerald-500/10 rounded-full blur-[80px] sm:blur-[160px] pointer-events-none animate-glow-a will-change-transform" />
      <div className="absolute top-[30%] right-[-20%] w-[280px] h-[280px] sm:w-[600px] sm:h-[600px] bg-amber-500/10 rounded-full blur-[70px] sm:blur-[140px] pointer-events-none animate-glow-b will-change-transform" />

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
              className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
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
        className="hero-spotlight px-6 pt-14 pb-16 sm:pt-20 sm:pb-20 text-center relative z-10"
      >
        <div className="mx-auto max-w-4xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full text-xs font-medium text-emerald-400"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Next-Gen İdarəetmə Sistemi
          </motion.div>

          {/* Başlıq — söz-söz stagger (hərf-hərf DEYİL), ona görə dəfələrlə az
              DOM/animasiya elementi var və performans çox yaxşıdır. Sözlər
              tam bütöv qalır, ortadan bölünmür. */}
          <h1 className="font-black tracking-tight uppercase leading-[1.1]">
            <motion.span
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="block text-5xl sm:text-7xl bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent"
            >
              Məşqçilikdə
            </motion.span>
            <span className="flex flex-wrap justify-center gap-x-2.5 gap-y-1 sm:gap-x-4 mt-1 text-3xl sm:text-6xl bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
              {line2Words.map((word, i) => (
                <motion.span
                  key={word}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={wordVariants}
                  className="inline-block whitespace-nowrap"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mx-auto max-w-lg text-zinc-400 text-sm sm:text-lg font-medium leading-relaxed"
          >
            Kağız-qələm dövrü bitdi. Rəqəmsal gücünü işə sal və məşqçilik bazarında
            <span className="text-white border-b border-emerald-500/50"> Liderliyini elan et.</span>
          </motion.p>

          {/* DÜYMƏLƏR */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.5 }}
            className="pt-4 flex flex-col items-center justify-center gap-3 max-w-[280px] mx-auto"
          >
            <Link
              to="/register"
              className="group w-full flex items-center justify-center gap-2.5 touch-manipulation bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-zinc-950 font-black text-sm px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_45px_rgba(16,185,129,0.4)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Platformada qeydiyyatdan keç"
            >
              <UserPlus className="w-4 h-4" /> Platformada Qeydiyyat
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>

            <Link
              to="/login"
              className="group w-full flex items-center justify-center gap-2.5 touch-manipulation bg-zinc-900/50 border border-zinc-800 text-zinc-200 font-bold text-sm px-6 py-4 rounded-2xl active:scale-[0.98] transition-colors duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-emerald-400 relative overflow-hidden"
              aria-label="Məşqçi girişi"
            >
              <LogIn className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              <span className="relative">Məşqçi Girişi</span>
            </Link>

            <Link
              to="/client"
              className="group sm:hidden w-full flex items-center justify-center gap-2.5 touch-manipulation bg-zinc-900/40 border border-zinc-800 text-zinc-400 font-bold text-sm px-6 py-4 rounded-2xl active:scale-[0.98] transition-colors duration-300 hover:border-teal-500/50 hover:bg-teal-500/10 hover:text-teal-400"
              aria-label="Müştəri girişi"
            >
              <LogIn className="w-4 h-4 group-hover:text-teal-400 transition-colors" />
              <span className="relative">Müştəri Girişi</span>
            </Link>
          </motion.div>

          {/* Etibar göstəricisi — neon-hover kartlar, mobil-friendly grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="pt-10 grid grid-cols-3 gap-2.5 sm:gap-4 max-w-md mx-auto"
          >
            {[
              { value: '500+', label: 'Məşqçi' },
              { value: '12K+', label: 'Müştəri' },
              { value: '99%', label: 'Məmnuniyyət' },
            ].map((stat) => (
              <div key={stat.label} className="stat-card group relative rounded-xl sm:rounded-2xl border border-zinc-800 bg-zinc-900/40 px-2 py-3 sm:px-4 sm:py-5 overflow-hidden transition-colors duration-300 hover:border-emerald-500/60">
                <div className="stat-glow pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative text-lg sm:text-2xl font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  {stat.value}
                </div>
                <div className="relative mt-1 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Yüngül CSS-yalnız animasiyalar — JS-in idarə etmədiyi, ona görə
          ana thread-i bloklamır və "donma" yaratmır */}
      <style>{`
        .hero-spotlight {
          --spot-x: 50%;
          --spot-y: 50%;
          background: radial-gradient(600px circle at var(--spot-x) var(--spot-y), rgba(16,185,129,0.07), transparent 70%);
        }
        @keyframes glowA {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        @keyframes glowB {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .animate-glow-a { animation: glowA 7s ease-in-out infinite; }
        .animate-glow-b { animation: glowB 9s ease-in-out infinite 1s; }

        .stat-card {
          box-shadow: 0 0 0 rgba(16,185,129,0);
          transition: box-shadow 0.4s ease, border-color 0.3s ease, transform 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 24px rgba(16,185,129,0.18), inset 0 0 16px rgba(16,185,129,0.06);
        }
        .stat-glow {
          background: radial-gradient(120px circle at 50% 0%, rgba(16,185,129,0.25), transparent 70%);
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-glow-a, .animate-glow-b { animation: none; }
        }
      `}</style>
    </div>
  );
}
