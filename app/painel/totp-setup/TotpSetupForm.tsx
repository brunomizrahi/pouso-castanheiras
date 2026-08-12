'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../login/login.module.css';

export function TotpSetupForm() {
  const router = useRouter();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/painel/totp-setup/start', { method: 'POST' })
      .then((r) => r.json())
      .then((data) => setQrCodeDataUrl(data.qrCodeDataUrl));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch('/api/painel/totp-setup/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    setSubmitting(false);

    if (!response.ok) {
      setError('Código incorreto. Confira o app autenticador e tente de novo.');
      return;
    }
    router.push('/painel');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <h1 className={styles.title}>Configure a verificação em duas etapas</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
        Escaneie o código abaixo com o Google Authenticator, Authy ou app similar, depois digite o
        código de 6 dígitos gerado.
      </p>
      {qrCodeDataUrl && (
        <img src={qrCodeDataUrl} alt="QR code para configurar o autenticador" style={{ display: 'block', margin: '0 auto 20px' }} />
      )}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.field}>
        <label htmlFor="code">Código de 6 dígitos</label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <button type="submit" className={styles.submit} disabled={submitting || !qrCodeDataUrl}>
        {submitting ? 'Confirmando…' : 'Confirmar'}
      </button>
    </form>
  );
}
