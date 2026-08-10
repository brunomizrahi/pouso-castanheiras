'use client';

import { useState } from 'react';
import { Intro } from '@/components/experiencias/Intro';
import { ActivityGrid } from '@/components/experiencias/ActivityGrid';
import { ActivityDrawer } from '@/components/experiencias/ActivityDrawer';
import { CtaBanner } from '@/components/experiencias/CtaBanner';
import { ACTIVITIES } from '@/content/activities';

export default function ExperienciasPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Intro />
      <ActivityGrid onSelect={setOpenIndex} />
      <CtaBanner />
      <ActivityDrawer
        activity={openIndex !== null ? ACTIVITIES[openIndex] : null}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}
