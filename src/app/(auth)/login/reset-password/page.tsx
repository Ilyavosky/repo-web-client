'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import FormField from '@/components/forms/FormField';
import ErrorMessage from '@/components/forms/ErrorMessage';
import styles from '../page.module.css';

const PASSWORD_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: { password?: string; confirm?: string } = {};
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    } else if (!PASSWORD_REGEX.test(password)) {
      newErrors.password = 'Debe incluir al menos un carácter especial';
    }
    if (!confirm) {
      newErrors.confirm = 'Confirma tu contraseña';
    } else if (password !== confirm) {
      newErrors.confirm = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!token) { setGeneralError('Token inválido. Solicita un nuevo enlace.'); return; }
    setIsLoading(true);
    setGeneralError('');
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/login?registered=true');
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.logo}>GLAMSTOCK</h1>
      <div className={styles.card}>
        <div className={styles.formSection}>
          <h1 className={styles.title}>Nueva contraseña</h1>
          <p className={styles.subtitle}>Ingresa y confirma tu nueva contraseña.</p>
          {generalError && <ErrorMessage message={generalError} />}
          <form onSubmit={handleSubmit}>
            <FormField
              label="Nueva contraseña:"
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              error={errors.password}
              icon={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            <FormField
              label="Confirmar contraseña:"
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })); }}
              error={errors.confirm}
              icon={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}