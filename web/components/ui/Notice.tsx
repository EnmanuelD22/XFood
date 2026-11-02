import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./Notice.module.css";

type Tone = "error" | "success" | "warning" | "info";

const ICONS: Record<Tone, IconName> = { error: "alert", success: "checkCircle", warning: "alert", info: "info" };

type Props = {
  tone: Tone;
  title?: ReactNode;
  children?: ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
};

/** Errors interrupt (`alert`); everything else is announced politely (`status`). */
export function Notice({ tone, title, children, action, className }: Props) {
  return <div className={[styles.notice, styles[tone], className].filter(Boolean).join(" ")} role={tone === "error" ? "alert" : "status"}>
    <Icon name={ICONS[tone]} size={20} className={styles.icon} />
    <div className={styles.body}>
      {title && <strong className={styles.title}>{title}</strong>}
      {children && <div>{children}</div>}
      {action && <button type="button" className={styles.action} onClick={action.onClick}>{action.label}</button>}
    </div>
  </div>;
}
