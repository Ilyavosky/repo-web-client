'use client';

import { useState, useEffect } from 'react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import formStyles from './form.module.css';

interface Motivo { id_motivo: number; descripcion: string; }

interface AjusteStockModalProps {
  open: boolean;
  varianteId: number | null;
  sucursalId: number | null;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export default function AjusteStockModal({ open, varianteId, sucursalId, onClose, onSuccess, showToast }: AjusteStockModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ cantidad: '', id_motivo: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [motivos, setMotivos] = useState<Motivo[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch('/api/v1/motivos', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(d => setMotivos(d.data || []))
      .catch(() => setMotivos([]));
    setFormData({ cantidad: '', id_motivo: '' });
    setFormErrors({});
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!varianteId || !sucursalId) return;

    const errors: Record<string, string> = {};
    if (!formData.cantidad || Number(formData.cantidad) === 0) errors.cantidad = 'Ingresa una cantidad (ej. +5 o -3)';
    if (!formData.id_motivo) errors.id_motivo = 'Selecciona un motivo';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/inventario/ajuste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id_variante: varianteId,
          id_sucursal: sucursalId,
          cantidad: Number(formData.cantidad),
          id_motivo: Number(formData.id_motivo),
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        showToast(d.error ?? d.detalles?.[0]?.mensaje ?? 'Error al ajustar inventario', 'error');
        return;
      }

      showToast('Stock ajustado correctamente', 'success');
      onSuccess();
      onClose();
    } catch {
      showToast('Error de red al guardar', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Ajustar Stock">
      <form onSubmit={handleSubmit} className={formStyles.form}>
        <div className={formStyles.field}>
          <label className={formStyles.label}>Cantidad a sumar (+) o restar (-)</label>
          <input
            className={`${formStyles.input} ${formErrors.cantidad ? formStyles.inputError : ''}`}
            type="number"
            name="cantidad"
            placeholder="-3, 5, etc."
            step="1"
            value={formData.cantidad}
            onChange={handleChange}
          />
          <p className={formStyles.hint}>
            Negativos para dar de baja (-2), positivos para registrar ingreso (+10).
          </p>
          {formErrors.cantidad && <p className={formStyles.error}>{formErrors.cantidad}</p>}
        </div>

        <div className={formStyles.field}>
          <label className={formStyles.label}>Motivo de Ajuste</label>
          <select
            aria-label="Motivo de ajuste"
            className={`${formStyles.input} ${formStyles.select} ${formErrors.id_motivo ? formStyles.inputError : ''}`}
            name="id_motivo"
            value={formData.id_motivo}
            onChange={handleChange}
          >
            <option value="">Selecciona el motivo del ajuste</option>
            {motivos.map(m => (
              <option key={m.id_motivo} value={m.id_motivo}>{m.descripcion}</option>
            ))}
          </select>
          {formErrors.id_motivo && <p className={formStyles.error}>{formErrors.id_motivo}</p>}
        </div>

        <div className={formStyles.actions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Procesando...' : 'Ajustar Inventario'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}