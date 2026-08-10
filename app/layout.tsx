import type { Metadata } from 'next';
import { Petrona, Jost } from 'next/font/google';
import './globals.css';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={`${petrona.variable} ${jost.variable}`}>{children}</body>
    </html>
  );
}
