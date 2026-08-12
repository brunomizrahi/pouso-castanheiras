import styles from './form.module.css';

export interface ReservationFormValues {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn?: string;
  checkOut?: string;
  packageId?: string;
  pax?: number;
  totalValue?: number;
  status?: string;
  notes?: string;
  transferStatus?: string;
  transferProvider?: string;
  transferScheduledAt?: string;
  transferNotes?: string;
}

export function ReservationForm({
  action,
  packages,
  initialValues,
}: {
  action: (formData: FormData) => void;
  packages: { id: string; name: string }[];
  initialValues?: ReservationFormValues;
}) {
  const v = initialValues ?? {};
  return (
    <form action={action} className={styles.form}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="guestName">Nome do hóspede</label>
          <input id="guestName" name="guestName" required defaultValue={v.guestName} />
        </div>
        <div className={styles.field}>
          <label htmlFor="guestPhone">Telefone</label>
          <input id="guestPhone" name="guestPhone" required defaultValue={v.guestPhone} />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="guestEmail">E-mail (opcional)</label>
        <input id="guestEmail" name="guestEmail" type="email" defaultValue={v.guestEmail} />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="checkIn">Check-in</label>
          <input id="checkIn" name="checkIn" type="date" required defaultValue={v.checkIn} />
        </div>
        <div className={styles.field}>
          <label htmlFor="checkOut">Check-out</label>
          <input id="checkOut" name="checkOut" type="date" required defaultValue={v.checkOut} />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="packageId">Pacote</label>
          <select id="packageId" name="packageId" required defaultValue={v.packageId}>
            <option value="" disabled>
              Selecione
            </option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="pax">Hóspedes</label>
          <input id="pax" name="pax" type="number" min={1} max={6} required defaultValue={v.pax ?? 4} />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="totalValue">Valor total (R$)</label>
          <input
            id="totalValue"
            name="totalValue"
            type="number"
            step="0.01"
            min={0}
            required
            defaultValue={v.totalValue}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="status">Status de pagamento</label>
          <select id="status" name="status" required defaultValue={v.status ?? 'aguardando_sinal'}>
            <option value="aguardando_sinal">Aguardando sinal</option>
            <option value="aguardando_pagamento">Aguardando pagamento</option>
            <option value="pago">Pago</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="notes">Observações</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={v.notes} />
      </div>

      <h2 className={styles.sectionTitle}>Traslado</h2>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="transferStatus">Status do traslado</label>
          <select id="transferStatus" name="transferStatus" required defaultValue={v.transferStatus ?? 'pendente'}>
            <option value="pendente">Pendente</option>
            <option value="organizado">Organizado</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="transferProvider">Fornecedor contratado</label>
          <input id="transferProvider" name="transferProvider" defaultValue={v.transferProvider} placeholder="Ex.: Táxi da cooperativa" />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="transferScheduledAt">Horário combinado</label>
        <input id="transferScheduledAt" name="transferScheduledAt" type="datetime-local" defaultValue={v.transferScheduledAt} />
      </div>

      <div className={styles.field}>
        <label htmlFor="transferNotes">Observações do traslado</label>
        <textarea id="transferNotes" name="transferNotes" rows={2} defaultValue={v.transferNotes} />
      </div>

      <button type="submit" className={styles.submit}>
        Salvar
      </button>
    </form>
  );
}
