import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import BackButton from "../components/BackButton";

export default function ClientView() {
  const [code, setCode] = useState("");
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClientData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("access_code", code.toUpperCase())
      .single();

    if (data) setClient(data);
    else alert("Kod tapılmadı, yenidən yoxlayın!");
    setLoading(false);
  };

  // --- GİRİŞ EKRANI (Əgər client hələ yoxdursa) ---
  if (!client) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        {/* Giriş ekranı üçün BackButton */}
        <BackButton />
        
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

  // --- MÜŞTƏRİ DETALLARI EKRANI (Əgər client varsa) ---
  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      {/* Detallar ekranı üçün BackButton */}
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