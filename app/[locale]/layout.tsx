import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { Petrona, Jost } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '../globals.css';

const petrona = Petrona({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-petrona',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-jost',
});

export const metadata: Metadata = {
  title: 'Pouso das Castanheiras',
  description:
    'Pousada de uso exclusivo em 26 hectares de floresta às margens do Rio Negro, em Novo Airão (AM).',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale}>
      <body className={`${petrona.variable} ${jost.variable}`}>
        <NextIntlClientProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
