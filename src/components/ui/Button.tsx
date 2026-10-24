import React from 'react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';
import { useVaultTone } from './vaultTone';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Icono a la izquierda del texto. */
  icon?: React.ReactNode;
}

/**
 * Botón KRM. variant: primary (degradado ámbar) | secondary | ghost | danger.
 * size: sm | md | lg | icon. `type="button"` por defecto (no envía formularios por accidente).
 */
export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  fullWidth,
  className,
  icon,
  type = 'button',
  children,
  ...rest
}) => {
  const tone = useVaultTone();
  return (
    <button type={type} className={buttonClasses({ variant, size, fullWidth, className, tone })} {...rest}>
      {icon}
      {children}
    </button>
  );
};

export default Button;
