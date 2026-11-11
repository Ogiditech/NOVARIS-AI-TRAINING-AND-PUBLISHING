import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { inputProps } from './ui';

export default function PasswordInput({ id, value, onChange, error, autoComplete = 'current-password' }) {
  const { t } = useApp();
  const [show, setShow] = useState(false);
  const props = inputProps(id, error);
  return (
    <div className="relative">
      <input {...props} className={`${props.className} !pr-12`} type={show ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-muted hover:text-ink" aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')} aria-pressed={show}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

// 0–4 score from length and character variety.
export function passwordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  else if (/\d/.test(pw) && score < 2) score++;
  return Math.min(4, score);
}

export function StrengthMeter({ password }) {
  const { t } = useApp();
  const score = passwordStrength(password);
  const colors = ['bg-line/20', 'bg-rose-500', 'bg-amber-400', 'bg-blue-500', 'bg-emerald-500'];
  const labels = t('auth.strength');
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${score >= i ? colors[score] : 'bg-line/15'}`} />)}
      </div>
      {password && <p className="mt-1.5 text-xs text-muted">{t('auth.strengthLabel')}: <span className="font-semibold text-ink">{labels[score]}</span></p>}
    </div>
  );
}
