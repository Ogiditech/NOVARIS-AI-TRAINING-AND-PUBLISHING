import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, LogIn, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import { Field, inputProps } from '../components/ui';
import { safeNext } from '../hooks/useRequireLogin';
import { isOffline } from '../lib/api';
import { loginSchema } from '../../shared/schemas.js';

function fieldErrorsFrom(result) {
  const errors = {};
  for (const issue of result.error.issues) if (!errors[issue.path[0]]) errors[issue.path[0]] = issue.message;
  return errors;
}

export default function Login() {
  const { t, toast } = useApp();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = `${t('auth.loginTitle')} · Novaris`; return () => { document.title = 'Novaris · AI Training & Publishing'; }; }, [t]);
  useEffect(() => { if (user && !busy) navigate(next, { replace: true }); }, [user, busy, navigate, next]);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined })); };

  const submit = async (e) => {
    e.preventDefault();
    const check = loginSchema.safeParse(form);
    if (!check.success) { setErrors(fieldErrorsFrom(check)); return; }
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      toast(t('auth.welcomeBack', { name: u.firstName }));
      navigate(next, { replace: true });
    } catch (err) {
      setErrors(err.fieldErrors || {});
      toast(isOffline(err) ? t('errors.dbBody') : err.message, 'error');
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <div className="glass p-6 sm:p-8">
        <p className="eyebrow">{t('auth.loginEyebrow')}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('auth.loginTitle')}</h1>
        <p className="mt-2 text-muted">{t('auth.loginSub')}</p>

        <form onSubmit={submit} noValidate className="mt-7 space-y-4">
          <Field id="login-email" label={t('auth.email')} error={errors.email}>
            <div className="relative">
              <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input {...inputProps('login-email', errors.email)} className={`${inputProps('login-email', errors.email).className} !pl-11`} type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            </div>
          </Field>
          <Field id="login-password" label={t('auth.password')} error={errors.password}>
            <PasswordInput id="login-password" value={form.password} onChange={set('password')} error={errors.password} />
          </Field>
          <button className="btn-primary w-full py-4 text-base" disabled={busy}>
            {busy ? <><Loader2 size={18} className="animate-spin" /> {t('auth.loggingIn')}</> : <><LogIn size={18} /> {t('auth.loginButton')}</>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {t('auth.noAccount')}{' '}
          <Link to={`/signup${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-violet-400 hover:text-violet-300">{t('auth.createAccount')}</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
