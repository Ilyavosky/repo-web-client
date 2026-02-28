'use client';

import { useEffect, useRef } from 'react';
import styles from './ActionMenu.module.css';

interface ActionMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onDetails: () => void;
}

export default function ActionMenu({ isOpen, onToggle, onDelete, onEdit, onDetails }: ActionMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (isOpen) onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
      >
        •••
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          <button
            className={`${styles.item} ${styles.danger}`}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            Eliminar
          </button>
          <button
            className={styles.item}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            Editar
          </button>
          <button
            className={styles.item}
            onClick={(e) => { e.stopPropagation(); onDetails(); }}
          >
            Más info
          </button>
        </div>
      )}
    </div>
  );
}