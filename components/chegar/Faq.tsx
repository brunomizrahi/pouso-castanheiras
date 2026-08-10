import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Faq.module.css';

// dc.html 891-913: sand-bg section, label + a 4-item auto-fit grid of Q/A pairs.
const LABEL = { pt: 'Perguntas frequentes', en: 'Frequently asked questions' } as const satisfies Record<Locale, string>;

const FAQS: { q: Record<Locale, string>; a: Record<Locale, string> }[] = [
  {
    q: { pt: 'Em que época do ano devo viajar?', en: 'What time of year should I travel?' },
    a: {
      pt: 'São dois ciclos marcantes: a cheia, de fevereiro a agosto, quando os igapós criam cenários de mistério e encanto; e a seca, de setembro a janeiro, quando praias de areia branca surgem nas margens do Rio Negro.',
      en: 'There are two striking cycles: the flood, from February to August, when the igapós create scenes of mystery and enchantment; and the dry season, from September to January, when white sand beaches emerge along the Rio Negro.',
    },
  },
  {
    q: { pt: 'Quantos dias ficar?', en: 'How many days should I stay?' },
    a: {
      pt: 'A estadia mínima é de três noites, com exceção do Pacote Pouso. Nossa sugestão é uma estadia de cinco noites, tempo suficiente para desconectar e realizar os passeios mais longos.',
      en: 'The minimum stay is three nights, except for the Pouso package. We suggest five nights, enough time to disconnect and take the longer excursions.',
    },
  },
  {
    q: { pt: 'Estarei sozinho no Pouso?', en: 'Will I be alone at the Pouso?' },
    a: {
      pt: 'Nosso caseiro reside na propriedade e estará sempre à disposição para auxiliar no que for necessário. A casa é de uso exclusivo do seu grupo.',
      en: 'Our caretaker lives on the property and is always on hand to help with whatever you need. The house is for your group’s exclusive use.',
    },
  },
  {
    q: { pt: 'A que distância estou da cidade?', en: 'How far am I from town?' },
    a: {
      pt: 'A travessia com nossa canoa leva, em média, 15 minutos. Em Novo Airão há táxis cooperados, farmácia, banco, hospital, entre outros serviços.',
      en: 'The crossing in our canoe takes about 15 minutes. Novo Airão has cooperative taxis, a pharmacy, bank, hospital and other services.',
    },
  },
];

export async function Faq() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.label}>{LABEL[locale]}</div>
        <div className={styles.grid}>
          {FAQS.map((faq) => (
            <div key={faq.q.en}>
              <h3 className={styles.question}>{faq.q[locale]}</h3>
              <p className={styles.answer}>{faq.a[locale]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
