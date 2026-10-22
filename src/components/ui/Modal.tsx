import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useOverlay } from './useOverlay';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
};

export interface ModalProps {
  /** Controla la visibilidad. El componente debe estar SIEMPRE montado para que la animación de salida funcione. */
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Etiqueta accesible (o usa `labelledBy` con el id de un título). */
  ariaLabel?: string;
  labelledBy?: string;
  size?: ModalSize;
  /** Clases extra del panel. Base: bg-paper-2, borde 1px line, sombra sutil de overlay. */
  panelClassName?: string;
  panelStyle?: React.CSSProperties;
  /** Clic en el fondo cierra (por defecto sí). */
  closeOnBackdrop?: boolean;
  zIndex?: number;
}

/**
 * Modal centrado en portal: fondo, Escape, trampa de foco, scroll del body bloqueado,
 * foco restaurado al cerrar y animación de entrada/salida (respeta prefers-reduced-motion).
 *
 *   <Modal open={isOpen} onClose={close} ariaLabel="Vista rápida" size="lg">...</Modal>
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  ariaLabel,
  labelledBy,
  size = 'md',
  panelClassName = '',
  panelStyle,
  closeOnBackdrop = true,
  zIndex = 130,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  useOverlay(open, panelRef, onClose);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-ink/30 p-3 sm:p-6"
          style={{ zIndex }}
          onMouseDown={(event) => {
            if (closeOnBackdrop && event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={labelledBy ? undefined : ariaLabel}
            aria-labelledby={labelledBy}
            tabIndex={-1}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: reduced ? 0 : 0.22, ease: 'easeOut' }}
            className={`relative my-auto w-full border border-line bg-paper-2 text-ink ${SIZES[size]} outline-none ${panelClassName}`}
            style={panelStyle}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
