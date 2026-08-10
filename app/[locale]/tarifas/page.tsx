'use client';

import { useState } from 'react';
import { Intro } from '@/components/tarifas/Intro';
import { ViewToggle, type TarifasView } from '@/components/tarifas/ViewToggle';
import { TableView } from '@/components/tarifas/TableView';
import { CardsView } from '@/components/tarifas/CardsView';
import { RoteiroView } from '@/components/tarifas/RoteiroView';
import { PackageModal } from '@/components/tarifas/PackageModal';
import { IncludedNotIncluded } from '@/components/tarifas/IncludedNotIncluded';
import { Policy } from '@/components/tarifas/Policy';

export default function TarifasPage() {
  const [view, setView] = useState<TarifasView>('tabela');
  const [openPackage, setOpenPackage] = useState<number | null>(null);

  return (
    <>
      <Intro />
      <ViewToggle view={view} onChange={setView} />
      {view === 'tabela' && <TableView />}
      {view === 'cards' && <CardsView onSelect={setOpenPackage} />}
      {view === 'roteiro' && <RoteiroView />}
      <IncludedNotIncluded />
      <Policy />
      <PackageModal packageIndex={openPackage} onClose={() => setOpenPackage(null)} />
    </>
  );
}
