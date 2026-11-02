"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./ActionMenu.module.css";

export type ActionMenuItem = {
  label: string;
  icon: IconName;
  onSelect: () => void;
  tone?: "danger";
  disabled?: boolean;
};

/**
 * "More actions" button following the WAI-ARIA menu button pattern: arrows move between items,
 * Escape closes and returns focus, and clicking outside dismisses it.
 */
export function ActionMenu({ label, items }: { label: string; items: ActionMenuItem[] }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current.find((item) => item && !item.disabled)?.focus();
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const enabled = itemRefs.current.filter((item): item is HTMLButtonElement => Boolean(item && !item.disabled));
    const current = enabled.indexOf(document.activeElement as HTMLButtonElement);
    const targets: Record<string, number> = {
      ArrowDown: (current + 1) % enabled.length,
      ArrowUp: (current - 1 + enabled.length) % enabled.length,
      Home: 0,
      End: enabled.length - 1,
    };
    if (event.key in targets) {
      event.preventDefault();
      enabled[targets[event.key]]?.focus();
    } else if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") event.preventDefault();
      setOpen(false);
      if (event.key === "Escape") trigger.current?.focus();
    }
  }

  function select(item: ActionMenuItem) {
    setOpen(false);
    trigger.current?.focus();
    item.onSelect();
  }

  return <div className={styles.root} ref={root}>
    <button ref={trigger} type="button" className={styles.trigger} aria-label={label} title={label}
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(!open)}>
      <Icon name="more" size={20} />
    </button>
    {open && <div id={id} role="menu" aria-label={label} className={styles.menu} onKeyDown={move}>
      {items.map((item, index) => <button key={item.label} ref={(element) => { itemRefs.current[index] = element; }}
        type="button" role="menuitem" tabIndex={-1} disabled={item.disabled}
        className={`${styles.item} ${item.tone === "danger" ? styles.danger : ""}`} onClick={() => select(item)}>
        <Icon name={item.icon} size={18} />{item.label}
      </button>)}
    </div>}
  </div>;
}
