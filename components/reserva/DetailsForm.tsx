'use client';

import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/types';
import styles from './DetailsForm.module.css';

// dc.html 1330-1360: label + 5 controlled fields (nome, email, tel, pax select, obs textarea)
// in a two-column auto-fit grid, obs spanning both columns. The pax <select> in dc.html only
// offers 2-6 guests (no "1 hóspede" option) — reproduced as-is since dc.html is the markup
// source of truth for this field.
const LABELS = {
  step: { pt: '04 · Seus dados', en: '04 · Your details' },
  nome: { pt: 'Nome completo', en: 'Full name' },
  nomePh: { pt: 'Como podemos chamá-lo', en: 'How should we call you' },
  email: { pt: 'E-mail', en: 'E-mail' },
  emailPh: { pt: 'seu@email.com', en: 'you@email.com' },
  tel: { pt: 'Telefone', en: 'Phone' },
  telPh: { pt: '(00) 00000-0000', en: '+00 000 000 0000' },
  pax: { pt: 'Número de hóspedes', en: 'Number of guests' },
  obs: { pt: 'Observações', en: 'Notes' },
  obsOptional: { pt: '(opcional)', en: '(optional)' },
  obsPh: {
    pt: 'Restrições alimentares, crianças, preferência de transfer, interesse no hidroavião...',
    en: 'Dietary restrictions, children, transfer preference, interest in the seaplane…',
  },
} as const satisfies Record<string, Record<Locale, string>>;

const PAX_OPTIONS = ['2', '3', '4', '5', '6'];

interface DetailsFormProps {
  nome: string;
  email: string;
  tel: string;
  pax: string;
  obs: string;
  onChangeNome: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangeTel: (value: string) => void;
  onChangePax: (value: string) => void;
  onChangeObs: (value: string) => void;
}

export function DetailsForm({
  nome,
  email,
  tel,
  pax,
  obs,
  onChangeNome,
  onChangeEmail,
  onChangeTel,
  onChangePax,
  onChangeObs,
}: DetailsFormProps) {
  const locale = useLocale() as Locale;

  return (
    <div className={styles.card}>
      <div className={styles.label}>{LABELS.step[locale]}</div>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{LABELS.nome[locale]}</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => onChangeNome(e.target.value)}
            placeholder={LABELS.nomePh[locale]}
            className={styles.input}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{LABELS.email[locale]}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            placeholder={LABELS.emailPh[locale]}
            className={styles.input}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{LABELS.tel[locale]}</span>
          <input
            type="tel"
            value={tel}
            onChange={(e) => onChangeTel(e.target.value)}
            placeholder={LABELS.telPh[locale]}
            className={styles.input}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{LABELS.pax[locale]}</span>
          <select value={pax} onChange={(e) => onChangePax(e.target.value)} className={styles.select}>
            {PAX_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {locale === 'en' ? `${n} guests` : `${n} hóspedes`}
              </option>
            ))}
          </select>
        </label>
        <label className={`${styles.field} ${styles.full}`}>
          <span className={styles.fieldLabel}>
            <span>{LABELS.obs[locale]}</span> <span className={styles.optional}>{LABELS.obsOptional[locale]}</span>
          </span>
          <textarea
            value={obs}
            onChange={(e) => onChangeObs(e.target.value)}
            rows={2}
            placeholder={LABELS.obsPh[locale]}
            className={styles.textarea}
          />
        </label>
      </div>
    </div>
  );
}
