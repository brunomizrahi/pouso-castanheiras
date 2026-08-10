import { Hero } from '@/components/home/Hero';
import { Manifesto } from '@/components/home/Manifesto';
import { Mosaic } from '@/components/home/Mosaic';
import { Gastronomia } from '@/components/home/Gastronomia';
import { Estacoes } from '@/components/home/Estacoes';
import { ExperienciasDestaque } from '@/components/home/ExperienciasDestaque';
import { Imprensa } from '@/components/home/Imprensa';
import { Depoimentos } from '@/components/home/Depoimentos';
import { ChamadaFinal } from '@/components/home/ChamadaFinal';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Mosaic />
      <Gastronomia />
      <Estacoes />
      <ExperienciasDestaque />
      <Imprensa />
      <Depoimentos />
      <ChamadaFinal />
    </>
  );
}
