import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './OrganizeSteps.module.css';

// dc.html 915-948: dark rounded panel closing the page — label/title/body on the left,
// a 3-step numbered list (you book / we plan together / we arrange it) on the right.
const COPY = {
  label: { pt: 'Nós organizamos tudo', en: 'We organise everything' },
  title: { pt: 'Diga o seu voo, cuidamos do resto.', en: 'Tell us your flight, we handle the rest.' },
  body: {
    pt: 'O transfer é definido junto com a gente no momento da reserva. Você não vai precisar acertar nada sozinho com motoristas, barcos ou horários.',
    en: 'The transfer is decided together with us at the time of booking. You will not have to arrange anything with drivers, boats or timings on your own.',
  },
} as const satisfies Record<string, Record<Locale, string>>;

const STEPS: { n: string; title: Record<Locale, string>; desc: Record<Locale, string> }[] = [
  {
    n: '01',
    title: { pt: 'Você reserva', en: 'You book' },
    desc: {
      pt: 'A escolha do transfer não precisa ser feita agora. Reserve as datas primeiro.',
      en: 'You do not need to choose the transfer now. Book your dates first.',
    },
  },
  {
    n: '02',
    title: { pt: 'Combinamos juntos', en: 'We plan it together' },
    desc: {
      pt: 'Antes da viagem conversamos sobre táxi, van ou hidroavião e qual faz mais sentido para o seu grupo e horário de voo.',
      en: 'Before the trip we talk through taxi, van or seaplane, and which one suits your group and flight time.',
    },
  },
  {
    n: '03',
    title: { pt: 'Nós organizamos', en: 'We arrange it' },
    desc: {
      pt: 'Reservamos o motorista, ajustamos os horários e combinamos a travessia de barco com o caseiro. Você só precisa chegar.',
      en: 'We book the driver, set the times and arrange the boat crossing with our caretaker. All you have to do is arrive.',
    },
  },
];

export async function OrganizeSteps() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.panel}>
        <div className={styles.grid}>
          <div>
            <div className={styles.label}>{COPY.label[locale]}</div>
            <h2 className={styles.title}>{COPY.title[locale]}</h2>
            <p className={styles.body}>{COPY.body[locale]}</p>
          </div>
          <div>
            {STEPS.map((step) => (
              <div key={step.n} className={styles.step}>
                <span className={styles.number}>{step.n}</span>
                <span>
                  <span className={styles.stepTitle}>{step.title[locale]}</span>
                  <span className={styles.stepDesc}>{step.desc[locale]}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
