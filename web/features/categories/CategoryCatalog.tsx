"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Notice } from "@/components/ui/Notice";
import { SkeletonCards } from "@/components/ui/Skeleton";
import type { Category } from "@/features/listings/types";
import { apiRequest } from "@/lib/api";
import { CategoryImage } from "./CategoryImage";
import styles from "./CategoryCatalog.module.css";

const CATEGORIES_PATH = process.env.NEXT_PUBLIC_XFOOD_CATEGORIES_PATH ?? "categories";

type State = { attempt: number; categories?: Category[]; error?: string };

/** Read-only view of the approved catalog that the listing form uses. */
export function CategoryCatalog() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>({ attempt: -1 });
  const loading = state.attempt !== attempt;

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<Category[]>(CATEGORIES_PATH, { signal: controller.signal }).then(
      (items) => setState({ attempt, categories: items.filter((item) => item.isActive !== false) }),
      (reason: unknown) => {
        if (!controller.signal.aborted) setState({ attempt, error: (reason as Error).message || "No se pudo cargar el catálogo." });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  return <div className={styles.page}>
    <header className={styles.header}>
      <p className={styles.eyebrow}>Catálogo</p>
      <h1 className={styles.title}>Categorías</h1>
      <p className={styles.subtitle}>Estas son las categorías aprobadas que puedes elegir al publicar un excedente.</p>
    </header>

    <Notice tone="info" className={styles.notice}>
      El equipo de XFood administra el catálogo. Las imágenes son ilustrativas: representan la categoría, no la foto de tu producto.
    </Notice>

    {loading ? <SkeletonCards className={styles.grid} count={6} label="Cargando categorías" />
      : state.error ? <Notice tone="error" action={{ label: "Volver a intentar", onClick: () => setAttempt((value) => value + 1) }}>{state.error}</Notice>
      : !state.categories?.length ? <EmptyState icon="tag" title="No hay categorías activas">
        Verifica que la migración inicial del catálogo esté aplicada en la base de datos.
      </EmptyState>
      : <ul className={styles.grid}>
        {state.categories.map((category, index) => <li key={category.id} className={styles.card}>
          <CategoryImage categoryId={category.id} categoryName={category.name} priority={index < 3} />
          <h2 className={styles.name}>{category.name}</h2>
        </li>)}
      </ul>}
  </div>;
}
