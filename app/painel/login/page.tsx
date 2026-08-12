import { LoginForm } from './LoginForm';
import styles from './login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.wrap}>
      <LoginForm />
    </div>
  );
}
