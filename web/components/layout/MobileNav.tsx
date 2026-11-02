"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { IconButton } from "@/components/ui/Button";
import styles from "./PublicHeader.module.css";

/** Disclosure that shows the public links on narrow screens, where the inline navigation is hidden. */
export function MobileNav({ links, current }: { links: Array<{ href: string; label: string }>; current?: string }) {
  const id = useId();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const root = useRef<HTMLDivElement>(null);

  // Navigating closes the panel; comparing during render avoids an extra effect pass.
  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); root.current?.querySelector<HTMLButtonElement>("button")?.focus(); }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  return <div ref={root} className={styles.mobile}>
    <IconButton icon={open ? "close" : "menu"} label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls={id}
      onClick={() => { setOpen(!open); setOpenedAt(pathname); }} />
    {open && <nav id={id} className={styles.mobilePanel} aria-label="Principal">
      <ul>
        {links.map((link) => <li key={link.href}>
          <Link href={link.href} aria-current={current === link.href ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link>
        </li>)}
      </ul>
    </nav>}
  </div>;
}
