'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from '../login/login.module.css';

export function TotpSetupForm() {
  const { update } = useSession();
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
    // Calling update() with no argument issues a plain GET re-fetch of the
    // session, which does not carry an update trigger and so does not
    // re-run the jwt callback. Passing a body (even empty) makes next-auth
    // POST to /api/auth/session, which triggers `jwt({ trigger: 'update' })`
    // and refreshes the `totpEnabled` claim now that setup is confirmed.
    await update({});
    // Deliberately a full navigation instead of router.push(): in this
    // exact flow (immediately after an explicit session update()),
    // router.push() reliably fails to issue any navigation request at all,
    // leaving the user stuck on this page even though setup succeeded. A
    // hard navigation guarantees the middleware re-evaluates with the
    // freshly-issued session cookie from update() above.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/painel';
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
