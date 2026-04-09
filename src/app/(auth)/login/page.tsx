'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import FormField from '@/components/forms/FormField';
import ErrorMessage from '@/components/forms/ErrorMessage';
import styles from './page.module.css';

const PASSWORD_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

type Step = 'credentials' | 'setup' | 'verify';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateCredentials = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'El correo es obligatorio';
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!PASSWORD_REGEX.test(password)) {
      newErrors.password = 'La contraseña debe incluir al menos un carácter especial';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = (): boolean => {
    if (!otpCode || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      setErrors({ otpCode: 'Ingresa el código de 6 dígitos de Google Authenticator' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors((p) => ({ ...p, email: '' }));
    setGeneralError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors((p) => ({ ...p, password: '' }));
    setGeneralError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
    setErrors({});
    setGeneralError('');
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCredentials()) return;
    setIsLoading(true);
    setGeneralError('');
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
      if (data.isNewSetup) {
        setQrDataUrl(data.qrDataUrl);
        setStep('setup');
      } else {
        setStep('verify');
      }
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOtp()) return;
    setIsLoading(true);
    setGeneralError('');
    try {
      const res = await fetch('/api/v1/auth/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código incorrecto');
      router.push('/dashboard');
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Código incorrecto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.logo}>GLAMSTOCK</h1>
      <div className={styles.card}>
        {step === 'credentials' && (
          <>
            <div className={styles.imageSection}>
              <img src="/img-1.jpg" alt="GlamStock Bag" className={styles.image} />
            </div>
            <div className={styles.formSection}>
              <h1 className={styles.title}>¡Bienvenido!</h1>
              <p className={styles.subtitle}>Ingresa tus datos para continuar</p>
              {justRegistered && (
                <p className={styles.successMessage}>Cuenta creada con éxito. Inicia sesión para continuar.</p>
              )}
              {generalError && <ErrorMessage message={generalError} />}
              <form onSubmit={handleCredentialsSubmit}>
                <FormField
                  label="Email:"
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  error={errors.email}
                />
                <FormField
                  label="Contraseña:"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  error={errors.password}
                  icon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
                <button type="submit" disabled={isLoading} className={styles.submitButton}>
                  {isLoading ? 'Verificando...' : 'Continuar'}
                </button>
                <Link href="/login/forgot-password" className={styles.new} style={{ textAlign: 'center', display: 'block', marginTop: '8px' }}>
                  ¿Olvidaste tu contraseña?
                </Link>
                <Link href="/login/register" className={styles.new}>
                  ¿No tienes cuenta? <span className={styles.newregister}>Regístrate</span>
                </Link>
              </form>
            </div>
          </>
        )}

        {step === 'setup' && (
          <div className={styles.formSection}>
            <h1 className={styles.title}>Configura tu autenticador</h1>
            <p className={styles.subtitle}>
              Escanea este código QR con Google Authenticator y luego ingresa el código generado.
            </p>
            {qrDataUrl && (
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <img src={qrDataUrl} alt="Código QR para Google Authenticator" style={{ width: 180, height: 180 }} />
              </div>
            )}
            {generalError && <ErrorMessage message={generalError} />}
            <form onSubmit={handleOtpSubmit}>
              <FormField
                label="Código de verificación:"
                id="otpCode"
                type="text"
                value={otpCode}
                onChange={handleOtpChange}
                error={errors.otpCode}
                placeholder="000000"
              />
              <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? 'Verificando...' : 'Activar y entrar'}
              </button>
            </form>
            <button
              type="button"
              onClick={() => { setStep('credentials'); setOtpCode(''); setGeneralError(''); }}
              style={{ marginTop: 8, background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Volver
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className={styles.formSection}>
            <h1 className={styles.title}>Verificación</h1>
            <p className={styles.subtitle}>Ingresa el código de 6 dígitos de Google Authenticator.</p>
            {generalError && <ErrorMessage message={generalError} />}
            <form onSubmit={handleOtpSubmit}>
              <FormField
                label="Código de verificación:"
                id="otpCode"
                type="text"
                value={otpCode}
                onChange={handleOtpChange}
                error={errors.otpCode}
                placeholder="000000"
              />
              <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? 'Verificando...' : 'Ingresar'}
              </button>
            </form>
            <button
              type="button"
              onClick={() => { setStep('credentials'); setOtpCode(''); setGeneralError(''); }}
              style={{ marginTop: 8, background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}