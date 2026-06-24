import { useEffect, useState } from "react";
import { 
  LayoutDashboard, Users, LogOut, Plus, X, Copy, Trash2, Save, Edit3, ShieldCheck 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ id: null, name: '', fields: [{ label: '', value: '' }] });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  
  const navigate = useNavigate();

  useEffect(() => { fetchInitialData(); }, [navigate]);

  async function fetchInitialData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }
    const { data: prof } = await supabase.from("traineraz").select("*").eq("id", user.id).single();
    setProfile(prof);
    const { data: clientList } = await supabase.from("clients").select("*").eq("trainer_id", user.id);
    setClients(clientList || []);
    setLoading(false);
  }

  const saveClient = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (clientForm.id) {
      await supabase.from('clients').update({ full_name: clientForm.name, profile_data: clientForm.fields }).eq('id', clientForm.id);
    } else {
      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await supabase.from('clients').insert([{ trainer_id: user.id, full_name: clientForm.name, profile_data: clientForm.fields, access_code: accessCode }]);
    }
    setIsClientModalOpen(false);
    fetchInitialData();
  };

  const handleDelete = async () => {
    await supabase.from('clients').delete().eq('id', deleteConfirm.id);
    setDeleteConfirm({ isOpen: false, id: null });
    fetchInitialData();
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-2 font-bold text-lg text-emerald-400">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black">T</div>
            TRAINER.AZ
          </div>
          <nav className="space-y-2">
            <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab === "dashboard" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500 hover:text-zinc-200"}`}>
              <LayoutDashboard size={16} /> Mərkəz
            </button>
            <button onClick={() => setActiveTab("clients")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab === "clients" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500 hover:text-zinc-200"}`}>
              <Users size={16} /> Müştərilər
            </button>
          </nav>
        </div>
        <button onClick={() => {supabase.auth.signOut(); navigate("/login")}} className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-950/20 rounded-xl transition-all">
          <LogOut size={16} /> Çıxış Et
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        {activeTab === "dashboard" ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Xoş gəldin, {profile?.full_name?.split(" ")[0]}! 👋</h1>
              <p className="text-zinc-500 mt-2">Bugünkü fəaliyyətini nəzərdən keçir.</p>
            </div>
            
            {/* Statistika Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500/30 transition-all">
                <p className="text-zinc-500 text-sm">Ümumi Müştərilər</p>
                <h3 className="text-3xl font-bold text-white mt-1">{clients.length}</h3>
              </div>
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500/30 transition-all">
                <p className="text-zinc-500 text-sm">Aktiv Sessiyalar</p>
                <h3 className="text-3xl font-bold text-white mt-1">{clients.length > 0 ? "Normal" : "0"}</h3>
              </div>
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500/30 transition-all flex items-center gap-4">
                <ShieldCheck className="text-emerald-500" size={32}/>
                <div>
                  <p className="text-emerald-500 font-bold">Sistem Aktivdir</p>
                  <p className="text-zinc-500 text-xs">Versiya 1.0.0</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Müştərilərin ({clients.length})</h2>
              <button onClick={() => { setClientForm({ id: null, name: '', fields: [{label: '', value: ''}] }); setIsClientModalOpen(true); }} className="bg-emerald-500 text-black px-6 py-2 rounded-xl font-bold flex items-center gap-2"><Plus size={16}/> Yeni Müştəri</button>
            </div>
            <div className="space-y-3">
              {clients.map(c => (
                <div key={c.id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all">
                  <div className="cursor-pointer flex-1" onClick={() => { setClientForm({ id: c.id, name: c.full_name, fields: c.profile_data }); setIsClientModalOpen(true); }}>
                    <p className="font-bold">{c.full_name}</p>
                    <p className="text-xs text-emerald-400 tracking-widest uppercase font-mono">Kod: {c.access_code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setClientForm({ id: c.id, name: c.full_name, fields: c.profile_data }); setIsClientModalOpen(true); }} className="p-2 hover:bg-zinc-800 text-emerald-400 rounded-lg"><Edit3 size={16}/></button>
                    <button onClick={() => navigator.clipboard.writeText(c.access_code)} className="p-2 hover:bg-zinc-800 rounded-lg"><Copy size={16}/></button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, id: c.id })} className="p-2 hover:bg-red-900/30 text-red-400 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Neon Delete Confirm Box */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-emerald-500/50 p-6 rounded-3xl w-full max-w-xs shadow-[0_0_30px_-10px_rgba(16,185,129,0.5)]">
            <h3 className="font-bold text-lg mb-2 text-white">Silmək istəyirsiniz?</h3>
            <p className="text-zinc-400 text-sm mb-6">Müştəri və ona aid bütün məlumatlar silinəcək.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm({ isOpen: false, id: null })} className="flex-1 py-2 rounded-xl bg-zinc-800 text-sm font-medium hover:bg-zinc-700">Xeyr</button>
              <button onClick={handleDelete} className="flex-1 py-2 rounded-xl bg-red-500 text-black text-sm font-bold hover:bg-red-400">Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-6 rounded-3xl w-full max-w-sm border border-zinc-800 shadow-2xl">
            <h3 className="font-bold mb-4">{clientForm.id ? "Redaktə et" : "Yeni Müştəri"}</h3>
            <input placeholder="Ad Soyad" className="w-full bg-zinc-950 p-3 rounded-xl mb-4 border border-zinc-800" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} />
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {clientForm.fields.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input placeholder="Başlıq" className="w-1/3 bg-zinc-950 p-2 rounded-lg text-xs" value={f.label} onChange={e => { const fld = [...clientForm.fields]; fld[i].label = e.target.value; setClientForm({...clientForm, fields: fld})}} />
                  <input placeholder="Dəyər" className="flex-1 bg-zinc-950 p-2 rounded-lg text-xs" value={f.value} onChange={e => { const fld = [...clientForm.fields]; fld[i].value = e.target.value; setClientForm({...clientForm, fields: fld})}} />
                  <button onClick={() => setClientForm({...clientForm, fields: clientForm.fields.filter((_, idx) => idx !== i)})} className="text-red-500"><X size={14}/></button>
                </div>
              ))}
            </div>
            <button onClick={() => setClientForm({...clientForm, fields: [...clientForm.fields, {label: '', value: ''}]})} className="text-emerald-400 text-xs font-bold mb-6">+ Yeni sahə əlavə et</button>
            <div className="flex gap-3">
              <button onClick={() => setIsClientModalOpen(false)} className="flex-1 py-2 bg-zinc-800 rounded-xl text-xs">Ləğv</button>
              <button onClick={saveClient} className="flex-1 py-2 bg-emerald-500 text-black rounded-xl font-bold text-xs flex items-center justify-center gap-2"><Save size={14}/> Yadda Saxla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}