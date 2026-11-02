import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./EmptyState.module.css";

type Props = {
  icon?: IconName;
  title: string;
  /** Keeps the document outline correct where the state is placed. */
  headingLevel?: 2 | 3;
  children?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ icon = "sprout", title, headingLevel = 3, children, action }: Props) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <div className={styles.empty}>
    <span className={styles.illustration}><Icon name={icon} size={32} /></span>
    <Heading className={styles.title}>{title}</Heading>
    {children && <div className={styles.text}>{children}</div>}
    {action}
  </div>;
}
