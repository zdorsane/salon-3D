import { Minus, Plus } from 'lucide-react';
import { CART_MAX_QUANTITY } from '@/config/shop';
import { useT } from '@/i18n/useT';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
}

const stepClass =
  'grid size-touch place-items-center rounded-full text-ink transition-colors hover:bg-glass-border disabled:opacity-30 disabled:hover:bg-transparent';

/** Sélecteur de quantité − / + (1 à CART_MAX_QUANTITY). */
export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  const t = useT();

  return (
    <div role="group" aria-label={t('cart.quantity')} className="inline-flex items-center rounded-full border border-glass-border">
      <button type="button" aria-label={t('cart.decrease')} disabled={value <= 1} onClick={() => onChange(value - 1)} className={stepClass}>
        <Minus aria-hidden size={14} />
      </button>
      <output aria-live="polite" className="w-6 text-center font-mono text-sm">{value}</output>
      <button type="button" aria-label={t('cart.increase')} disabled={value >= CART_MAX_QUANTITY} onClick={() => onChange(value + 1)} className={stepClass}>
        <Plus aria-hidden size={14} />
      </button>
    </div>
  );
}
