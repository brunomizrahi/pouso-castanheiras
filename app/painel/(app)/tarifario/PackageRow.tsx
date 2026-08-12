import { updatePackage } from './actions';
import styles from './tarifario.module.css';

export interface PackageRowData {
  id: string;
  name: string;
  description: string;
  priceLow: number;
  priceHigh: number;
  priceSpecial: number | null;
  active: boolean;
}

export function PackageRow({ pkg }: { pkg: PackageRowData }) {
  const updateWithId = updatePackage.bind(null, pkg.id);

  return (
    <form action={updateWithId} className={styles.card}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`name-${pkg.id}`}>Nome</label>
          <input id={`name-${pkg.id}`} name="name" defaultValue={pkg.name} required />
        </div>
        <div className={styles.field}>
          <label>
            <input type="checkbox" name="active" defaultChecked={pkg.active} /> Ativo
          </label>
        </div>
      </div>
      <div className={styles.field} style={{ marginBottom: 12 }}>
        <label htmlFor={`description-${pkg.id}`}>Descrição</label>
        <textarea id={`description-${pkg.id}`} name="description" rows={2} defaultValue={pkg.description} />
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`priceLow-${pkg.id}`}>Baixa temporada (R$)</label>
          <input id={`priceLow-${pkg.id}`} name="priceLow" type="number" step="0.01" defaultValue={pkg.priceLow} required />
        </div>
        <div className={styles.field}>
          <label htmlFor={`priceHigh-${pkg.id}`}>Alta temporada (R$)</label>
          <input id={`priceHigh-${pkg.id}`} name="priceHigh" type="number" step="0.01" defaultValue={pkg.priceHigh} required />
        </div>
        <div className={styles.field}>
          <label htmlFor={`priceSpecial-${pkg.id}`}>Especial (R$, opcional)</label>
          <input id={`priceSpecial-${pkg.id}`} name="priceSpecial" type="number" step="0.01" defaultValue={pkg.priceSpecial ?? ''} />
        </div>
      </div>
      <button type="submit" className={styles.save}>
        Salvar
      </button>
    </form>
  );
}
