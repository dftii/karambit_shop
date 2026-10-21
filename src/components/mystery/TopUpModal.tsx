import React from 'react';
import { Wallet } from 'lucide-react';
import { Button, Modal, Price, toast } from '../ui';
import { TOP_UP_AMOUNTS } from '../../lib/mysteryCases';
import { useStore } from '../../store/useStore';

interface TopUpModalProps {
  open: boolean;
  onClose: () => void;
}

/** Recarga de saldo SIMULADO (dinero ficticio): no hay pagos reales. */
export const TopUpModal: React.FC<TopUpModalProps> = ({ open, onClose }) => {
  const balance = useStore((s) => s.balance);
  const addBalance = useStore((s) => s.addBalance);

  const topUp = (amount: number) => {
    addBalance(amount);
    toast.success(`+${amount} € de saldo simulado añadidos (dinero ficticio).`, { title: 'Saldo recargado' });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" labelledBy="topup-title" panelClassName="rounded-3xl border border-krm-border bg-krm-panel p-6 shadow-2xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-krm-accent/30 bg-krm-accent/10 text-krm-accent">
          <Wallet className="h-5 w-5" />
        </span>
        <div>
          <h2 id="topup-title" className="font-display text-xl font-black uppercase text-white">
            Recargar saldo (simulado)
          </h2>
          <p className="text-xs text-gray-400">Saldo actual: <Price value={balance} size="xs" /></p>
        </div>
      </div>
      <p className="mt-3 font-body text-xs leading-relaxed text-gray-400">
        Es dinero ficticio de la tienda: no se realiza ningún cargo ni pago real. Elige un importe para añadirlo al instante.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {TOP_UP_AMOUNTS.map((amount) => (
          <Button key={amount} variant="secondary" size="lg" onClick={() => topUp(amount)}>
            +{amount} €
          </Button>
        ))}
      </div>
      <Button variant="ghost" size="sm" fullWidth className="mt-3" onClick={onClose}>
        Cancelar
      </Button>
    </Modal>
  );
};
