import { useEffect, useState } from "react";
import { 
  LayoutDashboard, Users, LogOut, Plus, X, Copy, Trash2, Edit3, ShieldCheck, Menu 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [clients, setClients] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ id: null, name: '', fields: [{ label: '', value: '' }] });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  
  const navigate = useNavigate();

  useEffect(() => { fetchInitialData(); }, []);

  async function fetchInitialData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }
    
    const { data: prof } = await supabase.from("traineraz").select("*").eq("id", user.id).single();
    setProfile(prof);
    
    const { data: clientList } = await supabase.from("clients").select("*").eq("trainer_id", user.id);
    setClients(clientList || []);
    
    if (clientList) {
      const counts = clientList.reduce((acc, client) => {
        const date = new Date(client.created_at).toLocaleString('az', { month: 'short' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      const formatted = Object.keys(counts).map(month => ({ name: month, musteri: counts[month] }));
      setChartData(formatted);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/"); 
  };

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
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
      
      <aside className={`fixed md:relative z-50 w-64 h-full border-r border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="space-y-8">
          <div className="flex justify-between items-center text-emerald-400 font-bold text-lg">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black">T</div> TRAINER.AZ</div>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
          </div>
          <nav className="space-y-2">
            <button onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab === "dashboard" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500 hover:text-zinc-200"}`}>
              <LayoutDashboard size={16} /> Hesab
            </button>
            <button onClick={() => { setActiveTab("clients"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab === "clients" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500 hover:text-zinc-200"}`}>
              <Users size={16} /> Müştərilər
            </button>
          </nav>
        </div>

        <button onClick={handleLogout} className="group flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-500 hover:bg-red-950/20 rounded-xl transition-all border border-transparent hover:border-red-900/50">
          <LogOut size={16} /> <span className="font-bold uppercase tracking-widest">Çıxış Et</span>
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <button className="md:hidden mb-6 p-2 bg-zinc-900 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu/></button>
        
        {activeTab === "dashboard" ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Xoş gəldin, {profile?.full_name?.split(" ")[0]}! 👋</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <p className="text-zinc-500 text-sm">Ümumi Müştərilər</p>
                <h3 className="text-3xl font-bold text-white mt-1">{clients.length}</h3>
              </div>
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <p className="text-zinc-500 text-sm">Aktiv Sessiyalar</p>
                <h3 className="text-3xl font-bold text-white mt-1">{clients.length > 0 ? "Normal" : "0"}</h3>
              </div>
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4">
                <ShieldCheck className="text-emerald-500" size={32}/>
                <div><p className="text-emerald-500 font-bold">Sistem Aktivdir</p><p className="text-zinc-500 text-xs">Versiya 1.0.0</p></div>
              </div>
            </div>

            {/* Trading Desk Qrafik */}
            <div className="h-72 w-full bg-[#0B0E14] p-6 rounded-3xl border border-[#1E222D] shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[#848E9C] font-bold uppercase tracking-widest text-xs">Müştəri axını analitikası</h3>
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-500 font-mono tracking-widest">LIVE DATA</span>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E222D" vertical={false} />
                  <defs>
                    <linearGradient id="colorMusteri" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#373A46" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#373A46" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E222D', border: '1px solid #373A46', borderRadius: '8px', fontSize: '12px' }} />
                  <Area 
                    type="step" 
                    dataKey="musteri" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    fill="url(#colorMusteri)" 
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#000', strokeWidth: 2 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Müştərilərin</h2>
              <button onClick={() => { setClientForm({ id: null, name: '', fields: [{label: '', value: ''}] }); setIsClientModalOpen(true); }} className="bg-emerald-500 text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Plus size={16}/> Əlavə et</button>
            </div>
            <div className="space-y-3">
              {clients.map(c => (
                <div key={c.id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => { setClientForm({ id: c.id, name: c.full_name, fields: c.profile_data }); setIsClientModalOpen(true); }}>
                    <p className="font-bold text-sm md:text-base">{c.full_name}</p>
                    <p className="text-xs text-emerald-400 tracking-widest font-mono">Kod: {c.access_code}</p>
                  </div>
                  <div className="flex gap-1 md:gap-2">
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

      {/* Digər komponentlər (Modal və Silmə təsdiqi) eyni qalır... */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-emerald-500/50 p-6 rounded-3xl w-full max-w-xs shadow-[0_0_30px_-10px_rgba(16,185,129,0.5)]">
            <h3 className="font-bold text-lg mb-2">Silmək istəyirsiniz?</h3>
            <div className="flex gap-3 mt-6"><button onClick={() => setDeleteConfirm({ isOpen: false, id: null })} className="flex-1 py-2 rounded-xl bg-zinc-800 text-sm">Xeyr</button><button onClick={handleDelete} className="flex-1 py-2 rounded-xl bg-red-500 text-black text-sm font-bold">Sil</button></div>
          </div>
        </div>
      )}
      
      {isClientModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-6 rounded-3xl w-full max-w-sm border border-zinc-800">
            <h3 className="font-bold mb-4">{clientForm.id ? "Redaktə et" : "Yeni Müştəri"}</h3>
            <input placeholder="Ad Soyad" className="w-full bg-zinc-950 p-3 rounded-xl mb-4 border border-zinc-800" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} />
            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
              {clientForm.fields.map((f, i) => (
                <div key={i} className="flex gap-2"><input placeholder="Başlıq" className="w-1/3 bg-zinc-950 p-2 rounded-lg text-xs" value={f.label} onChange={e => { const fld = [...clientForm.fields]; fld[i].label = e.target.value; setClientForm({...clientForm, fields: fld})}} /><input placeholder="Dəyər" className="flex-1 bg-zinc-950 p-2 rounded-lg text-xs" value={f.value} onChange={e => { const fld = [...clientForm.fields]; fld[i].value = e.target.value; setClientForm({...clientForm, fields: fld})}} /><button onClick={() => setClientForm({...clientForm, fields: clientForm.fields.filter((_, idx) => idx !== i)})} className="text-red-500"><X size={14}/></button></div>
              ))}
            </div>
            <button onClick={() => setClientForm({...clientForm, fields: [...clientForm.fields, {label: '', value: ''}]})} className="text-emerald-400 text-xs font-bold mb-6">+ Yeni sahə</button>
            <div className="flex gap-3"><button onClick={() => setIsClientModalOpen(false)} className="flex-1 py-2 bg-zinc-800 rounded-xl text-xs">Ləğv</button><button onClick={saveClient} className="flex-1 py-2 bg-emerald-500 text-black rounded-xl font-bold text-xs">Yadda Saxla</button></div>
          </div>
        </div>
      )}
    </div>
  );
}