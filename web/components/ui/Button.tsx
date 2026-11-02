import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "accent" | "soft" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

type Look = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  icon?: IconName;
  iconEnd?: IconName;
};

export function buttonClassName({ variant = "primary", size = "md", block = false }: Look, extra?: string) {
  return [styles.button, styles[variant], styles[size], block && styles.block, extra].filter(Boolean).join(" ");
}

function Content({ icon, iconEnd, loading, children }: Pick<Look, "icon" | "iconEnd"> & { loading?: boolean; children: ReactNode }) {
  return <>
    {loading ? <span className={styles.spinner} aria-hidden="true" /> : icon && <Icon name={icon} size={18} />}
    <span className={styles.label}>{children}</span>
    {iconEnd && <Icon name={iconEnd} size={18} className={styles.iconEnd} />}
  </>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Look & {
  /** Shows a spinner, disables the button and marks it busy; the label stays for screen readers. */
  loading?: boolean;
};

export function Button({ variant, size, block, icon, iconEnd, loading = false, className, disabled, children, type = "button", ...rest }: ButtonProps) {
  return <button
    type={type}
    className={buttonClassName({ variant, size, block }, className)}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...rest}
  >
    <Content icon={icon} iconEnd={iconEnd} loading={loading}>{children}</Content>
  </button>;
}

type ButtonLinkProps = ComponentProps<typeof Link> & Look;

export function ButtonLink({ variant, size, block, icon, iconEnd, className, children, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClassName({ variant, size, block }, className)} {...rest}>
    <Content icon={icon} iconEnd={iconEnd}>{children}</Content>
  </Link>;
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName;
  /** Accessible name; icon-only buttons must always have one. */
  label: string;
  variant?: "ghost" | "secondary" | "onDark";
};

export function IconButton({ icon, label, variant = "ghost", className, type = "button", ...rest }: IconButtonProps) {
  return <button type={type} aria-label={label} title={label} className={[styles.iconButton, styles[`icon-${variant}`], className].filter(Boolean).join(" ")} {...rest}>
    <Icon name={icon} size={20} />
  </button>;
}
