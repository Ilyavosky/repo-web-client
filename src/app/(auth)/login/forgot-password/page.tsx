'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FormField from '@/components/forms/FormField';
import ErrorMessage from '@/components/forms/ErrorMessage';
import styles from '../page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('El correo es obligatorio'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.logo}>GLAMSTOCK</h1>
      <div className={styles.card}>
        <div className={styles.formSection}>
          <h1 className={styles.title}>Recuperar contraseña</h1>

          {sent ? (
            <>
              <p className={styles.subtitle}>
                Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
              <Link href="/login" className={styles.new}>
                Volver al inicio de sesión
              </Link>
            </>
          ) : (
            <>
              <p className={styles.subtitle}>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              {error && <ErrorMessage message={error} />}
              <form onSubmit={handleSubmit}>
                <FormField
                  label="Email:"
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  error=""
                />
                <button type="submit" disabled={isLoading} className={styles.submitButton}>
                  {isLoading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>
              <Link href="/login" className={styles.new} style={{ marginTop: '12px', display: 'block', textAlign: 'center' }}>
                Volver al inicio de sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}