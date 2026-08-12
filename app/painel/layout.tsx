import type { Metadata } from 'next';
import '../globals.css';
import './painel.module.css';

export const metadata: Metadata = {
  title: 'Painel — Pouso das Castanheiras',
};

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
