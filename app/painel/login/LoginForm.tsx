'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<'password' | 'totp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      totpCode: step === 'totp' ? totpCode : undefined,
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error === 'TOTP_REQUIRED') {
      setStep('totp');
      return;
    }
    if (result?.error === 'TOTP_INVALID') {
      setError('Código incorreto. Tente novamente.');
      return;
    }
    if (result?.error === 'RATE_LIMITED') {
      setError('Muitas tentativas. Aguarde 15 minutos e tente de novo.');
      return;
    }
    if (result?.error) {
      setError('E-mail ou senha incorretos.');
      return;
    }
    router.push('/painel');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <h1 className={styles.title}>Painel — Pouso das Castanheiras</h1>
      {error && <div className={styles.error}>{error}</div>}

      {step === 'password' && (
        <>
          <div className={styles.field}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </>
      )}

      {step === 'totp' && (
        <div className={styles.field}>
          <label htmlFor="totpCode">Código do app autenticador</label>
          <input
            id="totpCode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            autoFocus
          />
        </div>
      )}

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? 'Entrando…' : step === 'password' ? 'Continuar' : 'Entrar'}
      </button>
    </form>
  );
}
