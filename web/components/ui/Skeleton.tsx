import styles from "./Skeleton.module.css";

/** Placeholder with the same footprint as a card, so content does not jump when it arrives. */
export function SkeletonCards({ count = 3, label, media = true, className }: { count?: number; label: string; media?: boolean; className?: string }) {
  return <div className={className} role="status" aria-label={label} aria-busy="true">
    {Array.from({ length: count }, (_, index) => <div className={styles.card} key={index} aria-hidden="true">
      {media && <div className={styles.media} />}
      <div className={styles.lines}><span /><span /><span /></div>
    </div>)}
  </div>;
}
