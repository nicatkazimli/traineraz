import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Users, LogOut, Plus, X, Copy, Trash2, Edit3, ShieldCheck,
  Menu, Search, ArrowUpDown, QrCode, Settings, Check, AlertCircle, Info,
  TrendingUp, TrendingDown, Share2, ChevronRight, Loader2, User, Mail,
  Sparkles, ClipboardList, Phone, Target, Scale, Cake, FileText, Camera,
  LayoutGrid, List, Clock, UserPlus, Tag
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

/* ----------------------------------------------------------------------
   Helpers
---------------------------------------------------------------------- */

// Cryptographically-safe, human-friendly access code (no 0/O/1/I confusion)
function generateAccessCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const random = new Uint32Array(length);
  crypto.getRandomValues(random);
  return Array.from(random, (n) => chars[n % chars.length]).join("");
}

async function getUniqueAccessCode() {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateAccessCode();
    const { data } = await supabase.from("clients").select("id").eq("access_code", code).maybeSingle();
    if (!data) return code;
  }
  // Astronomically unlikely fallback
  return generateAccessCode(8);
}

// Groups clients by real calendar month (year-aware) and sorts chronologically
function buildChartData(clientList) {
  const buckets = {};
  clientList.forEach((c) => {
    const d = new Date(c.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!buckets[key]) buckets[key] = { date: new Date(d.getFullYear(), d.getMonth(), 1), count: 0 };
    buckets[key].count += 1;
  });
  return Object.values(buckets)
    .sort((a, b) => a.date - b.date)
    .map((b) => ({
      name: b.date.toLocaleDateString("az-AZ", { month: "short", year: "2-digit" }),
      musteri: b.count,
    }));
}

function isSameMonth(dateStr, ref) {
  const d = new Date(dateStr);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";
}

// Deterministic accent colour per client so the list reads as a roster, not a stack of identical rows
const PALETTES = [
  { text: "text-emerald-400", bg: "from-emerald-400/20 to-emerald-600/20", border: "border-emerald-500/30", glow: "rgba(16,185,129,0.45)" },
  { text: "text-sky-400", bg: "from-sky-400/20 to-sky-600/20", border: "border-sky-500/30", glow: "rgba(56,189,248,0.45)" },
  { text: "text-amber-400", bg: "from-amber-400/20 to-amber-600/20", border: "border-amber-500/30", glow: "rgba(251,191,36,0.45)" },
  { text: "text-rose-400", bg: "from-rose-400/20 to-rose-600/20", border: "border-rose-500/30", glow: "rgba(251,113,133,0.45)" },
  { text: "text-violet-400", bg: "from-violet-400/20 to-violet-600/20", border: "border-violet-500/30", glow: "rgba(167,139,250,0.45)" },
  { text: "text-cyan-400", bg: "from-cyan-400/20 to-cyan-600/20", border: "border-cyan-500/30", glow: "rgba(34,211,238,0.45)" },
];
function paletteFor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}

function timeAgo(dateStr) {
  const diffSec = Math.max(0, (Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return "indicə";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} dəq əvvəl`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} saat əvvəl`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)} gün əvvəl`;
  return new Date(dateStr).toLocaleDateString("az-AZ", { day: "2-digit", month: "short" });
}

// Quick-add presets shown as chips in the client modal
const QUICK_FIELDS = [
  { label: "Hədəf", icon: Target },
  { label: "Başlanğıc çəki (kg)", icon: Scale },
  { label: "Doğum tarixi", icon: Cake },
];

function fieldIconFor(label = "") {
  const l = label.toLowerCase();
  if (/telefon|nömrə|phone/.test(l)) return Phone;
  if (/email|e-poçt|mail/.test(l)) return Mail;
  if (/hədəf|target|məqsəd/.test(l)) return Target;
  if (/çəki|weight|kg/.test(l)) return Scale;
  if (/doğum|tarix|date|yaş/.test(l)) return Cake;
  return Tag;
}

/* ----------------------------------------------------------------------
   Small reusable bits
---------------------------------------------------------------------- */

function Toast({ toast, onClose }) {
  const styles = {
    success: { icon: Check, ring: "border-emerald-500/40", text: "text-emerald-400", bg: "bg-emerald-500/10" },
    error: { icon: AlertCircle, ring: "border-red-500/40", text: "text-red-400", bg: "bg-red-500/10" },
    info: { icon: Info, ring: "border-sky-500/40", text: "text-sky-400", bg: "bg-sky-500/10" },
  }[toast.type || "info"];
  const Icon = styles.icon;
  return (
    <div
      role="status"
      className={`toast-in pointer-events-auto flex items-start gap-3 w-full sm:w-80 p-4 rounded-2xl border ${styles.ring} ${styles.bg} backdrop-blur-xl bg-zinc-950/90 shadow-2xl`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${styles.text}`} />
      <p className="text-sm text-zinc-200 leading-snug flex-1">{toast.message}</p>
      <button onClick={onClose} aria-label="Bağla" className="text-zinc-500 hover:text-zinc-200 shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

