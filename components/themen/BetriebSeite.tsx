import { Icon } from '@/components/icons';
import { JobQuote } from '@/components/jobs/JobQuote';
import { TextLink } from '@/components/ui/TextLink';
import { themaPfad } from '@/lib/themen/jsonld';
import { getThema } from '@/lib/themen/registry';
import { geschuetzt, type BetriebPageText } from '@/lib/themen/text';
import { cn } from '@/lib/utils/cn';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Abschnitt, Kontakt, Kopf, Saetze, WeitereThemen, titelId } from './Bausteine';
import { ThemaKopf } from './ThemaKopf';
import { Zeitkette } from './Zeitkette';
import styles from './themen.module.css';

/**
 * Themenseite Der Betrieb (E-028). Tonfolge: Kopf Papier/Navy (Haus mit Zirkelzeichen und Zeitkette 1926 → 2026) ·
 * Team Papier (Sätze aus den Fakten, vier Personen aus dem Team, Steckbrief mit Kammer, Innung und Register) ·
 * Partner-Säulen Navy · Einsatz Papier (Gebiet, keine Fernmontage, kein Wochenend-Notdienst, Weg zu allen Orten) ·
 * Stimme aus dem Team Navy · Weitere Themen Wand · Kontakt Papier.
 */
export function BetriebSeite({ text }: { text: BetriebPageText }) {
  return (
    <>
      <ThemaKopf text={text} pfad={themaPfad(getThema('betrieb'))} bildBreit panel={<Zeitkette kette={text.zeitkette} />} />

      <Abschnitt kopf={text.team.kopf} trenner klammer>
        <div className={styles.zweiSpalten}>
          <div className={styles.text}>
            <Saetze saetze={text.team.saetze} lead />
            <h3 className="text-etikett text-ink-muted">{text.team.personenTitel}</h3>
            <ul className={styles.personen}>
              {text.team.personen.map((person) => (
                <li key={person.id} className={styles.person}>
                  <span aria-hidden="true" className={cn(styles.monogramm, 'font-mass')}>
                    {person.initialen}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-body font-bold text-ink">{person.name}</span>
                    <span className="text-callout text-ink-muted">
                      {person.rolle}
                      {person.seit ? ` · ${person.seit}` : ''}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <section aria-labelledby="steckbrief-titel" className={styles.steckbrief}>
            <h3 id="steckbrief-titel" className="text-title-3 text-brand">
              Steckbrief
            </h3>
            <dl className={styles.angaben}>
              {text.team.steckbrief.map((zeile) => (
                <div key={zeile.label}>
                  <dt className="text-etikett text-ink-muted">{zeile.label}</dt>
                  <dd>{zeile.wert}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </Abschnitt>

      <Section id={text.partner.kopf.id} tone="band" aria-labelledby={titelId(text.partner.kopf.id)}>
        <Container className="flex flex-col gap-section-sm">
          <Kopf kopf={text.partner.kopf} />
          <ol className={styles.saeulen}>
            {text.partner.saeulen.map((saeule, i) => (
              <li key={saeule.name} className={styles.saeule}>
                <span className={cn(styles.saeuleNummer, 'text-etikett text-ink-2')}>{`Säule ${String(i + 1).padStart(2, '0')}`}</span>
                <p className={styles.saeuleName}>{saeule.name}</p>
                {saeule.zusatz ? <p className={styles.saeuleZusatz}>{saeule.zusatz}</p> : null}
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Abschnitt kopf={text.einsatz.kopf} trenner klammer>
        <div className={styles.zweiSpalten}>
          <div className={styles.text}>
            <Saetze saetze={text.einsatz.saetze} lead />
          </div>
          <div className={styles.text}>
            <p className={styles.absatz}>{geschuetzt(text.einsatz.orte.text)}</p>
            <TextLink href={text.einsatz.link.href} standalone className="self-start">
              {text.einsatz.link.label}
              <Icon name="arrow-right" size="sm" className="shrink-0" />
            </TextLink>
          </div>
        </div>
      </Abschnitt>

      {text.zitat ? <JobQuote quote={text.zitat} /> : null}

      <WeitereThemen weitere={text.weitere} />
      <Kontakt kontakt={text.kontakt} whatsapp={text.whatsapp} />
    </>
  );
}
