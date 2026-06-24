import { motion } from "framer-motion";
import { 
  Dumbbell, 
  Apple, 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  Award 
} from "lucide-react";

export default function Client() {
  // Demo data - gələcəkdə Supabase-dən gələcək
  const todaysWorkouts = [
    { id: 1, name: "Barbell Bench Press", sets: "4 Set x 10 Təkrar", done: true },
    { id: 2, name: "Incline Dumbbell Fly", sets: "3 Set x 12 Təkrar", done: false },
    { id: 3, name: "Push-Ups (Ağırlıqlı)", sets: "3 Set x Maksimum", done: false },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8 flex justify-center">
      
      {/* Arxa fon kiber parıltı */}
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 pb-12">
        
        {/* Məşqçi Profil Kartı */}
        <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl flex items-center gap-4 backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-zinc-950">
            Kİ
          </div>
          <div>
            <span className="text-xs text-zinc-500 block font-medium">ŞƏXSİ MƏŞQÇİN</span>
            <h3 className="text-sm font-bold text-white">Kazım İsaev</h3>
          </div>
          <div className="ml-auto bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider">AKTİV PRO</span>
          </div>
        </div>

        {/* Günlük Motivasiya və Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-zinc-900/60 to-zinc-900/20 border border-zinc-900 rounded-2xl flex flex-col justify-between h-28">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <span className="text-xs text-zinc-500 block">Günlük Hədəf</span>
              <h4 className="text-lg font-bold text-white">750 kcal</h4>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-zinc-900/60 to-zinc-900/20 border border-zinc-900 rounded-2xl flex flex-col justify-between h-28">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <div>
              <span className="text-xs text-zinc-500 block">Form Statusu</span>
              <h4 className="text-lg font-bold text-emerald-400">+12% Artış</h4>
            </div>
          </div>
        </div>

        {/* BUGÜNKÜ MƏŞQ PROQRAMI */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold tracking-wider text-zinc-400 uppercase">Bugünkü Məşq Planı</h2>
          </div>

          <div className="space-y-2.5">
            {todaysWorkouts.map((workout, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={workout.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  workout.done 
                    ? "bg-emerald-500/5 border-emerald-500/20 opacity-60" 
                    : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800"
                }`}
              >
                <div>
                  <h4 className={`text-sm font-semibold ${workout.done ? "line-through text-zinc-500" : "text-white"}`}>
                    {workout.name}
                  </h4>
                  <span className="text-xs text-zinc-500 mt-1 block">{workout.sets}</span>
                </div>
                <button className={`p-1 rounded-lg transition-colors ${workout.done ? "text-emerald-400" : "text-zinc-700 hover:text-zinc-500"}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* QİDALANMA REJİMİ (DIET BREEF) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Apple className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold tracking-wider text-zinc-400 uppercase">Qidalanma Təqvimi</h2>
          </div>

          <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-sm pb-2 border-b border-zinc-900">
              <span className="text-zinc-400 font-medium">Səhər Yeməyi</span>
              <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">08:30</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              4 ədəd yumurta ağı, 50qr yulaf, 1 ədəd banan. Şəkərsiz qəhvə və ya yaşıl çay.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}