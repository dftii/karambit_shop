import { createContext, useContext, type CSSProperties } from 'react';

/**
 * Tono "vault" de la ficha: las piezas Founder Bespoke se muestran sobre una banda de tinta (`bg-ink text-paper`).
 * La ficha y la vista rápida lo proveen con `<VaultToneContext value="dark">`; los componentes que lo leen
 * (Button, Price, Badge, CheckRow, Choice, Inspector, Configurator...) cambian de juego de clases.
 * Fuera de un proveedor el tono es `light` y nada cambia.
 */
export type VaultTone = 'light' | 'dark';

export const VaultToneContext = createContext<VaultTone>('light');

export const useVaultTone = (): VaultTone => useContext(VaultToneContext);

/** `true` dentro de la banda vault (tono oscuro). */
export const useIsVault = (): boolean => useContext(VaultToneContext) === 'dark';

/** Devuelve `pick(light, dark)`: la clase que toca según el tono. Las cadenas claras no se tocan. */
export const useVaultPick = () => {
  const dark = useIsVault();
  return (light: string, vault: string) => (dark ? vault : light);
};

const GRID_LINE = 'rgba(236, 230, 221, 0.1)';

/** Escenario vault: tinta pura con rejilla técnica de 1px (papel al 10 %) cada 40px. */
export const VAULT_STAGE_STYLE: CSSProperties = {
  backgroundColor: '#111111',
  backgroundImage:
    `repeating-linear-gradient(0deg, ${GRID_LINE} 0, ${GRID_LINE} 1px, transparent 1px, transparent 40px),` +
    `repeating-linear-gradient(90deg, ${GRID_LINE} 0, ${GRID_LINE} 1px, transparent 1px, transparent 40px)`,
};
