'use client';

import { useState, useTransition } from 'react';
import { calculateProvisioning, type ReservationForFinance } from '@/lib/finance';
import styles from './financeiro.module.css';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProvisioningPanel({ reservations }: { reservations: ReservationForFinance[] }) {
  const [mode, setMode] = useState<'month' | 'day'>('month');
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day, setDay] = useState(today.toISOString().slice(0, 10));
  const [, startTransition] = useTransition();

  const summary = calculateProvisioning(
    reservations,
    mode === 'month' ? { type: 'month', year, month } : { type: 'day', date: day }
  );

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Provisionamento</h2>
      <div className={styles.periodControls}>
        <select value={mode} onChange={(e) => startTransition(() => setMode(e.target.value as 'month' | 'day'))}>
          <option value="month">Por mês</option>
          <option value="day">Por dia específico</option>
        </select>
        {mode === 'month' ? (
          <>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: 80 }} />
          </>
        ) : (
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
        )}
      </div>
      <div className={styles.total}>{formatBRL(summary.total)}</div>
      <div className={styles.breakdown}>
        <span>Pago: {formatBRL(summary.byStatus.pago)}</span>
        <span>Aguardando sinal: {formatBRL(summary.byStatus.aguardando_sinal)}</span>
        <span>Aguardando pagamento: {formatBRL(summary.byStatus.aguardando_pagamento)}</span>
      </div>
    </div>
  );
}
