import { prisma } from '@/lib/prisma';
import { PackageRow } from './PackageRow';
import styles from './tarifario.module.css';

export default async function TarifarioPage() {
  const packages = await prisma.package.findMany({ orderBy: { name: 'asc' } });

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-petrona), serif', fontSize: 24, marginBottom: 20 }}>
        Tarifário
      </h1>
      <div className={styles.list}>
        {packages.map((pkg) => (
          <PackageRow
            key={pkg.id}
            pkg={{
              id: pkg.id,
              name: pkg.name,
              description: pkg.description,
              priceLow: Number(pkg.priceLow),
              priceHigh: Number(pkg.priceHigh),
              priceSpecial: pkg.priceSpecial ? Number(pkg.priceSpecial) : null,
              active: pkg.active,
            }}
          />
        ))}
      </div>
    </div>
  );
}