function ToastStack({ toasts, dismiss }) {
  return (
    <div className="fixed z-[100] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 flex flex-col gap-2 items-stretch sm:items-end pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

function StatCard({ label, value, icon: Icon, trend, accent = "emerald" }) {
  return (
    <div className="group relative p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgba(16,185,129,0.35)]">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-zinc-500 text-sm">{label}</p>
          <h3 className="text-3xl font-bold text-white mt-1 tabular-nums">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-${accent}-500/10 text-${accent}-400`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {trend != null && (
        <div className={`relative mt-3 inline-flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}% keçən aya nisbətən
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/40">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
        <Icon size={24} />
      </div>
      <h4 className="font-bold text-zinc-200">{title}</h4>
      <p className="text-zinc-500 text-sm mt-1 max-w-xs">{subtitle}</p>
      {action}
    </div>
  );
}

/* ----------------------------------------------------------------------
   Main component
---------------------------------------------------------------------- */

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Clients tab: search & sort
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | name

  // Client modal (create/edit)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [savingClient, setSavingClient] = useState(false);
  const [clientForm, setClientForm] = useState({ id: null, name: "", fields: [{ label: "", value: "" }] });
  const [clientFormError, setClientFormError] = useState("");
  const nameInputRef = useRef(null);

  // Client detail drawer
  const [activeClient, setActiveClient] = useState(null);
  const [drawerTab, setDrawerTab] = useState("info"); // info | qr | progress
  const [progressEntries, setProgressEntries] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressTableMissing, setProgressTableMissing] = useState(false);
  const [newProgress, setNewProgress] = useState({ weight: "", note: "" });
  const [copiedCode, setCopiedCode] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: "" });
  const [deleting, setDeleting] = useState(false);

  // Profile / settings tab
  const [profileForm, setProfileForm] = useState({ full_name: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null);

  // Clients tab: list vs grid
  const [clientView, setClientView] = useState("list"); // list | grid

  // Toasts
  const [toasts, setToasts] = useState([]);
  const pushToast = (type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  };
  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Escape key closes whatever overlay is open
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Escape") return;
      if (isClientModalOpen) setIsClientModalOpen(false);
      else if (activeClient) setActiveClient(null);
      else if (deleteConfirm.isOpen) setDeleteConfirm({ isOpen: false, id: null, name: "" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isClientModalOpen, activeClient, deleteConfirm.isOpen]);

  useEffect(() => {
    if (isClientModalOpen) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [isClientModalOpen]);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setAuthUser(user);

      const [{ data: prof, error: profErr }, { data: clientList, error: clientErr }] = await Promise.all([
        supabase.from("traineraz").select("*").eq("id", user.id).single(),
        supabase.from("clients").select("*").eq("trainer_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (profErr) throw profErr;
      if (clientErr) throw clientErr;

      setProfile(prof);
      setProfileForm({ full_name: prof?.full_name || "" });
      setClients(clientList || []);
      setChartData(buildChartData(clientList || []));
    } catch (err) {
      console.error(err);
      pushToast("error", "Məlumatlar yüklənərkən xəta baş verdi. Səhifəni yeniləyin.");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch {
      pushToast("error", "Çıxış zamanı xəta baş verdi.");
    }
  };

  /* ---------------- Client CRUD ---------------- */

  const openNewClient = () => {
    setClientForm({ id: null, name: "", fields: [{ label: "", value: "" }] });
    setClientFormError("");
    setIsClientModalOpen(true);
  };

  const openEditClient = (c) => {
    setClientForm({ id: c.id, name: c.full_name, fields: c.profile_data?.length ? c.profile_data : [{ label: "", value: "" }] });
    setClientFormError("");
    setIsClientModalOpen(true);
  };

  const addQuickField = (label) => {
    setClientForm((prev) => {
      const emptyIdx = prev.fields.findIndex((f) => !f.label && !f.value);
      if (emptyIdx !== -1) {
        const fields = [...prev.fields];
        fields[emptyIdx] = { ...fields[emptyIdx], label };
        return { ...prev, fields };
      }
      return { ...prev, fields: [...prev.fields, { label, value: "" }] };
    });
  };

  const saveClient = async () => {
    if (!clientForm.name.trim()) {
      setClientFormError("Ad Soyad boş ola bilməz.");
      return;
    }
    setSavingClient(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const cleanFields = clientForm.fields.filter((f) => f.label.trim() || f.value.trim());

      if (clientForm.id) {
        const { error } = await supabase
          .from("clients")
          .update({ full_name: clientForm.name.trim(), profile_data: cleanFields })
          .eq("id", clientForm.id);
        if (error) throw error;
        pushToast("success", `${clientForm.name.trim()} yeniləndi.`);
      } else {
        const accessCode = await getUniqueAccessCode();
        const { error } = await supabase
          .from("clients")
          .insert([{ trainer_id: user.id, full_name: clientForm.name.trim(), profile_data: cleanFields, access_code: accessCode }]);
        if (error) throw error;
        pushToast("success", `${clientForm.name.trim()} əlavə edildi.`);
      }
      setIsClientModalOpen(false);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      pushToast("error", "Yadda saxlanmadı. Yenidən cəhd edin.");
    } finally {
      setSavingClient(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from("clients").delete().eq("id", deleteConfirm.id);
      if (error) throw error;
      pushToast("success", `${deleteConfirm.name} silindi.`);
      if (activeClient?.id === deleteConfirm.id) setActiveClient(null);
      setDeleteConfirm({ isOpen: false, id: null, name: "" });
      fetchInitialData();
    } catch (err) {
      console.error(err);
      pushToast("error", "Silinmə zamanı xəta baş verdi.");
    } finally {
      setDeleting(false);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      pushToast("success", "Kod kopyalandı.");
      setTimeout(() => setCopiedCode(false), 1500);
    } catch {
      pushToast("error", "Kopyalama dəstəklənmir.");
    }
  };

  const shareCode = async (client) => {
    const text = `${client.full_name} üçün TRAINER.AZ giriş kodu: ${client.access_code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "TRAINER.AZ giriş kodu", text });
      } catch {
        /* user cancelled — no-op */
      }
    } else {
      copyCode(client.access_code);
    }
  };

  /* ---------------- Progress tracking ---------------- */

  const openClientDrawer = (client) => {
    setActiveClient(client);
    setDrawerTab("info");
    setProgressEntries([]);
    setProgressTableMissing(false);
  };

  useEffect(() => {
    if (activeClient && drawerTab === "progress") fetchProgress(activeClient.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClient, drawerTab]);

  async function fetchProgress(clientId) {
    setProgressLoading(true);
    try {
      const { data, error } = await supabase
        .from("client_progress")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setProgressEntries(data || []);
      setProgressTableMissing(false);
    } catch (err) {
      if (err.code === "42P01") {
        setProgressTableMissing(true);
      } else {
        console.error(err);
        pushToast("error", "Tərəqqi məlumatları yüklənmədi.");
      }
    } finally {
      setProgressLoading(false);
    }
  }

  async function addProgressEntry() {
    if (!newProgress.weight && !newProgress.note.trim()) return;
    try {
      const { error } = await supabase.from("client_progress").insert([
        {
          client_id: activeClient.id,
          weight: newProgress.weight ? Number(newProgress.weight) : null,
          note: newProgress.note.trim() || null,
        },
      ]);
      if (error) throw error;
      setNewProgress({ weight: "", note: "" });
      pushToast("success", "Qeyd əlavə olundu.");
      fetchProgress(activeClient.id);
    } catch (err) {
      if (err.code === "42P01") {
        setProgressTableMissing(true);
      } else {
        console.error(err);
        pushToast("error", "Qeyd əlavə edilmədi.");
      }
    }
  }

  /* ---------------- Trainer profile ---------------- */

  async function saveProfile() {
    if (!profileForm.full_name.trim()) {
      pushToast("error", "Ad Soyad boş ola bilməz.");
      return;
    }
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("traineraz")
        .update({ full_name: profileForm.full_name.trim() })
        .eq("id", authUser.id);
      if (error) throw error;
      pushToast("success", "Profil yeniləndi.");
      fetchInitialData();
    } catch (err) {
      console.error(err);
      pushToast("error", "Profil yenilənmədi.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      pushToast("error", "Yalnız şəkil faylı seçə bilərsən.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      pushToast("error", "Şəkil 4MB-dan kiçik olmalıdır.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${authUser.id}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadErr) throw uploadErr;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${pub.publicUrl}?t=${Date.now()}`;

      const { error: updateErr } = await supabase.from("traineraz").update({ avatar_url: publicUrl }).eq("id", authUser.id);
      if (updateErr) throw updateErr;

      setProfile((p) => ({ ...p, avatar_url: publicUrl }));
      pushToast("success", "Profil şəkli yeniləndi.");
    } catch (err) {
      console.error(err);
      if (err.message?.toLowerCase().includes("bucket not found")) {
        pushToast("error", "Şəkil üçün storage hazır deyil. Quraşdırma SQL faylına bax.");
      } else {
        pushToast("error", "Şəkil yüklənmədi. Yenidən cəhd et.");
      }
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  }

  /* ---------------- Derived data ---------------- */

  const now = new Date();
  const newThisMonth = clients.filter((c) => isSameMonth(c.created_at, now)).length;
  const growth =
    chartData.length >= 2
      ? Math.round(
          ((chartData[chartData.length - 1].musteri - chartData[chartData.length - 2].musteri) /
            Math.max(chartData[chartData.length - 2].musteri, 1)) *
            100
        )
      : null;

  const filteredClients = clients
    .filter((c) => c.full_name?.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.full_name.localeCompare(b.full_name, "az");
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-zinc-950 flex text-zinc-100">
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .skeleton {
          background: linear-gradient(90deg, rgba(39,39,42,0.6) 25%, rgba(63,63,70,0.6) 37%, rgba(39,39,42,0.6) 63%);
          background-size: 800px 100%;
          animation: shimmer 1.6s linear infinite;
        }
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .toast-in { animation: toastIn 0.25s ease-out; }
        @keyframes drawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .drawer-in { animation: drawerIn 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-in { animation: modalIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .card-in { animation: cardIn 0.3s ease-out backwards; }
        @keyframes neonPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        .neon-pulse { animation: neonPulse 1.8s ease-in-out infinite; }
        @keyframes chipPop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .chip-pop { animation: chipPop 0.18s ease-out; }
        @keyframes fieldIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .field-in { animation: fieldIn 0.18s ease-out; }
        .input-focus { transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease; }
        .input-focus:focus-within { box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
        @media (prefers-reduced-motion: reduce) {
          .skeleton, .toast-in, .drawer-in, .modal-in, .fade-in, .card-in, .neon-pulse, .chip-pop, .field-in { animation: none !important; }
        }
      `}</style>

      {(isSidebarOpen || activeClient) && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => { setIsSidebarOpen(false); setActiveClient(null); }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 w-64 h-full border-r border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-8">
          <div className="flex justify-between items-center font-bold text-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black shadow-[0_0_20px_-4px_rgba(16,185,129,0.6)]">
                T
              </div>
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                TRAINER.AZ
              </span>
            </div>
            <button className="md:hidden text-zinc-500" onClick={() => setIsSidebarOpen(false)} aria-label="Menyunu bağla">
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-2">
            {[
              { id: "dashboard", label: "Hesab", icon: LayoutDashboard },
              { id: "clients", label: "Müştərilər", icon: Users },
              { id: "profile", label: "Profil", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  activeTab === item.id
                    ? "bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.25)]"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <item.icon size={16} /> {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { setActiveTab("profile"); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/60 transition-colors"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                {initials(profile?.full_name)}
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="text-sm font-bold truncate">{profile?.full_name || "Antrenör"}</p>
              <p className="text-[11px] text-zinc-500 truncate">Profilə bax</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-500 hover:bg-red-950/20 rounded-xl transition-all border border-transparent hover:border-red-900/50"
          >
            <LogOut size={16} /> <span className="font-bold uppercase tracking-widest">Çıxış Et</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-5 sm:p-8 md:p-12 overflow-y-auto">
        <button
          className="md:hidden mb-6 p-2 bg-zinc-900 rounded-lg border border-zinc-800"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Menyunu aç"
        >
          <Menu />
        </button>

        {/* ----------------------------- DASHBOARD TAB ----------------------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 fade-in">
            <div>
              {loading ? (
                <SkeletonBlock className="h-9 w-72" />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Xoş gəldin, {profile?.full_name?.split(" ")[0] || "Antrenör"}! 👋
                </h1>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {loading ? (
                <>
                  <SkeletonBlock className="h-28" />
                  <SkeletonBlock className="h-28" />
                  <SkeletonBlock className="h-28" />
                </>
              ) : (
                <>
                  <StatCard label="Ümumi Müştərilər" value={clients.length} icon={Users} />
                  <StatCard label="Bu ay yeni" value={newThisMonth} icon={Sparkles} trend={growth} />
                  <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center gap-4">
                    <ShieldCheck className="text-emerald-500" size={32} />
                    <div>
                      <p className="text-emerald-500 font-bold">Sistem Aktivdir</p>
                      <p className="text-zinc-500 text-xs">Versiya 1.1.0</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-72 w-full bg-[#0B0E14] p-5 sm:p-6 rounded-3xl border border-[#1E222D] shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[#848E9C] font-bold uppercase tracking-widest text-xs">Müştəri axını analitikası</h3>
                <div className="flex gap-2 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-500 font-mono tracking-widest">LIVE DATA</span>
                </div>
              </div>

              {loading ? (
                <SkeletonBlock className="h-48 w-full" />
              ) : chartData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">
                  Hələ heç bir müştəri qeydiyyatı yoxdur.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E222D" vertical={false} />
                    <defs>
                      <linearGradient id="colorMusteri" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#373A46" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#373A46" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1E222D", border: "1px solid #373A46", borderRadius: "8px", fontSize: "12px" }}
                      labelStyle={{ color: "#848E9C" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="musteri"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorMusteri)"
                      activeDot={{ r: 6, fill: "#10b981", stroke: "#000", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------- CLIENTS TAB ----------------------------- */}
        {activeTab === "clients" && (
          <div className="max-w-3xl fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">Müştərilərim</h2>
              <button
                onClick={openNewClient}
                className="bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-emerald-400 hover:shadow-[0_0_24px_-6px_rgba(16,185,129,0.7)] active:scale-95"
              >
                <Plus size={16} /> Əlavə et
              </button>
            </div>

            {!loading && clients.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Müştəri axtar..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                  />
                </div>
                <div className="relative">
                  <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="newest">Ən yeni</option>
                    <option value="oldest">Ən köhnə</option>
                    <option value="name">Ada görə</option>
                  </select>
                </div>
                <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => setClientView("list")}
                    aria-label="Siyahı görünüşü"
                    aria-pressed={clientView === "list"}
                    className={`p-1.5 rounded-lg transition-colors ${clientView === "list" ? "bg-emerald-500/15 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setClientView("grid")}
                    aria-label="Şəbəkə görünüşü"
                    aria-pressed={clientView === "grid"}
                    className={`p-1.5 rounded-lg transition-colors ${clientView === "grid" ? "bg-emerald-500/15 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {loading ? (
                <>
                  <SkeletonBlock className="h-20" />
                  <SkeletonBlock className="h-20" />
                  <SkeletonBlock className="h-20" />
                </>
              ) : clients.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Hələ müştərin yoxdur"
                  subtitle="İlk müştərini əlavə et və onun üçün avtomatik giriş kodu yaradılsın."
                  action={
                    <button
                      onClick={openNewClient}
                      className="mt-5 bg-emerald-500 text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-400 transition-colors"
                    >
                      <Plus size={14} /> İlk müştərini əlavə et
                    </button>
                  }
                />
              ) : filteredClients.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Heç nə tapılmadı"
                  subtitle={`"${search}" üzrə uyğun müştəri yoxdur.`}
                />
              ) : (
                <div className={clientView === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-3"}>
                  {filteredClients.map((c, idx) => {
                    const palette = paletteFor(c.full_name || "");
                    const fieldCount = (c.profile_data || []).filter((f) => f.label || f.value).length;
                    const isNew = Date.now() - new Date(c.created_at).getTime() < 7 * 86400 * 1000;

                    if (clientView === "grid") {
                      return (
                        <div
                          key={c.id}
                          style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
                          className={`card-in group relative p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700`}
                          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 12px 32px -14px ${palette.glow}`)}
                          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                        >
                          {isNew && (
                            <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 neon-pulse" /> Yeni
                            </span>
                          )}
                          <button onClick={() => openClientDrawer(c)} className="flex flex-col items-center w-full">
                            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${palette.bg} border ${palette.border} ${palette.text} font-bold text-lg flex items-center justify-center mb-3`}>
                              {initials(c.full_name)}
                            </div>
                            <p className="font-bold text-sm truncate w-full">{c.full_name}</p>
                            <p className={`text-xs tracking-widest font-mono mt-0.5 ${palette.text}`}>{c.access_code}</p>
                            <div className="flex items-center gap-3 mt-3 text-[11px] text-zinc-500">
                              <span className="flex items-center gap-1"><Tag size={11} /> {fieldCount} sahə</span>
                              <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(c.created_at)}</span>
                            </div>
                          </button>
                          <div className="flex gap-1 mt-4 pt-4 border-t border-zinc-800 w-full justify-center">
                            <button onClick={() => openEditClient(c)} aria-label={`${c.full_name} redaktə et`} className="p-2 hover:bg-zinc-800 text-emerald-400 rounded-lg transition-colors"><Edit3 size={15} /></button>
                            <button onClick={() => copyCode(c.access_code)} aria-label={`${c.full_name} kodunu kopyala`} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"><Copy size={15} /></button>
                            <button onClick={() => setDeleteConfirm({ isOpen: true, id: c.id, name: c.full_name })} aria-label={`${c.full_name} sil`} className="p-2 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={c.id}
                        style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
                        className={`card-in group relative p-4 sm:p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900`}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 10px 28px -14px ${palette.glow}`)}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                      >
                        <button onClick={() => openClientDrawer(c)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${palette.bg} border ${palette.border} ${palette.text} font-bold text-sm flex items-center justify-center shrink-0`}>
                            {initials(c.full_name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm md:text-base truncate">{c.full_name}</p>
                              {isNew && (
                                <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                  <span className="w-1 h-1 rounded-full bg-emerald-400 neon-pulse" /> Yeni
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className={`text-xs tracking-widest font-mono ${palette.text}`}>{c.access_code}</p>
                              <span className="text-zinc-700">·</span>
                              <p className="text-[11px] text-zinc-500 flex items-center gap-1"><Clock size={10} /> {timeAgo(c.created_at)}</p>
                              {fieldCount > 0 && (
                                <span className="hidden sm:flex text-[11px] text-zinc-500 items-center gap-1">
                                  <span className="text-zinc-700">·</span><Tag size={10} /> {fieldCount} sahə
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => openEditClient(c)}
                            aria-label={`${c.full_name} redaktə et`}
                            className="p-2.5 hover:bg-zinc-800 text-emerald-400 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => copyCode(c.access_code)}
                            aria-label={`${c.full_name} kodunu kopyala`}
                            className="p-2.5 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ isOpen: true, id: c.id, name: c.full_name })}
                            aria-label={`${c.full_name} sil`}
                            className="p-2.5 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <ChevronRight size={16} className="self-center text-zinc-700 hidden sm:block ml-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------- PROFILE TAB ----------------------------- */}
        {activeTab === "profile" && (
          <div className="max-w-xl fade-in">
            <h2 className="text-2xl font-bold mb-6">Profil tənzimləmələri</h2>

            <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-5">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-4xl shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)]">
                    {avatarPreview || profile?.avatar_url ? (
                      <img src={avatarPreview || profile.avatar_url} alt="Profil şəkli" className="w-full h-full object-cover" />
                    ) : (
                      initials(profileForm.full_name)
                    )}
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    aria-label="Profil şəklini dəyişdir"
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg hover:bg-emerald-400 transition-colors disabled:opacity-60 border-4 border-zinc-900"
                  >
                    {avatarUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-lg truncate">{profileForm.full_name || "—"}</p>
                  <p className="text-zinc-500 text-xs flex items-center gap-1 mt-0.5 truncate">
                    <Mail size={12} className="shrink-0" /> {authUser?.email}
                  </p>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-emerald-400 text-xs font-bold mt-2 hover:text-emerald-300 transition-colors"
                  >
                    Şəkli dəyiş
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-medium block mb-1.5">Ad Soyad</label>
                <div className="input-focus relative bg-zinc-950 border border-zinc-800 rounded-xl focus-within:border-emerald-500/50">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ full_name: e.target.value })}
                    className="w-full bg-transparent pl-9 pr-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={saveProfile}
                disabled={savingProfile}
                className="w-full bg-emerald-500 text-black py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors disabled:opacity-60"
              >
                {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Yadda saxla
              </button>
            </div>

            <div className="mt-6 p-6 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl">
              <div className="flex items-center gap-2 text-zinc-400 font-bold text-sm mb-1">
                <ClipboardList size={16} className="text-emerald-500" /> Tezliklə
              </div>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Avtomatik sessiya xatırlatmaları və ödəniş/abunəlik izləmə bu bölmədə əlavə olunacaq. Bu hissə layihənin
                sonunda ayrıca müzakirə ediləcək.
              </p>
            </div>
          </div>
        )}
      </main>

      <ToastStack toasts={toasts} dismiss={dismissToast} />

      {/* ----------------------------- DELETE CONFIRM ----------------------------- */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="modal-in bg-zinc-900 border border-red-500/30 p-6 rounded-3xl w-full max-w-xs shadow-[0_0_30px_-10px_rgba(239,68,68,0.4)]">
            <h3 className="font-bold text-lg mb-1">Silmək istəyirsiniz?</h3>
            <p className="text-zinc-500 text-sm">
              <span className="text-zinc-300 font-medium">{deleteConfirm.name}</span> həmişəlik silinəcək. Bu əməliyyat geri qaytarıla bilməz.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, id: null, name: "" })}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-sm hover:bg-zinc-700 transition-colors"
              >
                Xeyr
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-black text-sm font-bold hover:bg-red-400 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : null} Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------- CREATE/EDIT MODAL ----------------------------- */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="modal-in bg-zinc-900 rounded-t-3xl sm:rounded-3xl w-full max-w-sm border border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="sm:hidden w-10 h-1 bg-zinc-700 rounded-full mx-auto mt-3" />

            <div className="relative px-6 pt-5 pb-5 overflow-hidden rounded-t-3xl sm:rounded-t-3xl bg-gradient-to-br from-emerald-500/15 via-zinc-900 to-zinc-900 border-b border-zinc-800">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    {clientForm.id ? <Edit3 size={18} /> : <UserPlus size={18} />}
                  </div>
                  <div>
                    <h3 className="font-bold">{clientForm.id ? "Redaktə et" : "Yeni Müştəri"}</h3>
                    <p className="text-zinc-500 text-xs">Məlumatları daxil et</p>
                  </div>
                </div>
                <button onClick={() => setIsClientModalOpen(false)} aria-label="Bağla" className="text-zinc-500 hover:text-zinc-200">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div
                className={`input-focus relative bg-zinc-950 rounded-xl mb-1 border ${
                  clientFormError ? "border-red-500/60" : "border-zinc-800 focus-within:border-emerald-500/50"
                }`}
              >
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  ref={nameInputRef}
                  placeholder="Ad Soyad"
                  className="w-full bg-transparent pl-9 pr-3 py-3 text-sm focus:outline-none"
                  value={clientForm.name}
                  onChange={(e) => { setClientForm({ ...clientForm, name: e.target.value }); if (clientFormError) setClientFormError(""); }}
                />
              </div>
              {clientFormError && (
                <p className="text-red-400 text-xs mb-3 flex items-center gap-1">
                  <AlertCircle size={12} /> {clientFormError}
                </p>
              )}
              <div className={clientFormError ? "mt-3" : "mt-4"} />

              <p className="text-[11px] text-zinc-500 font-medium mb-2">Tez sahələr</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {QUICK_FIELDS.map((qf) => (
                  <button
                    key={qf.label}
                    onClick={() => addQuickField(qf.label)}
                    className="chip-pop flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-400 hover:-translate-y-0.5 transition-all"
                  >
                    <qf.icon size={12} /> {qf.label}
                  </button>
                ))}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                {clientForm.fields.map((f, i) => {
                  const FieldIcon = fieldIconFor(f.label);
                  return (
                    <div key={i} className="field-in input-focus flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 rounded-xl p-2 group hover:border-emerald-500/30 focus-within:border-emerald-500/40 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 transition-colors shrink-0">
                        <FieldIcon size={13} />
                      </div>
                      <input
                        placeholder="Başlıq"
                        className="w-2/5 sm:w-1/3 bg-transparent text-xs focus:outline-none min-w-0"
                        value={f.label}
                        onChange={(e) => {
                          const fld = [...clientForm.fields];
                          fld[i].label = e.target.value;
                          setClientForm({ ...clientForm, fields: fld });
                        }}
                      />
                      <div className="w-px h-5 bg-zinc-800 shrink-0" />
                      <input
                        placeholder="Dəyər"
                        className="flex-1 bg-transparent text-xs focus:outline-none min-w-0"
                        value={f.value}
                        onChange={(e) => {
                          const fld = [...clientForm.fields];
                          fld[i].value = e.target.value;
                          setClientForm({ ...clientForm, fields: fld });
                        }}
                      />
                      <button
                        onClick={() => setClientForm({ ...clientForm, fields: clientForm.fields.filter((_, idx) => idx !== i) })}
                        aria-label="Sahəni sil"
                        className="text-zinc-600 hover:text-red-500 px-1 shrink-0 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setClientForm({ ...clientForm, fields: [...clientForm.fields, { label: "", value: "" }] })}
                className="text-emerald-400 text-xs font-bold mb-6 hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                <Plus size={12} /> Yeni sahə
              </button>
              <div className="flex gap-3">
                <button onClick={() => setIsClientModalOpen(false)} className="flex-1 py-2.5 bg-zinc-800 rounded-xl text-xs hover:bg-zinc-700 transition-colors">
                  Ləğv
                </button>
                <button
                  onClick={saveClient}
                  disabled={savingClient}
                  className="flex-1 py-2.5 bg-emerald-500 text-black rounded-xl font-bold text-xs hover:bg-emerald-400 hover:shadow-[0_0_24px_-6px_rgba(16,185,129,0.7)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {savingClient ? <Loader2 size={14} className="animate-spin" /> : null} Yadda Saxla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------- CLIENT DETAIL DRAWER ----------------------------- */}
      {activeClient && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] drawer-in">
          <div className="h-full bg-zinc-950 border-l border-zinc-800 flex flex-col">
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${paletteFor(activeClient.full_name).bg} border ${paletteFor(activeClient.full_name).border} ${paletteFor(activeClient.full_name).text} font-bold flex items-center justify-center shrink-0`}>
                  {initials(activeClient.full_name)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{activeClient.full_name}</p>
                  <p className="text-xs text-zinc-500 font-mono">{activeClient.access_code}</p>
                </div>
              </div>
              <button onClick={() => setActiveClient(null)} aria-label="Bağla" className="text-zinc-500 hover:text-zinc-200 shrink-0">
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-zinc-900 px-5 gap-1">
              {[
                { id: "info", label: "Məlumat", icon: Users },
                { id: "qr", label: "QR / Kod", icon: QrCode },
                { id: "progress", label: "Tərəqqi", icon: TrendingUp },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDrawerTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-xs font-bold border-b-2 transition-colors ${
                    drawerTab === t.id ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {drawerTab === "info" && (
                <div className="space-y-3 fade-in">
                  {(activeClient.profile_data || []).filter((f) => f.label || f.value).length === 0 ? (
                    <p className="text-zinc-500 text-sm">Əlavə məlumat sahəsi yoxdur.</p>
                  ) : (
                    activeClient.profile_data.map((f, i) => (
                      <div key={i} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                        <p className="text-zinc-500 text-[11px] uppercase tracking-wide">{f.label || "—"}</p>
                        <p className="text-sm mt-0.5">{f.value || "—"}</p>
                      </div>
                    ))
                  )}
                  <button
                    onClick={() => { openEditClient(activeClient); }}
                    className="w-full mt-2 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                  >
                    <Edit3 size={14} /> Redaktə et
                  </button>
                </div>
              )}

              {drawerTab === "qr" && (
                <div className="flex flex-col items-center text-center fade-in">
                  <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_-8px_rgba(16,185,129,0.4)]">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(activeClient.access_code)}`}
                      alt={`${activeClient.full_name} üçün QR kod`}
                      width={200}
                      height={200}
                    />
                  </div>
                  <p className="font-mono text-lg tracking-[0.3em] mt-5 text-emerald-400">{activeClient.access_code}</p>
                  <p className="text-zinc-500 text-xs mt-1">Müştəri bu kodla daxil olur</p>
                  <div className="flex gap-3 w-full mt-6">
                    <button
                      onClick={() => copyCode(activeClient.access_code)}
                      className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                    >
                      {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copiedCode ? "Kopyalandı" : "Kopyala"}
                    </button>
                    <button
                      onClick={() => shareCode(activeClient)}
                      className="flex-1 py-2.5 bg-emerald-500 text-black rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
                    >
                      <Share2 size={14} /> Paylaş
                    </button>
                  </div>
                </div>
              )}

              {drawerTab === "progress" && (
                <div className="fade-in">
                  {progressTableMissing ? (
                    <EmptyState
                      icon={Info}
                      title="Tərəqqi cədvəli hazır deyil"
                      subtitle={`Bu funksiya üçün verilənlər bazasında "client_progress" cədvəli yaradılmalıdır. Birgə təqdim olunan SQL faylına bax.`}
                    />
                  ) : progressLoading ? (
                    <div className="space-y-2">
                      <SkeletonBlock className="h-14" />
                      <SkeletonBlock className="h-14" />
                    </div>
                  ) : (
                    <>
                      {progressEntries.length === 0 ? (
                        <p className="text-zinc-500 text-sm mb-4">Hələ qeyd yoxdur. İlk ölçünü əlavə et.</p>
                      ) : (
                        <div className="h-40 mb-5 -ml-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={progressEntries.filter((p) => p.weight != null)} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1E222D" vertical={false} />
                              <XAxis
                                dataKey="created_at"
                                tickFormatter={(v) => new Date(v).toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit" })}
                                stroke="#373A46"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis stroke="#373A46" fontSize={10} tickLine={false} axisLine={false} width={28} />
                              <Tooltip
                                contentStyle={{ backgroundColor: "#1E222D", border: "1px solid #373A46", borderRadius: "8px", fontSize: "12px" }}
                                labelFormatter={(v) => new Date(v).toLocaleDateString("az-AZ")}
                              />
                              <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} fill="#10b98122" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      <div className="space-y-2 mb-5 max-h-40 overflow-y-auto">
                        {[...progressEntries].reverse().map((p) => (
                          <div key={p.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex justify-between items-center gap-3">
                            <div className="min-w-0">
                              {p.note && <p className="text-sm truncate">{p.note}</p>}
                              <p className="text-zinc-500 text-[11px]">{new Date(p.created_at).toLocaleDateString("az-AZ")}</p>
                            </div>
                            {p.weight != null && <span className="text-emerald-400 font-mono text-sm shrink-0">{p.weight} kg</span>}
                          </div>
                        ))}
                      </div>

                      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="number"
                            inputMode="decimal"
                            placeholder="Çəki (kg)"
                            value={newProgress.weight}
                            onChange={(e) => setNewProgress({ ...newProgress, weight: e.target.value })}
                            className="w-full sm:w-1/3 bg-zinc-950 p-2 rounded-lg text-xs border border-zinc-800 focus:outline-none focus:border-emerald-500/50 input-focus"
                          />
                          <input
                            placeholder="Qeyd (məs: yaxşı irəliləyiş)"
                            value={newProgress.note}
                            onChange={(e) => setNewProgress({ ...newProgress, note: e.target.value })}
                            className="flex-1 bg-zinc-950 p-2 rounded-lg text-xs border border-zinc-800 focus:outline-none focus:border-emerald-500/50 input-focus"
                          />
                        </div>
                        <button
                          onClick={addProgressEntry}
                          className="w-full py-2 bg-emerald-500 text-black rounded-lg text-xs font-bold hover:bg-emerald-400 transition-colors"
                        >
                          Qeyd əlavə et
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
