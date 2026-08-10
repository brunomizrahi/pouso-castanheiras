import { Hero } from '@/components/casa/Hero';
import { Intro } from '@/components/casa/Intro';
import { HouseMosaic } from '@/components/casa/HouseMosaic';
import { Amenities } from '@/components/casa/Amenities';
import { Team } from '@/components/casa/Team';

export default function CasaPage() {
  return (
    <>
      <Hero />
      <Intro />
      <HouseMosaic />
      <Amenities />
      <Team />
    </>
  );
}
