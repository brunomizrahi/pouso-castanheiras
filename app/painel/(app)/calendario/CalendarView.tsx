'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buildPanelMonth, type PanelReservation } from '@/lib/panelCalendar';
import styles from './calendar.module.css';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const STATUS_CLASS: Record<string, string> = {
  pago: styles.dayPago,
  aguardando_sinal: styles.dayAguardandoSinal,
  aguardando_pagamento: styles.dayAguardandoPagamento,
};

export function CalendarView({ reservations }: { reservations: PanelReservation[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + monthOffset);
  const month = buildPanelMonth(base, reservations);

  return (
    <div>
      <div className={styles.nav}>
        <button type="button" className={styles.navButton} onClick={() => setMonthOffset((o) => o - 1)}>
          ‹
        </button>
        <div className={styles.monthLabel}>{month.label}</div>
        <button type="button" className={styles.navButton} onClick={() => setMonthOffset((o) => o + 1)}>
          ›
        </button>
      </div>
      <div className={styles.grid}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} className={styles.weekday}>
            {w}
          </div>
        ))}
        {month.days.map((d, i) =>
          d.iso === null ? (
            <div key={i} className={`${styles.day} ${styles.dayEmpty}`} />
          ) : (
            <div
              key={i}
              className={`${styles.day} ${d.reservation ? STATUS_CLASS[d.reservation.status] : ''}`}
            >
              <div>{d.day}</div>
              {d.reservation && (
                <Link href={`/painel/reservas/${d.reservation.id}`} style={{ fontSize: 11 }}>
                  ver reserva
                </Link>
              )}
            </div>
          )
        )}
      </div>
      <div className={styles.legend}>
        <span><span className={styles.legendSwatch} style={{ background: '#2f6d4f' }} />Pago</span>
        <span><span className={styles.legendSwatch} style={{ background: '#e0a53a' }} />Aguardando sinal</span>
        <span><span className={styles.legendSwatch} style={{ background: '#c0392b' }} />Aguardando pagamento</span>
        <span><span className={styles.legendSwatch} style={{ border: '1px solid #ddd' }} />Disponível</span>
      </div>
    </div>
  );
}
