import { TotpSetupForm } from './TotpSetupForm';
import styles from '../login/login.module.css';

export default function TotpSetupPage() {
  return (
    <div className={styles.wrap}>
      <TotpSetupForm />
    </div>
  );
}
