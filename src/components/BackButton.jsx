import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; // İkon üçün

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(-1)} // Bu funksiya avtomatik istifadəçini bir addım geri atır
      className="fixed top-6 left-6 z-[100] flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800 text-zinc-400 rounded-xl hover:text-emerald-400 hover:border-emerald-500/50 transition-all backdrop-blur-md"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-xs font-bold uppercase tracking-widest">Geri</span>
    </button>
  );
}