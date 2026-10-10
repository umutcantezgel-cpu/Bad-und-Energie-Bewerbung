import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  LEGAL_ENTITY,
  LegalFactLink,
  LegalFacts,
  SUPERVISORY_AUTHORITY,
  displayUrl,
  formatNoticeDate,
  mailtoHref,
  type LegalFact,
} from '@/components/legal';
import { RechtAbschnitt, RechtDokument, abschnittsNummer } from '@/components/recht';
import { TextLink } from '@/components/ui/TextLink';
import { PRIVACY_NOTICE_VERSION } from '@/lib/applications/schema';
import { DISCRETION_PROMISE } from '@/lib/content';
import { MAPS_CONSENT_KEY } from '@/lib/maps/consent';
import { generatePageMetadata } from '@/lib/seo/metadata';

/*
 * Datenschutzerklärung (Stand: PRIVACY_NOTICE_VERSION). Jede inhaltliche Änderung gegenüber der
 * Vorversion steht in docs/operations/datenschutz-aenderungen.md und ist dort zur Prüfung durch
 * den Datenschutzbeauftragten markiert. Bei neuen Änderungen: Liste ergänzen und
 * die neue Fassung an PRIVACY_NOTICE_VERSIONS in lib/applications/constants.ts anhängen (wird mit
 * jeder Bewerbung gespeichert; der Server nimmt nur dort gelistete Fassungen an).
 */

export const metadata: Metadata = generatePageMetadata({
  title: 'Datenschutzerklärung',
  description:
    'Datenschutz bei Bad und Energie in Wetzlar: Bewerbungsdaten, Entwurf im Browser, Herkunftsmessung ohne Cookies, Google Maps per Klick und deine Rechte.',
  path: '/datenschutz',
  type: 'legal',
});

type SectionId =
  | 'verantwortlicher'
  | 'ueberblick'
  | 'rechtsgrundlagen'
  | 'datenerfassung'
  | 'bewerberdaten'
  | 'entwurf'
  | 'herkunft'
  | 'google-maps'
  | 'kontakt'
  | 'cookies-analyse'
  | 'betroffenenrechte'
  | 'aufsichtsbehoerde';

/** Reihenfolge = Reihenfolge im Inhaltsverzeichnis und auf der Seite. Die alten Anker bleiben gültig. */
const SECTIONS: Record<SectionId, { title: string; toc?: string }> = {
  verantwortlicher: { title: 'Verantwortlicher' },
  ueberblick: { title: 'Kurz gesagt' },
  rechtsgrundlagen: { title: 'Rechtsgrundlagen' },
  datenerfassung: { title: 'Hosting, Server-Logdateien und Sicherheit', toc: 'Hosting und Sicherheit' },
  bewerberdaten: { title: 'Bewerbung über diese Website', toc: 'Bewerbung' },
  entwurf: { title: 'Entwurf und Bewerbungsmappe im Browser', toc: 'Entwurf im Browser' },
  herkunft: { title: 'Herkunftsmessung ohne Cookies', toc: 'Herkunftsmessung' },
  'google-maps': { title: 'Google Maps (2-Klick-Lösung)', toc: 'Google Maps' },
  kontakt: { title: 'Kontakt per Telefon, E-Mail und WhatsApp', toc: 'Telefon, E-Mail, WhatsApp' },
  'cookies-analyse': { title: 'Cookies, Analyse und Schriften', toc: 'Cookies und Schriften' },
  betroffenenrechte: { title: 'Deine Rechte' },
  aufsichtsbehoerde: { title: 'Beschwerde bei der Aufsichtsbehörde', toc: 'Aufsichtsbehörde' },
};

const SECTION_IDS = Object.keys(SECTIONS) as SectionId[];
const TOC = SECTION_IDS.map((id) => ({ id, label: SECTIONS[id].toc ?? SECTIONS[id].title }));

/** Kapitel mit derselben laufenden Nummer wie im Inhaltsverzeichnis (Darstellung R5-RECHT-01). */
function Chapter({ id, children }: { id: SectionId; children: ReactNode }) {
  return (
    <RechtAbschnitt id={id} titel={SECTIONS[id].title} nummer={abschnittsNummer(SECTION_IDS.indexOf(id))}>
      {children}
    </RechtAbschnitt>
  );
}

