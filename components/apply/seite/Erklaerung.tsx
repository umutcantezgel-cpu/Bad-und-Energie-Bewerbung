import { SectionHeader } from '@/components/home/SectionHeader';
import { Icon } from '@/components/icons';
import { TextLink } from '@/components/ui/TextLink';
import { ERKLAERUNG_TITEL_ID, erklaerung, type ErklaerungEingaben } from './erklaerung-text';
import styles from './seite.module.css';

/**
 * Ruhiger Erklärteil unter dem Flow (V6-G1): Ablauf in drei Schritten mit der Antwort von Sabri Demir, Wegweiser
 * zu den Stellen mit Links auf die Stellenanzeigen, Bewerbung ohne Lebenslauf oder mit Unterlagen. Ohne rote
 * Fläche und ohne eigenen Knopf: Die Hauptaktion bleibt der Flow. Server-Komponente, Texte aus erklaerung-text.ts.
 */
export function Erklaerung(eingaben: ErklaerungEingaben) {
  const { etikett, titel, einleitung, ablauf, stellen, unterlagen } = erklaerung(eingaben);

  return (
    <section aria-labelledby={ERKLAERUNG_TITEL_ID} className="flex flex-col gap-12" data-bewerbung="erklaerung">
      <SectionHeader id={ERKLAERUNG_TITEL_ID} eyebrow={etikett} title={titel} lead={einleitung} />

      <div className="flex flex-col gap-4">
        <h3 className="text-title-3 text-brand">{ablauf.titel}</h3>
        <ol className={styles.liste}>
          {ablauf.schritte.map((schritt) => (
            <li key={schritt.id} className={styles.schritt}>
              <span aria-hidden="true" className="font-mass text-lead font-semibold text-brand">
                {String(schritt.number).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-1">
                <h4 className="text-body font-bold text-ink">
                  <span className="sr-only">Schritt {schritt.number}: </span>
                  {schritt.title}
                </h4>
                <p className="max-w-prose text-callout text-ink-muted">{schritt.text}</p>
              </div>
            </li>
          ))}
        </ol>
        {ablauf.hinweis ? <p className="max-w-prose text-callout text-ink">{ablauf.hinweis}</p> : null}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-title-3 text-brand">{stellen.titel}</h3>
        <ul className={styles.liste}>
          {stellen.liste.map((stelle) => (
            <li key={stelle.id} className={styles.eintrag}>
              <TextLink href={stelle.href} className="self-start text-body font-bold">
                {stelle.titel}
              </TextLink>
              <p className="max-w-prose text-callout text-ink">{stelle.text}</p>
              <p className="text-callout text-ink-muted">
                <span className="text-etikett">
                  {stellen.voraussetzung}
                  <span className="sr-only">: </span>
                </span>{' '}
                {stelle.voraussetzungen.join(' · ')}
              </p>
            </li>
          ))}
          {stellen.ohneAnzeige.map((weg) => (
            <li key={weg.id} className={styles.eintrag}>
              <p className="text-body font-bold text-ink">{weg.name}</p>
              <p className="max-w-prose text-callout text-ink">{weg.text}</p>
              <p className="text-callout text-ink-muted">{stellen.ohneAnzeigeHinweis}</p>
            </li>
          ))}
        </ul>
        <p className="max-w-prose text-callout text-ink">{stellen.initiativ}</p>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-title-3 text-brand">{unterlagen.titel}</h3>
        <p className="max-w-prose text-body text-ink">{unterlagen.text}</p>
        <p className="max-w-prose text-body text-ink">{unterlagen.mappe}</p>
        <ul className="flex flex-col items-start">
          {unterlagen.links.map((link) => (
            <li key={link.href}>
              <TextLink href={link.href} standalone>
                {link.label}
                <Icon name={link.href.startsWith('#') ? 'arrow-up' : 'arrow-right'} size="sm" className="shrink-0" />
              </TextLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
