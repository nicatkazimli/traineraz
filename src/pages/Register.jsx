import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  UserPlus, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2,
  Check, Pencil, ChevronDown, ShieldCheck, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../components/BackButton';

const SPECIALTIES = [
  'Bodibildinq / Fitnes',
  'Krossfit / Ağır Atletika',
  'Kardio / Arıqlama',
  'Digər',
];

const EXPERIENCE_OPTIONS = [
  { value: '1-3 il', label: '1-3 il' },
  { value: '3-5 il', label: '3-5 il' },
  { value: '5-10 il', label: '5-10 il' },
  { value: '10+ il', label: '10+ il' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sadə, asanlaşdırılmış şifrə güc qiymətləndirməsi
function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: '', color: 'bg-zinc-800' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: 'Zəif', color: 'bg-red-500' };
  if (score <= 2) return { level: 2, label: 'Orta', color: 'bg-amber-500' };
  if (score <= 4) return { level: 3, label: 'Güclü', color: 'bg-emerald-500' };
  return { level: 4, label: 'Çox Güclü', color: 'bg-emerald-400' };
}

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isOther, setIsOther] = useState(false);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(SPECIALTIES[0]);
  const [isLocked, setIsLocked] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    experience: '1-3 il',
  });

  const strength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  const emailValid = formData.email.length === 0 || EMAIL_REGEX.test(formData.email);
  const passwordsMatch = formData.confirmPassword.length === 0 || formData.password === formData.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'specialty') {
      if (value === 'Digər') {
        setIsOther(true);
      } else {
        setSelectedSpecialty(value);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const confirmCustomSpecialty = () => {
    if (customSpecialty.trim()) {
      setSelectedSpecialty(customSpecialty.trim());
      setIsOther(false);
      setIsLocked(true);
    }
  };

  const handleCustomSpecialtyKeyDown = (e) => {
    // Enter düymə forması submit etməsin — yalnız ixtisası təsdiqləsin
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmCustomSpecialty();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!EMAIL_REGEX.test(formData.email)) {
      setErrorMsg('Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Şifrə minimum 6 simvoldan ibarət olmalıdır.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Şifrələr uyğun gəlmir.');
      return;
    }
    if (isOther && !selectedSpecialty) {
      setErrorMsg('Zəhmət olmasa ixtisasınızı təsdiqləyin.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Davam etmək üçün istifadə şərtlərini qəbul etməlisiniz.');
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        const { error: dbError } = await supabase
          .from('traineraz')
          .insert([{
            id: authData.user.id,
            full_name: formData.fullName,
            specialty: selectedSpecialty,
            experience: formData.experience,
            rating: '5.0',
            image_url: '',
          }]);

        if (dbError) throw dbError;

        setShowSuccess(true);
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Qeydiyyat zamanı xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full bg-zinc-950 border rounded-xl text-sm outline-none transition-colors duration-300 placeholder:text-zinc-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <BackButton />

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="bg-zinc-900 border border-emerald-500/30 p-8 rounded-3xl text-center w-full max-w-xs shadow-[0_0_50px_rgba(16,185,129,0.25)]"
            >
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Qeydiyyat Uğurludur!</h3>
              <p className="text-zinc-400 text-sm">İndi sistemə keçid edilir...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient glow — mobil üçün kiçildilib, performans dostu CSS animasiya */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] bg-emerald-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none animate-pulse-glow" />

      <div className="register-card w-full max-w-lg bg-zinc-900/40 border border-zinc-900 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
        <div className="text-center mb-7 sm:mb-8">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-black text-xl mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-4">
            T
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Hesabını Yarat</h2>
          <p className="text-zinc-500 text-xs mt-2">Bir neçə addımda məşqçi profilini aktivləşdir</p>
        </div>

        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="uppercase tracking-wider">{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleRegister} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Ad və Soyad
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="fullName"
                type="text"
                name="fullName"
                required
                autoComplete="name"
                disabled={loading}
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Məs: Nicat Kazımlı"
                className={`${inputBase} pl-12 pr-4 py-3 border-zinc-800/80 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              E-poçt Ünvanı
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                disabled={loading}
                value={formData.email}
                onChange={handleChange}
                placeholder="example@trainer.az"
                aria-invalid={!emailValid}
                className={`${inputBase} pl-12 pr-10 py-3 ${
                  emailValid ? 'border-zinc-800/80 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]' : 'border-red-500/60 focus:border-red-500'
                }`}
              />
              {formData.email.length > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                  {emailValid ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </span>
              )}
            </div>
            {!emailValid && (
              <p className="text-[11px] text-red-400 pt-0.5">Düzgün e-poçt formatı daxil edin.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">İxtisas</label>
              {isOther ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Yaz..."
                    className="w-full bg-zinc-950 border border-emerald-500 rounded-xl px-3 sm:px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
                    value={customSpecialty}
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    onKeyDown={handleCustomSpecialtyKeyDown}
                    required
                  />
                  <button
                    type="button"
                    onClick={confirmCustomSpecialty}
                    aria-label="İxtisası təsdiqlə"
                    className="bg-emerald-500 hover:bg-emerald-600 p-3 rounded-xl text-zinc-950 shrink-0 transition-colors active:scale-95"
                  >
                    <Check size={18} />
                  </button>
                </div>
              ) : isLocked ? (
                <div className="flex items-center justify-between gap-2 bg-zinc-950 border border-emerald-500/50 rounded-xl px-3 sm:px-4 py-3 text-sm text-white">
                  <span className="truncate">{selectedSpecialty}</span>
                  <button
                    type="button"
                    onClick={() => { setIsLocked(false); setIsOther(true); }}
                    aria-label="İxtisası dəyiş"
                    className="shrink-0"
                  >
                    <Pencil size={14} className="text-emerald-500" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select
                    name="specialty"
                    value={selectedSpecialty}
                    onChange={handleChange}
                    disabled={loading}
                    className={`${inputBase} px-3 sm:px-4 pr-8 py-3 border-zinc-800/80 focus:border-emerald-500 appearance-none cursor-pointer text-zinc-300`}
                  >
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="experience" className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Təcrübə
              </label>
              <div className="relative">
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  disabled={loading}
                  className={`${inputBase} px-3 sm:px-4 pr-8 py-3 border-zinc-800/80 focus:border-emerald-500 appearance-none cursor-pointer text-zinc-300`}
                >
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Şifrə
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
                disabled={loading}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`${inputBase} pl-12 pr-12 py-3 border-zinc-800/80 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)] tracking-widest`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {formData.password.length > 0 && (
              <div className="pt-1.5">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        i <= strength.level ? strength.color : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-[11px] pt-1 font-medium ${
                  strength.level <= 1 ? 'text-red-400' : strength.level === 2 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  Şifrə gücü: {strength.label}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Şifrəni Təsdiqlə
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                autoComplete="new-password"
                disabled={loading}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                aria-invalid={!passwordsMatch}
                className={`${inputBase} pl-12 pr-12 py-3 tracking-widest ${
                  passwordsMatch ? 'border-zinc-800/80 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]' : 'border-red-500/60 focus:border-red-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!passwordsMatch && (
              <p className="text-[11px] text-red-400 pt-0.5">Şifrələr uyğun gəlmir.</p>
            )}
          </div>

          <label className="flex items-start gap-2.5 pt-1 cursor-pointer group select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="peer sr-only"
            />
            <span className="mt-0.5 w-4 h-4 shrink-0 rounded-md border border-zinc-700 bg-zinc-950 flex items-center justify-center transition-colors peer-checked:bg-emerald-500 peer-checked:border-emerald-500 group-hover:border-zinc-600">
              {agreeTerms && <Check className="w-3 h-3 text-zinc-950" strokeWidth={3.5} />}
            </span>
            <span className="text-xs text-zinc-500 leading-relaxed">
              <span className="text-zinc-400">İstifadə şərtləri</span> və{' '}
              <span className="text-zinc-400">məxfilik siyasəti</span> ilə razıyam.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="submit-btn relative w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:hover:bg-emerald-500 text-zinc-950 font-black text-sm px-5 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.99] mt-2 disabled:opacity-70 disabled:cursor-not-allowed touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Qeydiyyat aparılır...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Qeydiyyatı Tamamla
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-500 font-medium">
            Artıq hesabın var?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 transition-colors">
              Giriş et
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.08); }
        }
        .animate-pulse-glow { animation: pulseGlow 6s ease-in-out infinite; }

        .register-card {
          position: relative;
        }
        .register-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 1.5rem;
          padding: 1px;
          background: linear-gradient(135deg, rgba(16,185,129,0.5), rgba(16,185,129,0) 30%, rgba(16,185,129,0) 70%, rgba(16,185,129,0.4));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0.7;
        }

        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          box-shadow: 0 0 0 rgba(16,185,129,0);
          transition: box-shadow 0.4s ease;
          pointer-events: none;
        }
        .submit-btn:hover:not(:disabled)::after {
          box-shadow: 0 0 28px rgba(16,185,129,0.45);
        }

        select option {
          background-color: #09090b;
          color: #e4e4e7;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-glow { animation: none; }
        }
      `}</style>
    </div>
  );
}