const CONTROLLER: readonly LegalFact[] = [
  { label: 'Unternehmen', value: LEGAL_ENTITY.name },
  {
    label: 'Anschrift',
    value: (
      <>
        {LEGAL_ENTITY.street}
        <br />
        {LEGAL_ENTITY.postalCodeCity}
      </>
    ),
  },
  { label: 'Geschäftsführer', value: LEGAL_ENTITY.managingDirector },
  {
    label: 'Telefon',
    value: (
      <LegalFactLink href={LEGAL_ENTITY.phone.href}>
        {LEGAL_ENTITY.phone.display}
      </LegalFactLink>
    ),
  },
  { label: 'Telefax', value: LEGAL_ENTITY.fax },
  {
    label: 'E-Mail',
    value: (
      <LegalFactLink href={LEGAL_ENTITY.emailHref}>
        {LEGAL_ENTITY.email}
      </LegalFactLink>
    ),
  },
  { label: 'Handelsregister', value: `${LEGAL_ENTITY.registerCourt}, ${LEGAL_ENTITY.registerNumber}` },
  { label: 'USt-IdNr.', value: LEGAL_ENTITY.vatId },
];

const AUTHORITY: readonly LegalFact[] = [
  { label: 'Behörde', value: SUPERVISORY_AUTHORITY.name },
  { label: 'Hausanschrift', value: SUPERVISORY_AUTHORITY.visitingAddress },
  { label: 'Postanschrift', value: SUPERVISORY_AUTHORITY.postalAddress },
  {
    label: 'Telefon',
    value: (
      <LegalFactLink href={SUPERVISORY_AUTHORITY.phone.href}>
        {SUPERVISORY_AUTHORITY.phone.display}
      </LegalFactLink>
    ),
  },
  { label: 'Telefax', value: SUPERVISORY_AUTHORITY.fax },
  {
    label: 'E-Mail',
    value: (
      <LegalFactLink href={mailtoHref(SUPERVISORY_AUTHORITY.email)}>
        {SUPERVISORY_AUTHORITY.email}
      </LegalFactLink>
    ),
  },
  {
    label: 'Website',
    value: (
      <LegalFactLink href={SUPERVISORY_AUTHORITY.url}>
        {displayUrl(SUPERVISORY_AUTHORITY.url)}
      </LegalFactLink>
    ),
  },
];

const privacyMail = (
  <a href={mailtoHref(LEGAL_ENTITY.privacyEmail)}>{LEGAL_ENTITY.privacyEmail}</a>
);

