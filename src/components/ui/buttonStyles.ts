// Clases del Button, reutilizables en <Link>/<a> (fichero aparte para no romper Fast Refresh).

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const BASE =
  'inline-flex items-center justify-center gap-2 font-display font-black uppercase tracking-wider rounded-xl transition-all duration-200 select-none ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-krm-accent';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'text-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20',
  secondary: 'text-white bg-krm-border hover:bg-krm-hover',
  ghost: 'text-gray-400 hover:text-white hover:bg-krm-border',
  danger: 'text-red-400 bg-red-500/10 border border-red-500/40 hover:bg-red-500/20 hover:text-red-300',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
  icon: 'p-2 text-sm',
};

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Clases del botón; úsalas también en `<Link>`/`<a>` para que se vean igual que un `<Button>`. */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: ButtonStyleOptions = {}): string {
  return [BASE, VARIANTS[variant], SIZES[size], fullWidth ? 'w-full' : '', className].filter(Boolean).join(' ');
}
