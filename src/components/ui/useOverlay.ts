import { useEffect, useRef, type RefObject } from 'react';

// Comportamiento común de Modal y Drawer: Escape (solo el overlay superior), trampa de foco,
// bloqueo del scroll del body (con contador para overlays apilados) y restauración del foco.

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

const overlayStack: number[] = [];
let overlayCounter = 0;

let scrollLocks = 0;
let savedOverflow = '';
let savedPaddingRight = '';

function lockScroll() {
  if (scrollLocks++ > 0) return;
  const { body, documentElement } = document;
  const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
  savedOverflow = body.style.overflow;
  savedPaddingRight = body.style.paddingRight;
  body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
}

function unlockScroll() {
  if (--scrollLocks > 0) return;
  scrollLocks = 0;
  document.body.style.overflow = savedOverflow;
  document.body.style.paddingRight = savedPaddingRight;
}

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
  );
}

/**
 * @param open     Si el overlay está abierto.
 * @param panelRef Ref del panel (role="dialog"); debe tener tabIndex={-1}.
 * @param onClose  Se llama con Escape.
 * Foco inicial: el elemento con `data-autofocus`, si no el primer focusable, si no el panel.
 */
export function useOverlay(open: boolean, panelRef: RefObject<HTMLElement | null>, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const id = ++overlayCounter;
    overlayStack.push(id);
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockScroll();

    const panel = panelRef.current;
    if (panel) {
      const target = panel.querySelector<HTMLElement>('[data-autofocus]') ?? getFocusable(panel)[0] ?? panel;
      target.focus({ preventScroll: true });
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (overlayStack[overlayStack.length - 1] !== id) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const root = panelRef.current;
      const items = getFocusable(root);
      if (items.length === 0) {
        event.preventDefault();
        root.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!root.contains(active) || active === root) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const index = overlayStack.indexOf(id);
      if (index !== -1) overlayStack.splice(index, 1);
      unlockScroll();
      if (previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [open, panelRef]);
}
