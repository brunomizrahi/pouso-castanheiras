'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Calendar } from '@/components/reserva/Calendar';
import { PackageStep } from '@/components/reserva/PackageStep';
import { TransferStep } from '@/components/reserva/TransferStep';
import { DetailsForm } from '@/components/reserva/DetailsForm';
import { SummaryAside } from '@/components/reserva/SummaryAside';
import { pickDay, buildMonth, type DateRange } from '@/lib/calendar';
import { season } from '@/lib/season';
import { quotePrice } from '@/lib/pricing';
import { buildWhatsAppMessage, buildWhatsAppLink } from '@/lib/whatsapp';
import { fromIso } from '@/lib/format';
import { PACKAGES } from '@/content/packages';
import type { TransferKey } from '@/content/transfers';
import type { Locale } from '@/lib/types';
import styles from './page.module.css';

// dc.html 1230-1400: the reservation form. 1231-1239 is a short hero (eyebrow + h1) above the
// two-column form; 1246 is the lead paragraph sitting above the calendar card in the left
// column. Everything else is wired straight from lib/calendar, lib/season, lib/pricing and
// lib/whatsapp — this page owns all the reservation state (dc.html's `this.state` /
// `reservaVals()`, lines 1834-1930) and passes the derived values down to the step components.
const LABELS = {
  eyebrow: { pt: 'Reserva', en: 'Booking' },
  title: { pt: 'Consulte suas datas', en: 'Check your dates' },
  intro: {
    pt: 'Escolha o período e o pacote. No final deixamos a mensagem pronta para você mandar no WhatsApp, e respondemos em poucas horas com a disponibilidade.',
    en: 'Choose your dates and your package. At the end we leave the message ready for you to send on WhatsApp, and we reply within a few hours with availability.',
  },
} as const satisfies Record<string, Record<Locale, string>>;

export default function ReservaPage() {
  const locale = useLocale() as Locale;
  const [range, setRange] = useState<DateRange>({ checkIn: null, checkOut: null });
  const [monthOffset, setMonthOffset] = useState(0);
  const [pkgSel, setPkgSel] = useState(2);
  const [transfer, setTransfer] = useState<TransferKey>('depois');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [pax, setPax] = useState('4');
  const [obs, setObs] = useState('');

  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + monthOffset);
  const next = new Date(base.getFullYear(), base.getMonth() + 1, 1);

  const nights =
    range.checkIn && range.checkOut
      ? Math.round((fromIso(range.checkOut).getTime() - fromIso(range.checkIn).getTime()) / 86400000)
      : 0;
  const currentSeason = range.checkIn ? season(range.checkIn) : null;
  const pkg = PACKAGES[pkgSel];
  const { price, note } = quotePrice({ packageIndex: pkgSel, season: currentSeason, nights, locale });

  const message = buildWhatsAppMessage({
    locale,
    checkIn: range.checkIn,
    checkOut: range.checkOut,
    nights,
    packageName: pkg.name[locale],
    packageMeta: pkg.meta[locale],
    season: currentSeason,
    price,
    guestName: nome,
    guestEmail: email,
    guestPhone: tel,
    pax,
    transfer,
    notes: obs,
  });
  const whatsappLink = buildWhatsAppLink(message);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <div className={styles.eyebrow}>{LABELS.eyebrow[locale]}</div>
            <h1 className={styles.title}>{LABELS.title[locale]}</h1>
          </div>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.split}>
          <div className={styles.left}>
            <p className={styles.intro}>{LABELS.intro[locale]}</p>

            <Calendar
              months={[buildMonth(base, range, locale), buildMonth(next, range, locale)]}
              onPrevMonth={() => setMonthOffset((o) => Math.max(0, o - 1))}
              onNextMonth={() => setMonthOffset((o) => o + 1)}
              onPickDay={(isoStr) => setRange((r) => pickDay(r, isoStr))}
            />
            <PackageStep selected={pkgSel} onSelect={setPkgSel} />
            <TransferStep selected={transfer} onSelect={setTransfer} />
            <DetailsForm
              nome={nome}
              email={email}
              tel={tel}
              pax={pax}
              obs={obs}
              onChangeNome={setNome}
              onChangeEmail={setEmail}
              onChangeTel={setTel}
              onChangePax={setPax}
              onChangeObs={setObs}
            />
          </div>

          <SummaryAside
            checkIn={range.checkIn}
            checkOut={range.checkOut}
            nights={nights}
            packageName={pkg.name[locale]}
            season={currentSeason}
            pax={pax}
            transfer={transfer}
            price={price}
            priceNote={note}
            message={message}
            whatsappLink={whatsappLink}
          />
        </div>
      </section>
    </>
  );
}
