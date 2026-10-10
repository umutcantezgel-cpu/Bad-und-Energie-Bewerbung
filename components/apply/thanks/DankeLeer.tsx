import type { ReactNode } from 'react';
import { SectionHeader } from '@/components/home/SectionHeader';
import { Section } from '@/components/layout/Section';
import { Seitenkopf } from '@/components/seitenkopf';
import { HausKlein } from '@/components/zeichnung';
import { DANKE_ANKER, LEER_KOPF } from './danke-text';
import styles from './danke.module.css';

export interface DankeLeerProps {
  ort: string;
  bewerbenMikrotext: string;
  contactOptions?: ReactNode;
}

/** Ziffern im Fließtext in Bricolage (`ziffer`): Atkinson zeichnet die Null mit Schrägstrich. */
function mitZiffern(text: string): ReactNode {
  return text.split(/(\d+)/).map((teil, index) =>
    /^\d+$/.test(teil) ? (
      <span key={index} className="ziffer">
        {teil}
      </span>
    ) : (
      teil
    ),
  );
}

/**
 * Leerzustand (K-011 „Leer“): In diesem Fenster ist keine Bewerbung gespeichert, etwa weil die Seite in einem
 * neuen Tab geöffnet wurde. Ruhig und hilfreich: Der Kopf sagt, warum, die Hauptaktion führt zur Bewerbung
 * (Vorlauf aus dem Haus in den Knopf), darunter der direkte Draht für alle, die schon abgeschickt haben.
 */
export function DankeLeer({ ort, bewerbenMikrotext, contactOptions }: DankeLeerProps) {
  return (
    <>
      <Seitenkopf
        variante="arbeit"
        titelId={DANKE_ANKER.titel}
        etikett={LEER_KOPF.etikett(ort)}
        titel={LEER_KOPF.titel}
        unterzeile={LEER_KOPF.unterzeile}
        einleitung={<p>{LEER_KOPF.einleitung}</p>}
        aktion={LEER_KOPF.aktion}
        mikrotext={mitZiffern(bewerbenMikrotext)}
        zweitweg={LEER_KOPF.zweitweg}
        panel={<HausKlein className={styles.haus} />}
      />
      {contactOptions ? (
        <Section tone="wand" trenner aria-labelledby="danke-leer-fragen">
          <div className={styles.ergaenzen}>
            <div className={styles.ergaenzenHaupt}>
              <SectionHeader
                id="danke-leer-fragen"
                eyebrow={LEER_KOPF.fragenEtikett}
                title={LEER_KOPF.fragenTitel}
                lead={LEER_KOPF.fragenEinleitung}
              />
              {contactOptions}
            </div>
          </div>
        </Section>
      ) : null}
    </>
  );
}
