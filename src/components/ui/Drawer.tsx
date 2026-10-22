import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useOverlay } from './useOverlay';

export interface DrawerProps {
  /** Controla la visibilidad. El componente debe estar SIEMPRE montado para que la animación de salida funcione. */
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
  labelledBy?: string;
  side?: 'right' | 'left';
  /** Clases de ancho del panel (por defecto `w-full max-w-md`). */
  widthClassName?: string;
  /** Clases extra del panel. */
  panelClassName?: string;
  zIndex?: number;
}

/**
 * Panel lateral en portal con fondo, Escape, trampa de foco, scroll del body bloqueado,
 * foco restaurado y animación de salida (respeta prefers-reduced-motion). El contenido
 * decide su propia cabecera/pie; el panel es `flex flex-col h-full`.
 *
 *   <Drawer open={isCartOpen} onClose={() => setCartOpen(false)} ariaLabel="Carrito">...</Drawer>
 */
export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  children,
  ariaLabel,
  labelledBy,
  side = 'right',
  widthClassName = 'w-full max-w-md',
  panelClassName = '',
  zIndex = 120,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  useOverlay(open, panelRef, onClose);

  if (typeof document === 'undefined') return null;

  const offscreen = side === 'right' ? '100%' : '-100%';

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="drawer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.25 }}
          className="fixed inset-0 overflow-hidden bg-ink/30"
          style={{ zIndex }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={labelledBy ? undefined : ariaLabel}
            aria-labelledby={labelledBy}
            tabIndex={-1}
            initial={{ x: offscreen }}
            animate={{ x: 0 }}
            exit={{ x: offscreen, transition: { duration: reduced ? 0 : 0.25, ease: 'easeIn' } }}
            transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-y-0 ${side === 'right' ? 'right-0 border-l' : 'left-0 border-r'} ${widthClassName} flex h-full flex-col border-line bg-paper-2 text-ink shadow-overlay outline-none ${panelClassName}`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Drawer;
