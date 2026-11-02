import { MarketArt } from "@/components/brand/MarketArt";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CategoryImage } from "@/features/categories/CategoryImage";
import styles from "./HomePage.module.css";

const STEPS: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "store", title: "Los negocios publican", text: "Panaderías, restaurantes y mercados publican los alimentos que les sobran, con precio reducido y horario de recogida." },
  { icon: "map", title: "Encuentras ofertas cerca", text: "Usa tu ubicación o elige un punto en el mapa para ver lo disponible dentro del radio que prefieras." },
  { icon: "box", title: "Recoges y aprovechas", text: "Revisa el detalle, ve al establecimiento dentro del horario indicado y paga allí según sus instrucciones." },
];

const CATEGORIES = ["Comidas preparadas", "Panadería y repostería", "Frutas y verduras", "Lácteos y huevos", "Carnes y pescados", "Alimentos envasados"];

const BUSINESS_POINTS = [
  "Publica un excedente en pocos minutos, con precio original y precio rebajado.",
  "Controla unidades, horarios de recogida y desactiva una publicación cuando lo necesites.",
  "Tu oferta aparece en la búsqueda pública de las personas que están cerca.",
];

const IMPACT: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "sprout", title: "Menos desperdicio", text: "Cada excedente que se recupera es comida que no termina en la basura." },
  { icon: "users", title: "Más comunidad", text: "Conecta a los negocios del barrio con las personas que viven y trabajan cerca." },
  { icon: "globe", title: "Un futuro más sostenible", text: "Aprovechar mejor los alimentos también ahorra el agua y la energía con que se produjeron." },
];

export function HomePage() {
  return <>
    <a className="skip-link" href="#contenido">Ir al contenido</a>
    <PublicHeader current="/" />
    <main id="contenido">
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Alimentos que merecen otra oportunidad</p>
          <h1 id="home-title" className={styles.headline}>Buena comida también puede tener <span>un mejor mañana</span></h1>
          <p className={styles.lead}>XFood conecta establecimientos con excedentes de alimentos y personas que pueden aprovecharlos a precio reducido.</p>
          <div className={styles.ctas}>
            <ButtonLink href="/buscar" variant="accent" iconEnd="arrowRight">Buscar ofertas cerca</ButtonLink>
            <ButtonLink href="/registro?rol=establecimiento" variant="secondary" icon="store" className={styles.onDark}>Publicar mis excedentes</ButtonLink>
          </div>
        </div>
        <MarketArt className={styles.heroArt} />
      </section>

      <section id="como-funciona" className={styles.section} aria-labelledby="how-title">
        <p className={styles.eyebrow}>Cómo funciona</p>
        <h2 id="how-title" className={styles.sectionTitle}>Tres pasos para aprovechar mejor</h2>
        <ol className={styles.steps}>
          {STEPS.map((step, index) => <li key={step.title} className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
            <span className={styles.stepIcon}><Icon name={step.icon} size={26} /></span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>)}
        </ol>
      </section>

      <section className={`${styles.section} ${styles.tinted}`} aria-labelledby="categories-title">
        <p className={styles.eyebrow}>Qué puedes encontrar</p>
        <h2 id="categories-title" className={styles.sectionTitle}>Categorías aprobadas</h2>
        <ul className={styles.categories}>
          {CATEGORIES.map((name) => <li key={name} className={styles.category}>
            <CategoryImage categoryName={name} />
            <h3>{name}</h3>
          </li>)}
        </ul>
      </section>

      <section id="negocios" className={styles.section} aria-labelledby="business-title">
        <div className={styles.business}>
          <div>
            <p className={styles.eyebrow}>Para negocios</p>
            <h2 id="business-title" className={styles.sectionTitle}>Convierte tus excedentes en una oportunidad</h2>
            <ul className={styles.checks}>
              {BUSINESS_POINTS.map((point) => <li key={point}><Icon name="checkCircle" size={22} />{point}</li>)}
            </ul>
            <div className={styles.ctas}>
              <ButtonLink href="/registro?rol=establecimiento" iconEnd="arrowRight">Crear cuenta de establecimiento</ButtonLink>
              <ButtonLink href="/login" variant="ghost">Ya tengo cuenta</ButtonLink>
            </div>
          </div>
          <div className={styles.businessCard} aria-hidden="true">
            <CategoryImage categoryName="Panadería y repostería" />
            <div className={styles.businessCardBody}>
              <span className={styles.sampleTag}>Ejemplo de publicación</span>
              <strong>Pan del día</strong>
              <span>Panadería y repostería</span>
              <span className={styles.fakePrice}><del>RD$250</del> <b>RD$150</b></span>
            </div>
          </div>
        </div>
      </section>

      <section id="impacto" className={`${styles.section} ${styles.impact}`} aria-labelledby="impact-title">
        <p className={styles.eyebrow}>Impacto</p>
        <h2 id="impact-title" className={styles.sectionTitle}>Lo que cambia cuando aprovechamos juntos</h2>
        <ul className={styles.impactList}>
          {IMPACT.map((item) => <li key={item.title}>
            <span className={styles.impactIcon}><Icon name={item.icon} size={26} /></span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </li>)}
        </ul>
      </section>
    </main>
    <SiteFooter />
  </>;
}
