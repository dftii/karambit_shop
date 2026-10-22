// Clases del Button, reutilizables en <Link>/<a> (fichero aparte para no romper Fast Refresh).
// Estilo editorial: cuadrado, 1px de borde, sin sombra ni degradado. El foco lo pinta el CSS global.

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const BASE =
  'inline-flex items-center justify-center gap-2 font-body font-medium rounded-none transition-colors duration-200 select-none whitespace-nowrap ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';

const VARIANTS: Record<ButtonVariant, string> = {
  // Tinta sólida → rosa al pasar el ratón
  primary: 'border border-ink bg-ink text-paper hover:border-pink hover:bg-pink hover:text-ink',
  // Borde de tinta, fondo transparente
  secondary: 'border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper',
  ghost: 'border border-transparent bg-transparent text-ink-2 hover:bg-tile hover:text-ink',
  danger: 'border border-danger bg-transparent text-danger hover:bg-danger hover:text-paper',
  // Enlace subrayado (sin padding)
  link: 'border-0 bg-transparent p-0 text-ink underline decoration-1 underline-offset-4 hover:text-pink-ink hover:decoration-pink',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
  icon: 'p-2 text-sm',
};

// El enlace no lleva padding: solo tamaño de texto.
const LINK_SIZES: Record<ButtonSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-[15px]',
  icon: 'text-sm',
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
  const sizeClasses = variant === 'link' ? LINK_SIZES[size] : SIZES[size];
  return [BASE, VARIANTS[variant], sizeClasses, fullWidth ? 'w-full' : '', className].filter(Boolean).join(' ');
}
