import Image from "next/image";
import { categoryImageFor } from "./category-images";
import styles from "./CategoryImage.module.css";

export const CATEGORY_IMAGE_CAPTION = "Imagen ilustrativa de la categoría";

const WIDTH = 320;
const HEIGHT = 200;

type Props = {
  categoryId?: string | null;
  categoryName?: string | null;
  /** Above-the-fold images may load eagerly; everything else is deferred. */
  priority?: boolean;
  className?: string;
};

/**
 * Reserved 16:10 box with lazy loading, so cards never jump while images arrive. The visible caption
 * makes clear the picture represents the category, not the actual lot.
 */
export function CategoryImage({ categoryId, categoryName, priority = false, className }: Props) {
  const image = categoryImageFor(categoryId, categoryName);
  return <figure className={[styles.figure, className].filter(Boolean).join(" ")}>
    <Image className={styles.image} src={image.src} width={WIDTH} height={HEIGHT} alt="" unoptimized
      loading={priority ? "eager" : "lazy"} decoding="async" />
    <figcaption className={styles.caption}>
      {image.known ? CATEGORY_IMAGE_CAPTION : "Categoría sin imagen ilustrativa"}
      {categoryName && <span className="sr-only">: {categoryName}</span>}
    </figcaption>
  </figure>;
}