export default function DatenschutzPage() {
  return (
    <RechtDokument
      // Weiche Trennstelle: das 20-Buchstaben-Wort bricht bei 320 px als „Datenschutz-/erklärung“
      titel={'Datenschutz\u00ADerklärung'}
      pfad="Datenschutz"
      stand={`Stand: ${formatNoticeDate(PRIVACY_NOTICE_VERSION)}`}
      einleitung={
        <p>Welche Daten wir verarbeiten, wenn du diese Website nutzt oder dich bei uns bewirbst, wofür und wie lange.</p>
      }
      inhalt={TOC}
    >
      <Chapter id="verantwortlicher">
        <p>
          Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO), sonstiger in den Mitgliedstaaten der
          Europäischen Union geltender Datenschutzgesetze und anderer Bestimmungen mit datenschutzrechtlichem Charakter
          ist:
        </p>
        <LegalFacts items={CONTROLLER} />
        <h3>Datenschutzbeauftragter</h3>
        <p>
          In unserem Handwerksbetrieb sind in der Regel weniger als 20 Personen ständig mit der automatisierten
          Verarbeitung personenbezogener Daten beschäftigt, und es gibt keine Verarbeitungen, die einer
          Datenschutz-Folgenabschätzung nach Art. 35 DSGVO unterliegen. Deshalb besteht keine gesetzliche Pflicht, einen
          Datenschutzbeauftragten zu benennen (§ 38 BDSG). Fragen zum Datenschutz beantwortet die Geschäftsleitung direkt
          unter {privacyMail}.
        </p>
      </Chapter>

      <Chapter id="ueberblick">
        <ul>
          <li>Diese Website setzt keine Cookies und nutzt keine Tracking-Pixel und keine Analyse-Tools.</li>
          <li>
            Deine Bewerbung lesen nur Menschen in unserem Betrieb. Wir entscheiden nicht automatisiert und setzen keine
            KI ein.
          </li>
          <li>Was du ins Bewerbungsformular tippst, bleibt bis zum Absenden in deinem Browser.</li>
          <li>Google Maps lädt erst, wenn du es mit einem Klick erlaubst.</li>
          <li>
            Bekommst du eine Absage, löschen wir deine Daten spätestens 6 Monate danach. Länger nur, wenn du in unseren
            Talentpool möchtest.
          </li>
        </ul>
      </Chapter>

      <Chapter id="rechtsgrundlagen">
        <p>
          Nach Art. 13 DSGVO nennen wir dir die Rechtsgrundlagen unserer Verarbeitungen. Wo in dieser Erklärung nichts
          anderes steht, gilt:
        </p>
        <ul>
          <li>
            <strong>Einwilligung, Art. 6 Abs. 1 lit. a DSGVO:</strong> Du hast in die Verarbeitung für bestimmte Zwecke
            eingewilligt, zum Beispiel in die Aufnahme in unseren Talentpool oder in das Laden von Google Maps. Eine
            Einwilligung kannst du jederzeit frei widerrufen.
          </li>
          <li>
            <strong>Vertrag und vorvertragliche Maßnahmen, Art. 6 Abs. 1 lit. b DSGVO:</strong> Die Verarbeitung ist für
            einen Vertrag mit dir oder für Schritte davor nötig, etwa für deine Bewerbung oder, als Kundin oder Kunde,
            für Sanitärangebote, Heizungswartung oder ein Aufmaß.
          </li>
          <li>
            <strong>Rechtliche Verpflichtung, Art. 6 Abs. 1 lit. c DSGVO:</strong> insbesondere steuer- und
            handelsrechtliche Aufbewahrungspflichten nach HGB und AO (bis zu 10 Jahre).
          </li>
          <li>
            <strong>Berechtigte Interessen, Art. 6 Abs. 1 lit. f DSGVO:</strong> zum Beispiel die IT-Sicherheit unserer
            Website, der Schutz vor Angriffen und Missbrauch, ein störungsfreier Betrieb und die Auswertung, über welche
            Kanäle Bewerbungen zu uns kommen.
          </li>
        </ul>
        <p>
          Speichern wir etwas auf deinem Gerät oder lesen es dort aus, gilt zusätzlich § 25 des
          Telekommunikation-Digitale-Dienste-Datenschutz-Gesetzes (TDDDG): Ist das für einen Dienst, den du ausdrücklich
          nutzen möchtest, unbedingt erforderlich, ist es nach § 25 Abs. 2 Nr. 2 TDDDG ohne Einwilligung erlaubt.
          Andernfalls nur mit deiner Einwilligung (§ 25 Abs. 1 TDDDG).
        </p>
      </Chapter>

      <Chapter id="datenerfassung">
        <h3>Hosting</h3>
        <p>
          Diese Website wird bei der Vercel Inc. (USA) gehostet. Vercel liefert die Seiten aus und betreibt die
          Serverfunktionen, die zum Beispiel deine Bewerbung entgegennehmen. Diese Serverfunktionen laufen in der Region
          Frankfurt am Main (fra1). Die Seiten selbst liefert Vercel über ein weltweites Servernetz aus, damit sie schnell
          laden. Vercel verarbeitet die Daten in unserem Auftrag und nach unseren Weisungen (Art. 28 DSGVO).
        </p>
        <h3>Server-Logdateien</h3>
        <p>
          Beim Aufruf der Website erhebt und speichert der Hoster automatisch Informationen in sogenannten
          Server-Logdateien, die dein Browser automatisch übermittelt:
        </p>
        <ul>
          <li>Browsertyp und Browserversion</li>
          <li>verwendetes Betriebssystem</li>
          <li>Referrer-URL (zuvor besuchte Seite)</li>
          <li>Hostname des zugreifenden Rechners</li>
          <li>Uhrzeit der Serveranfrage</li>
          <li>IP-Adresse (in gekürzter und anonymisierter Form)</li>
        </ul>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die Logdateien werden automatisch nach 7 Tagen gelöscht.
        </p>
        <h3>Schutz vor Missbrauch</h3>
        <p>
          Damit niemand unsere Formulare massenhaft missbraucht, zählen wir, wie oft aus einem Netz Formulare abgeschickt
          werden. Dafür wird deine IP-Adresse mit einem täglich wechselnden geheimen Schlüssel in einen Prüfwert (Hash)
          umgerechnet. Gezählt wird nur dieser Wert, nur im Arbeitsspeicher des Servers, und der Zähler läuft nach
          spätestens 24 Stunden ab. Außerdem enthält das Bewerbungsformular ein für Menschen unsichtbares Feld, und wir
          messen, wie lange das Ausfüllen gedauert hat. Ist das Feld ausgefüllt oder ging es auffällig schnell, markieren
          wir die Bewerbung als möglichen Spam. Sie erreicht unser Team trotzdem, eine Eingangsbestätigung per E-Mail
          verschicken wir dann aber nicht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <h3>Sicherheitsmeldungen des Browsers</h3>
        <p>
          Verstößt ein Inhalt auf unserer Website gegen unsere Sicherheitsregeln (Content Security Policy), kann dein
          Browser uns automatisch eine Meldung schicken. Davon speichern wir nur die betroffene Seite ohne Parameter, die
          verletzte Regel und die Herkunft des Inhalts in den Server-Logdateien. Das hilft uns, Fehler und Angriffe zu
          erkennen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <h3>SSL- und TLS-Verschlüsselung</h3>
        <p>
          Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, zum Beispiel
          deiner Bewerbung, eine SSL- und TLS-Verschlüsselung mit einer Schlüssellänge von 256 Bit. Eine verschlüsselte
          Verbindung erkennst du daran, dass die Adresszeile des Browsers mit „https://“ beginnt, und am Schloss-Symbol in
          deiner Browserzeile. Ist die Verschlüsselung aktiv, können die Daten, die du an uns übermittelst, nicht von
          Dritten mitgelesen werden.
        </p>
        <h3>Übermittlung in die USA</h3>
        <p>
          Vercel und unser E-Mail-Dienstleister Resend sind Unternehmen mit Sitz in den USA. Soweit dabei
          personenbezogene Daten in die USA übermittelt werden, geschieht das auf Grundlage des Angemessenheitsbeschlusses
          der EU-Kommission zum EU-US Data Privacy Framework, soweit der Anbieter danach zertifiziert ist, und im Übrigen
          auf Grundlage der EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).
        </p>
      </Chapter>

      <Chapter id="bewerberdaten">
        <p>
          Wenn du dich über diese Website bewirbst, verarbeiten wir deine Angaben, um über ein Beschäftigungsverhältnis
          mit dir zu entscheiden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Anbahnung eines
          Beschäftigungsverhältnisses). Nach dem Urteil des Europäischen Gerichtshofs in der Rechtssache C-34/21 richtet
          sich die Verarbeitung von Bewerber- und Beschäftigtendaten vorrangig nach Art. 6 und Art. 88 DSGVO; § 26 BDSG
          ziehen wir nur ergänzend heran, soweit er anwendbar bleibt.
        </p>

        <h3>Was wir bei der Bewerbung erfassen</h3>
        <ul>
          <li>die Stelle, auf die du dich bewirbst, oder deine Initiativbewerbung</li>
          <li>
            deine Antworten auf die kurzen Fragen, zum Beispiel zu Ausbildung und Berufserfahrung, zum Stand in der
            Schule, zu deiner aktuellen Tätigkeit, zum Führerschein Klasse B und zum frühesten Starttermin
          </li>
          <li>deinen Namen und deine Telefonnummer</li>
          <li>deine E-Mail-Adresse, wenn du sie angibst</li>
          <li>deinen bevorzugten Kontaktweg: WhatsApp, Anruf oder E-Mail</li>
          <li>
            auf Wunsch die Inhalte deiner Bewerbungsmappe: Anschreiben, Kenntnisse, Arbeitsstil sowie Berufs- und
            Ausbildungsstationen
          </li>
          <li>
            die Herkunft deiner Bewerbung, also Quelle und Kampagne (siehe <a href="#herkunft">Herkunftsmessung</a>)
          </li>
          <li>
            technische Angaben: Zeitpunkt, Bewerbungsnummer, wie lange das Ausfüllen gedauert hat, ob die Bewerbung als
            möglicher Spam markiert wurde (siehe <a href="#datenerfassung">Schutz vor Missbrauch</a>) und die Fassung
            dieses Datenschutzhinweises, die dir angezeigt wurde (derzeit {PRIVACY_NOTICE_VERSION})
          </li>
        </ul>
        <p>
          Pflicht sind nur die Stelle, deine Antworten auf die kurzen Fragen, dein Name und deine Telefonnummer, damit
          wir die Bewerbung einordnen und dich erreichen können. Die E-Mail-Adresse brauchen wir nur, wenn du E-Mail als
          Kontaktweg wählst. Alles andere ist freiwillig. Ohne die Pflichtangaben können wir deine Bewerbung nicht
          bearbeiten.
        </p>
        <p>
          Nach dem Absenden kannst du auf der Danke-Seite freiwillig etwas ergänzen: Starttermin, Postleitzahl, eine
          Nachricht oder deine Bewerbungsmappe. Wir ordnen das über die Bewerbungsnummer deiner Bewerbung zu.
        </p>

        <h3>Weitere Angaben im Bewerbungsverfahren</h3>
        <p>
          Bewirbst du dich auf anderem Weg, etwa per E-Mail, Telefon oder WhatsApp, oder sprechen wir im weiteren
          Verfahren miteinander, verarbeiten wir außerdem:
        </p>
        <ul>
          <li>Stammdaten wie Name, Vorname, Wohnort, Telefon und E-Mail</li>
          <li>berufliche Qualifikationen wie Gesellenbrief, Meistertitel und Fachzertifikate</li>
          <li>Führerscheinklassen, zum Beispiel Klasse B oder BE für Kundendienstfahrzeuge</li>
          <li>freiwillige Konditionswünsche sowie deinen möglichen Eintrittstermin oder deine Kündigungsfrist</li>
        </ul>

        <h3>Sperrvermerk für ungekündigte Fachkräfte</h3>
        <p>
          Bist du noch ungekündigt angestellt, gilt unsere Diskretionszusage. {DISCRETION_PROMISE} Unsere Geschäftsleitung
          meldet sich vertraulich und nur über die privaten Kanäle, die du uns nennst, zum Beispiel über deine private
          Mobilnummer oder per WhatsApp nach Feierabend.
        </p>

        <h3>Wer deine Bewerbung erhält</h3>
        <p>
          Deine Bewerbung geht per E-Mail an unser Team in Wetzlar. Sie lesen nur die Personen, die an der Auswahl
          beteiligt sind. Hast du eine E-Mail-Adresse angegeben, bekommst du eine Eingangsbestätigung, außer die Bewerbung
          wurde als möglicher Spam markiert. Wir verkaufen deine
          Daten nicht und geben sie nicht an Dritte weiter. Technisch beteiligt sind nur unsere Auftragsverarbeiter:
        </p>
        <ul>
          <li>
            <strong>Vercel Inc. (USA):</strong> Hosting der Website. Die Serverfunktion, die deine Bewerbung annimmt,
            läuft in Frankfurt am Main (Region fra1).
          </li>
          <li>
            <strong>Resend (USA):</strong> Versand der E-Mail mit deiner Bewerbung an unser Team und der
            Eingangsbestätigung an dich.
          </li>
        </ul>
        <p>
          Beide verarbeiten die Daten nur in unserem Auftrag und nach unseren Weisungen (Art. 28 DSGVO). Zur Übermittlung
          in die USA siehe <a href="#datenerfassung">Hosting, Server-Logdateien und Sicherheit</a>.
        </p>

        <h3>Speicherdauer</h3>
        <p>
          Führt deine Bewerbung nicht zu einer Einstellung, löschen wir deine Daten spätestens 6 Monate nach Bekanntgabe
          der Absage vollständig und unwiederbringlich (Art. 17 DSGVO in Verbindung mit § 15 Abs. 4 AGG, zur Abwehr
          möglicher Rechtsansprüche). Kommt es zu einer Einstellung, übernehmen wir die erforderlichen Daten in deine
          Personalakte.
        </p>
        <p>
          <strong>Talentpool:</strong> Über die 6 Monate hinaus, höchstens 24 Monate, speichern wir deine Bewerbung nur,
          wenn du ausdrücklich einwilligst (Art. 6 Abs. 1 lit. a DSGVO). Diese Einwilligung kannst du jederzeit
          widerrufen.
        </p>

        <h3>Keine automatisierte Entscheidung, keine KI</h3>
        <p>
          Über deine Bewerbung entscheiden Menschen. Wir treffen keine automatisierten Entscheidungen einschließlich
          Profiling im Sinne von Art. 22 DSGVO und setzen keine künstliche Intelligenz ein, um Bewerbungen zu bewerten
          oder zu bearbeiten.
        </p>
      </Chapter>

      <Chapter id="entwurf">
        <p>
          Damit nichts verloren geht, wenn du die Seite neu lädst oder kurz in eine andere App wechselst, speichert dein
          Browser deine Eingaben im Bewerbungsformular als Entwurf im sogenannten sessionStorage. Das ist ein Speicher in
          deinem Browser, der nur für den geöffneten Tab gilt.
        </p>
        <ul>
          <li>Der Entwurf bleibt auf deinem Gerät. Übertragen wird er erst, wenn du die Bewerbung absendest.</li>
          <li>Beim Absenden wird der Entwurf gelöscht. Spätestens nach 24 Stunden verfällt er.</li>
          <li>
            Die Bewerbungsmappe speichert deine Eingaben ebenfalls im sessionStorage, auch die Kontaktdaten für den
            Briefkopf. Ein Foto bleibt nur im Arbeitsspeicher der geöffneten Seite. Telefon, E-Mail, Wohnort und Foto
            aus der Mappe werden nicht mitgesendet. Druck und PDF erstellt dein Browser selbst.
          </li>
          <li>
            Nach dem Absenden merkt sich der Browser im selben Tab Bewerbungsnummer, Vorname, Stelle und einen
            Prüfschlüssel, damit du auf der Danke-Seite Angaben ergänzen kannst.
          </li>
          <li>Schließt du den Tab, löscht dein Browser den sessionStorage.</li>
        </ul>
        <p>
          Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG: Das Speichern ist unbedingt erforderlich, damit das Formular so
          funktioniert, wie du es nutzen möchtest. Für die Verarbeitung nach dem Absenden gilt Art. 6 Abs. 1 lit. b
          DSGVO.
        </p>
        <p>
          Frühere Versionen dieser Website haben Formulareingaben dauerhaft im localStorage deines Browsers gespeichert.
          Diese alten Einträge löschen wir automatisch, sobald du das Bewerbungsformular oder die Bewerbungsmappe öffnest.
        </p>
      </Chapter>

      <Chapter id="herkunft">
        <p>
          Wir möchten wissen, über welche Wege Bewerbungen zu uns finden, zum Beispiel über Google, Jobbörsen, Anzeigen
          oder Empfehlungen. Dafür liest die Seite beim Aufruf aus:
        </p>
        <ul>
          <li>
            Kampagnen-Parameter in der Adresse (utm_source, utm_medium, utm_campaign, utm_content, utm_term) und einen
            Empfehlungscode (ref)
          </li>
          <li>den Namen der Website, von der du kommst (nur den Host, nicht die vollständige Adresse)</li>
          <li>die Seite, auf der du eingestiegen bist, und wo du das Bewerbungsformular geöffnet hast</li>
        </ul>
        <p>
          Diese Angaben bleiben nur im Arbeitsspeicher der geöffneten Seite. Wir speichern sie nicht auf deinem Gerät;
          nach dem Neuladen oder in einem neuen Tab sind sie weg. Nur wenn du dich bewirbst, gehen sie zusammen mit deiner
          Bewerbung an uns. So zählen wir Bewerbungen pro Kanal.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse ist, zu erkennen, welche
          Stellenanzeigen und Kanäle funktionieren, und sie zu verbessern. Du kannst dieser Verarbeitung widersprechen
          (Art. 21 DSGVO). Wir setzen dafür keine Cookies, keine Tracking-Pixel und keine Analyse-Tools ein.
        </p>
      </Chapter>

      <Chapter id="google-maps">
        <p>
          Unser Einsatzgebiet zeigen wir als Grafik mit Ortsliste, ganz ohne Verbindung zu Google. Zusätzlich kannst du
          eine interaktive Karte von Google Maps laden. Anbieter ist die Google Ireland Limited, Gordon House, Barrow
          Street, Dublin 4, Irland.
        </p>
        <ul>
          <li>
            Bevor du auf „Interaktive Karte laden“ klickst, stellt dein Browser keine Verbindung zu Google her.
          </li>
          <li>
            Nach dem Klick lädt dein Browser die Karte von Servern von Google. Google erhält dabei insbesondere deine
            IP-Adresse, Angaben zu Browser und Gerät sowie die Adresse der aufgerufenen Seite. Dabei können Daten auch an
            die Google LLC in den USA übermittelt werden; Google stützt sich dafür auf das EU-US Data Privacy Framework.
          </li>
          <li>
            Damit du nicht bei jedem Besuch neu klicken musst, speichern wir deine Wahl im localStorage deines Browsers
            (Eintrag „{MAPS_CONSENT_KEY}“ mit dem Zeitpunkt des Klicks).
          </li>
          <li>
            Mit „Karte wieder ausblenden“ widerrufst du deine Einwilligung: Die Karte wird ausgeblendet und der Eintrag
            gelöscht. Die Rechtmäßigkeit der Verarbeitung bis zum Widerruf bleibt davon unberührt.
          </li>
        </ul>
        <p>
          Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG), die du mit dem Klick
          erteilst. Was Google mit den Daten macht, steht in der{' '}
          <a href="https://policies.google.com/privacy">Datenschutzerklärung von Google</a>.
        </p>
      </Chapter>

      <Chapter id="kontakt">
        <p>
          Wenn du uns per Telefon, E-Mail oder WhatsApp kontaktierst, speichern wir deine Angaben einschließlich deiner
          Kontaktdaten, um deine Anfrage zu bearbeiten, und für den Fall von Anschlussfragen. Diese Daten geben wir nicht
          ohne deine Einwilligung weiter. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen).
        </p>
        <h3>WhatsApp</h3>
        <p>
          Auf unseren Seiten findest du Links, über die du uns per WhatsApp schreiben kannst, teils mit einem
          vorausgefüllten Text, zum Beispiel mit deinen Angaben aus dem Bewerbungsformular, falls das Absenden nicht
          klappt. Erst wenn du einen solchen Link antippst, öffnet sich WhatsApp; der vorausgefüllte Text ist dabei Teil
          der Link-Adresse. Abschicken musst du die Nachricht selbst.
        </p>
        <p>
          WhatsApp ist ein Dienst der WhatsApp Ireland Limited (Irland). WhatsApp verarbeitet dabei unter anderem deine
          Telefonnummer und Daten zu deiner Nutzung und kann Daten an die Meta Platforms, Inc. in den USA übermitteln.
          Möchtest du das nicht, erreichst du uns genauso per Telefon oder E-Mail.
        </p>
      </Chapter>

      <Chapter id="cookies-analyse">
        <p>
          Diese Website setzt keine Cookies und nutzt keine Tracking-Pixel und keine Analyse- oder Statistik-Tools.
          Deshalb gibt es auch kein Cookie-Banner. Auf deinem Gerät speichern wir nur, was unter{' '}
          <a href="#entwurf">Entwurf und Bewerbungsmappe im Browser</a> und <a href="#google-maps">Google Maps</a> steht.
        </p>
        <h3>Schriften</h3>
        <p>
          {/* Faktenkorrektur M-019 (E-022, R5-RECHT-01, 10.10.2026): statt „Inter“ die tatsächlich selbst gehosteten
              Schriften (app/fonts, next/font/local); Vermerk in docs/operations/datenschutz-aenderungen.md 2.10. */}
          Wir nutzen die Schriften Bricolage Grotesque, Atkinson Hyperlegible Next und Martian Mono. Sie werden beim
          Erstellen der Website eingebunden und von unserem Hoster zusammen mit den Seiten ausgeliefert. Dein Browser
          stellt dafür keine Verbindung zu Google Fonts oder anderen Dritten her.
        </p>
      </Chapter>

      <Chapter id="betroffenenrechte">
        <p>Du hast nach der DSGVO diese Rechte und kannst sie jederzeit kostenfrei und formlos geltend machen:</p>
        <ul>
          <li>
            <strong>Auskunft (Art. 15 DSGVO):</strong> ob und welche personenbezogenen Daten wir über dich verarbeiten,
            zu welchem Zweck und an wen wir sie weitergegeben haben.
          </li>
          <li>
            <strong>Berichtigung (Art. 16 DSGVO):</strong> die unverzügliche Berichtigung oder Vervollständigung
            unrichtiger Daten, die wir zum Beispiel im Rahmen deiner Bewerbung führen.
          </li>
          <li>
            <strong>Löschung (Art. 17 DSGVO):</strong> die unverzügliche Löschung deiner Daten, sofern keine gesetzlichen
            Aufbewahrungspflichten wie nach HGB oder AO entgegenstehen.
          </li>
          <li>
            <strong>Einschränkung (Art. 18 DSGVO):</strong> Unter bestimmten gesetzlichen Voraussetzungen kannst du
            verlangen, dass wir deine Daten sperren und nur noch aufbewahren.
          </li>
          <li>
            <strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Daten, die du uns bereitgestellt hast, in einem
            strukturierten, gängigen und maschinenlesbaren Format zu erhalten.
          </li>
          <li>
            <strong>Widerspruch (Art. 21 DSGVO):</strong> Einer Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO
            kannst du aus Gründen, die sich aus deiner besonderen Situation ergeben, jederzeit widersprechen.
          </li>
        </ul>
        <h3>Widerruf einer Einwilligung</h3>
        <p>
          Eine erteilte Einwilligung kannst du jederzeit ohne Angabe von Gründen mit Wirkung für die Zukunft widerrufen
          (Art. 7 Abs. 3 DSGVO), zum Beispiel per{' '}
          <a href={mailtoHref(LEGAL_ENTITY.privacyEmail, 'Widerruf Einwilligung Datenschutz')}>
            E-Mail an {LEGAL_ENTITY.privacyEmail}
          </a>
          . Die Einwilligung für Google Maps widerrufst du direkt auf der Seite mit „Karte wieder ausblenden“.
        </p>
        <p>
          Fragen zu deinen Daten, zum Beispiel aus deiner Bewerbung? Schreib an {privacyMail} oder ruf uns an:{' '}
          <a href={LEGAL_ENTITY.phone.href}>{LEGAL_ENTITY.phone.display}</a>.
        </p>
      </Chapter>

      <Chapter id="aufsichtsbehoerde">
        <p>
          Nach Art. 77 DSGVO hast du unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen
          Rechtsbehelfs das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde, wenn du der Ansicht bist, dass
          die Verarbeitung deiner personenbezogenen Daten gegen die DSGVO verstößt. Für uns zuständig ist:
        </p>
        <LegalFacts items={AUTHORITY} />
      </Chapter>
    </RechtDokument>
  );
}
