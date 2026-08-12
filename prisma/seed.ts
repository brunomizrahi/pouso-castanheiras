import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

const PACKAGES = [
  {
    slug: 'rio-negro',
    name: 'Rio Negro',
    description: 'Três noites com as atividades da propriedade e as duas saídas de lancha mais marcantes da região.',
    nights: 3,
    priceLow: 21400,
    priceHigh: 24900,
    priceSpecial: null,
  },
  {
    slug: 'macucus',
    name: 'Macucus',
    description: 'Quatro noites, acrescentando a imersão cultural em Novo Airão.',
    nights: 4,
    priceLow: 29000,
    priceHigh: 33800,
    priceSpecial: 39000,
  },
  {
    slug: 'ajuricaba',
    name: 'Ajuricaba',
    description: 'Cinco noites, nossa sugestão — inclui o passeio mais longo do roteiro: as Grutas do Madadá.',
    nights: 5,
    priceLow: 37500,
    priceHigh: 43400,
    priceSpecial: 49900,
  },
  {
    slug: 'pouso',
    name: 'Pouso',
    description: 'O lugar perfeito para quem já conhece a Amazônia. Usufrua das atividades de mata e rio da propriedade.',
    nights: null,
    priceLow: 6000,
    priceHigh: 7400,
    priceSpecial: 8500,
  },
];

const GUEST_NAMES = [
  'Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Alves', 'Elisa Ferreira',
  'Felipe Rocha', 'Gabriela Nunes', 'Henrique Dias', 'Isabela Castro', 'João Pedro Martins',
  'Larissa Ramos', 'Marcelo Teixeira', 'Nathalia Pires', 'Otávio Barros', 'Patrícia Gomes',
];

function isoDate(daysFromToday: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  return d;
}

async function main() {
  console.log('Seeding packages...');
  const createdPackages = [];
  for (const pkg of PACKAGES) {
    const created = await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: pkg,
    });
    createdPackages.push(created);
  }

  console.log('Seeding staff user...');
  const seedPassword = process.env.SEED_STAFF_PASSWORD;
  if (!seedPassword) {
    throw new Error('Set SEED_STAFF_PASSWORD before running the seed, e.g. SEED_STAFF_PASSWORD=... npm run db:seed');
  }
  await prisma.staffUser.upsert({
    where: { email: 'equipe@pousodascastanheiras.com.br' },
    update: {},
    create: {
      email: 'equipe@pousodascastanheiras.com.br',
      passwordHash: await hashPassword(seedPassword),
    },
  });

  console.log('Seeding reservations...');
  await prisma.reservation.deleteMany({});

  const statuses = ['pago', 'aguardando_pagamento', 'aguardando_sinal'] as const;
  const transferStatuses = ['organizado', 'pendente'] as const;

  for (let i = 0; i < 18; i++) {
    const checkIn = isoDate(-30 + i * 6);
    const nights = 3 + (i % 3);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);
    const pkg = createdPackages[i % createdPackages.length];
    const status = statuses[i % statuses.length];
    const transferStatus = transferStatuses[i % transferStatuses.length];

    await prisma.reservation.create({
      data: {
        source: i % 4 === 0 ? 'manual' : 'site',
        status,
        checkIn,
        checkOut,
        guestName: GUEST_NAMES[i % GUEST_NAMES.length],
        guestEmail: `hospede${i}@example.com`,
        guestPhone: `1199${String(9000000 + i).padStart(7, '0')}`,
        packageId: pkg.id,
        pax: 2 + (i % 5),
        totalValue: Number(pkg.priceLow) + i * 100,
        transferStatus,
        transferProvider: transferStatus === 'organizado' ? 'Táxi da cooperativa' : null,
        transferScheduledAt: transferStatus === 'organizado' ? checkIn : null,
        transferNotes: transferStatus === 'pendente' ? 'Aguardando confirmação do hóspede sobre o horário do voo.' : null,
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
