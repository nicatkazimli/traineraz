import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import BackButton from "../components/BackButton";
import { motion, AnimatePresence } from "framer-motion"; // Lazımdır

export default function ClientView() {
  const [code, setCode] = useState("");
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false); // Yeni: Xəta modalı üçün

  const fetchClientData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("access_code", code.toUpperCase())
      .single();

    if (data) {
      setClient(data);
    } else {
      setShowError(true); // Alert yerinə modalı aktivləşdiririk
    }
    setLoading(false);
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <BackButton />
        
        {/* Xəta Modalı */}
        <AnimatePresence>
          {showError && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900 border border-red-500/30 p-6 rounded-3xl w-full max-w-xs shadow-[0_0_40px_rgba(239,68,68,0.15)] text-center"
              >
                <h3 className="text-white font-bold text-lg mb-2">Kod tapılmadı!</h3>
                <p className="text-zinc-400 text-sm mb-6">Daxil etdiyiniz kod yanlışdır və ya sistemdə mövcud deyil.</p>
                <button 
                  onClick={() => setShowError(false)}
                  className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
                >
                  OK
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 w-full max-w-sm text-center shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-white">Müştəri Girişi</h2>
          <input 
            className="w-full bg-zinc-950 p-4 rounded-xl mb-4 border border-zinc-800 text-center uppercase tracking-widest font-bold focus:border-emerald-500 outline-none transition-all"
            placeholder="KODU DAXİL ET"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button 
            onClick={fetchClientData} 
            className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            {loading ? "Yoxlanılır..." : "Daxil Ol"}
          </button>
        </div>
      </div>
    );
  }

  // --- MÜŞTƏRİ DETALLARI EKRANI ---
  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <BackButton />
      <div className="max-w-2xl mx-auto pt-16">
        <h1 className="text-3xl font-bold mb-8">Salam, {client.full_name}! 👋</h1>
        <div className="grid gap-4">
          {client.profile_data.map((f, i) => (
            <div key={i} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500/30 transition-colors">
              <p className="text-zinc-500 text-sm mb-1 uppercase tracking-wider">{f.label}</p>
              <p className="text-white font-semibold text-lg">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}