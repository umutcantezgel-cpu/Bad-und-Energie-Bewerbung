import type { ComponentProps, ReactNode } from 'react';
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { AKZENT_FARBEN, type Fotoform, type MappeDesign } from '@/lib/mappe/blatt/design';
import { SEITENSPALTE } from '@/lib/mappe/blatt/aufbau';
import type { MappeAbschnitt, MappeBerufsstation, MappeDokument, MappeStation } from '@/lib/mappe/blatt/dokument';
import { SCHLICHT, fotoMasse } from '@/lib/mappe/blatt/schlicht';

/**
 * Satz der Mappe-PDF, geteilt von Server und Browser (L4): ohne 'server-only', node:path und Buffer. Der Server
 * (./blatt.tsx, Team-Mail) registriert die Schriften über den Pfad und rendert mit renderToBuffer; der Browser
 * (./browser.tsx, „PDF herunterladen“) über URLs und pdf().toBlob(). Kontaktzeile und Foto setzt nur der Browser:
 * Persönliche Angaben bleiben auf dem Gerät, die Team-PDF hat sie nie (ohne sie ist der Satz genau der bisherige).
 *
 * Bewerbungsmappe als A4-PDF (Schritt 4a, Designs L3), gesetzt wie das Blatt der Vorschau
 * (components/mappe/MappePreview.tsx): Anschreiben und Lebenslauf in einem der drei Designs (lib/mappe/blatt/design.ts):
 * Schlicht (Name, feine Linien), Farbband (Name auf einem Band in der Akzentfarbe, 10 mm vom Papierrand, damit
 * Drucker ohne Randlosdruck nichts abschneiden) und Zweispaltig (Lebenslauf mit getönter Seitenspalte für Schwerpunkte,
 * Sprachen, Führerschein und Interessen). Akzentfarbe für Name, Überschriften und Band; Schriftstil Sachlich (alles Atkinson Hyperlegible Next)
 * oder Markant (Name und Überschriften in Bricolage Grotesque fett). Schriften als statische Schnitte
 * (lib/mappe/schriften), Maße aus lib/mappe/blatt/schlicht.ts.
 *
 * Seitenumbruch: kurze Stationen bleiben ganz, lange brechen zwischen den Aufgaben um (Kopf der Station mit der ersten
 * Aufgabe zusammen), Überschriften nie allein am Seitenende, Ort/Datum und Unterschrift direkt unter dem letzten
 * Abschnitt; Seitenzahlen nur auf Folgeseiten. Keine Silbentrennung; nur Wörter über 40 Zeichen (Adressen, Links)
 * dürfen umbrechen, in der schmalen Seitenspalte von „Zweispaltig“ schon Wörter über 16 Zeichen (trenneSchmal). Gleicher Inhalt und gleiches Datum ergeben dieselben Bytes (feste Erstellungszeit). Ohne Namen
 * (nachgereichte Mappe) steht „Bewerbungsmappe“ im Kopf, und die Unterschriftslinie entfällt.
 *
 * Eigenheiten von react-pdf 4.9, die der Satz umgeht (geprüft mit pdftotext -bbox):
 * - Zeilenhöhen als Faktor rechnet es an Text und View falsch (1,5 ergab 27 statt 15,75 pt); nur an der Seite stimmt
 *   der Faktor, dort verschluckt er aber die Seitenzahlen. Darum feste Zeilenhöhen in pt (zeilenhoehe unten).
 * - „wrap“ gilt schon, wenn die Eigenschaft nur gesetzt ist: immer true oder false übergeben, nie undefined.
 * - Zwischen Satzzeichen und Buchstaben („(Vollzeit“, „„Text“) sieht es eine Trennstelle und setzt dort einen
 *   Bindestrich: Trennen kostet darum viel (STRAFE_TRENNUNG), echte Umbrüche gehen an Leerzeichen.
 */

const SCHRIFT = 'Atkinson Hyperlegible Next';
const TITELSCHRIFT = 'Bricolage Grotesque';

/** Quellen der Schnitte: Dateipfad (Server) oder URL (Browser). */
export interface SchriftQuellen {
  normal: string;
  fett: string;
  /** Bricolage Grotesque fett für „Markant“. */
  titel: string;
}

let registriert = false;
export function schriftenRegistrieren(quellen: SchriftQuellen) {
  if (registriert) return;
  Font.register({
    family: SCHRIFT,
    fonts: [
      { src: quellen.normal, fontWeight: 400 },
      { src: quellen.fett, fontWeight: 700 },
    ],
  });
  // Nur geladen, wenn ein Dokument im Schriftstil „Markant“ sie braucht
  Font.register({ family: TITELSCHRIFT, fonts: [{ src: quellen.titel, fontWeight: 700 }] });
  // Keine Silbentrennung (Kritik am Blatt: getrennte Wörter lesen sich schlecht). Fachwörter wie
  // „Gebäudetechnikinstallationen“ bleiben ganz; nur Wörter über 40 Zeichen (Links, Adressen) dürfen in Stücken umbrechen
  Font.registerHyphenationCallback((wort) => (wort.length > 40 ? (wort.match(/.{1,12}/g) ?? [wort]) : [wort]));
  registriert = true;
}

/**
 * Nach einem Fehler beim Laden der Schriften (Netz): react-pdf merkt sich den Fehlschlag je Schrift; erst nach clear()
 * und neuem Registrieren lädt der nächste Versuch die Dateien neu.
 */
export function schriftenZuruecksetzen() {
  Font.clear();
  registriert = false;
}

/** Kosten einer Trennstelle (Knuth-Plass, unendlich = 10000): nur, wenn ein Wort sonst nicht in die Zeile passt. */
const STRAFE_TRENNUNG = 5000;

/** Längere Wörter dürfen in der Seitenspalte umbrechen (52 mm: rund 20 Zeichen Text, 16 in fetten Überschriften). */
const SCHMAL_WORT_GANZ = 16;

/** Mindestens so viele Zeichen bleiben an jedem Ende eines getrennten Worts zusammen. */
const SCHMAL_REST = 3;

/**
 * Trennstellen in der Seitenspalte (Prüfrunde L5): „Wärmepumpeninbetriebnahme“ oder ein langer eigener Titel liefen
 * sonst über die getönte Fläche in die Hauptspalte. Langes Wort: Trennstelle zwischen je zwei Zeichen (wie
 * overflow-wrap im Browser), außer in den ersten und letzten drei; wegen STRAFE_TRENNUNG trennt der Satz nur, wenn das
 * Wort nicht in die Zeile passt, und dann so spät wie möglich. Kürzere Wörter bleiben ganz.
 */
export function trenneSchmal(wort: string): string[] {
  const zeichen = [...wort];
  if (zeichen.length <= SCHMAL_WORT_GANZ) return [wort];
  const anfang = zeichen.slice(0, SCHMAL_REST).join('');
  const ende = zeichen.slice(-SCHMAL_REST).join('');
  return [anfang, ...zeichen.slice(SCHMAL_REST, -SCHMAL_REST), ende];
}

/** Text der Seitenspalte bekommt die schmalen Trennstellen, sonst bleibt alles wie bisher (gleiche Bytes). */
const schmal = (inSeitenspalte: boolean) => (inSeitenspalte ? { hyphenationCallback: trenneSchmal } : {});

const mm = (wert: number) => `${wert}mm`;
/** Zeilenhöhe in pt aus Schriftgröße und Faktor des Blatts. */
const zeilenhoehe = (groesse: number, faktor: number) => `${Math.round(groesse * faktor * 100) / 100}pt`;
const { rand, schrift, zeile, farbe, abstand, strich } = SCHLICHT;

/** Farbband: Abstand zum Papierrand (mm) – Drucker ohne Randlosdruck schneiden so nichts ab. */
const BAND_RAND = SCHLICHT.bandRand;
/** Zweispaltig: Breite der Seitenspalte (mm). */
const SPALTE_SEITE = SCHLICHT.seitenspalte;
/** Schrift auf dem Band: Papierweiß (≥ 6,2 : 1 auf jedem Akzent, scripts/qa/check-contrast.mjs). */
const WEISS = farbe.papier;

const stil = StyleSheet.create({
  seite: {
    paddingTop: mm(rand.oben),
    paddingRight: mm(rand.rechts),
    paddingBottom: mm(rand.unten),
    paddingLeft: mm(rand.links),
    fontFamily: SCHRIFT,
    fontSize: schrift.text,
    color: farbe.tinte,
    backgroundColor: farbe.papier,
  },
  inhalt: { lineHeight: zeilenhoehe(schrift.text, zeile.text) },
  kopf: {
    paddingBottom: mm(abstand.kopfUnten),
    borderBottomWidth: strich.fein,
    borderBottomColor: farbe.linie,
    borderBottomStyle: 'solid',
  },
  band: {
    marginTop: mm(BAND_RAND - rand.oben),
    marginLeft: mm(BAND_RAND - rand.links),
    marginRight: mm(BAND_RAND - rand.rechts),
    paddingTop: mm(8),
    paddingBottom: mm(7),
    paddingLeft: mm(rand.links - BAND_RAND),
    paddingRight: mm(rand.rechts - BAND_RAND),
    borderRadius: mm(1),
  },
  kopfUeberschrift: {
    fontSize: schrift.kopf,
    lineHeight: zeilenhoehe(schrift.kopf, zeile.kopf),
    fontWeight: 700,
    marginBottom: 4,
  },
  name: {
    fontSize: schrift.name,
    lineHeight: zeilenhoehe(schrift.name, zeile.name),
    fontWeight: 700,
    letterSpacing: -0.22,
  },
  /** Kontaktzeile unter dem Namen (Vorschau: Letterhead, .small, gap-1 = 3 pt). */
  kontakt: { marginTop: 3, fontSize: schrift.klein, lineHeight: zeilenhoehe(schrift.klein, zeile.klein) },
  /** Kopf mit Foto: Text links, Foto rechts oben (Vorschau: header flex, items-start, justify-between, gap-8). */
  kopfZeile: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kopfText: { flex: 1, marginRight: mm(SCHLICHT.foto.abstand) },
  foto: { objectFit: 'cover', flexShrink: 0 },
  empfaenger: { marginTop: mm(abstand.empfaengerOben) },
  datum: { marginTop: mm(abstand.datumOben), textAlign: 'right' },
  betreff: { marginTop: mm(abstand.betreffOben), fontWeight: 700 },
  brief: { marginTop: mm(abstand.briefOben) },
  abschnitt: { marginTop: mm(abstand.abschnittOben) },
  ueberschrift: {
    fontSize: schrift.kopf,
    lineHeight: zeilenhoehe(schrift.kopf, zeile.kopf),
    fontWeight: 700,
    paddingBottom: mm(abstand.ueberschriftUnten),
    borderBottomWidth: strich.fein,
    borderBottomColor: farbe.linie,
    borderBottomStyle: 'solid',
  },
  station: { marginTop: mm(abstand.abschnittInnen) },
  zeile: { flexDirection: 'row' },
  zeit: { width: mm(SCHLICHT.spalteZeit), marginRight: mm(SCHLICHT.spalteAbstand), color: farbe.tinteLeise },
  zeitOben: { color: farbe.tinteLeise },
  angaben: { flex: 1 },
  /** Weitere Aufgaben einer langen Station: eingerückt bis zur Spalte Angaben. */
  weitere: { marginLeft: mm(SCHLICHT.spalteZeit + SCHLICHT.spalteAbstand) },
  fett: { fontWeight: 700 },
  leise: { color: farbe.tinteLeise },
  aufgaben: { marginTop: mm(abstand.aufgabenOben) },
  punkt: { flexDirection: 'row' },
  punktZeichen: { width: mm(abstand.einzug) },
  punktText: { flex: 1 },
  spalten: { flexDirection: 'row', marginTop: mm(abstand.abschnittOben) },
  // So hoch wie ihr Inhalt (wie .spalten in der Vorschau): keine leere getönte Spalte neben langen Stationen
  seitenspalte: {
    width: mm(SPALTE_SEITE),
    marginRight: mm(SCHLICHT.spalteAbstand),
    padding: mm(4),
    borderRadius: mm(1),
    alignSelf: 'flex-start',
  },
  hauptspalte: { flex: 1 },
  fuss: { marginTop: mm(abstand.fussOben), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  fussDatum: { flexShrink: 0, marginRight: mm(SCHLICHT.spalteAbstand) },
  unterschrift: {
    minWidth: mm(abstand.unterschriftBreite),
    // Ein langer Name bricht in der Unterschrift um, statt über das Datum zu laufen
    maxWidth: '65%',
    paddingTop: mm(abstand.ueberschriftUnten),
    borderTopWidth: strich.fein,
    borderTopColor: farbe.linieStark,
    borderTopStyle: 'solid',
    fontSize: schrift.klein,
    lineHeight: zeilenhoehe(schrift.klein, zeile.klein),
    color: farbe.tinteLeise,
  },
  seitenzahl: {
    position: 'absolute',
    bottom: mm(8),
    left: mm(rand.links),
    right: mm(rand.rechts),
    textAlign: 'right',
    fontSize: schrift.klein,
    color: farbe.tinteLeise,
  },
});

/** Farben und Titelschrift eines Designs. */
interface Thema {
  design: MappeDesign;
  akzent: string;
  toenung: string;
  titel: string;
}

function themaFuer(design: MappeDesign): Thema {
  const { farbe: akzent, toenung } = AKZENT_FARBEN[design.akzent];
  return { design, akzent, toenung, titel: design.schrift === 'markant' ? TITELSCHRIFT : SCHRIFT };
}

/** Text mit hoher Trennstrafe (siehe oben): umbrochen wird an Leerzeichen. */
function Satz(props: ComponentProps<typeof Text>) {
  return <Text hyphenationPenalty={STRAFE_TRENNUNG} {...props} />;
}

/** Seitenzahl nur auf Folgeseiten („Seite 2 von 3“). */
function Seitenzahl() {
  return <Text style={stil.seitenzahl} fixed render={({ pageNumber, totalPages }) => (pageNumber > 1 ? `Seite ${pageNumber} von ${totalPages}` : '')} />;
}

/** Nur die PDF des Bewerbers (Browser): Kontaktzeile und Foto als JPEG-data:-URL mit seiner Form. */
export interface MappePdfPersoenlich {
  /** Wohnort · Telefon · E-Mail wie in der Vorschau. */
  kontakt?: string | null;
  foto?: { src: string; form: Fotoform } | null;
}

/** Foto wie .photo der Vorschau: 35 × 45 mm, rund 35 × 35; Ecken je Form. */
function fotoStil(form: Fotoform) {
  const { breite, hoehe, radius } = fotoMasse(form);
  return { width: mm(breite), height: mm(hoehe), borderRadius: mm(radius) };
}

function Kopf({ name, ueberschrift, t, kontakt, foto }: { name: string; ueberschrift?: string; t: Thema } & MappePdfPersoenlich) {
  const band = t.design.vorlage === 'farbband';
  const rahmen = band ? [stil.band, { backgroundColor: t.akzent }] : [stil.kopf];
  const zeilen = (
    <>
      {/* „Lebenslauf“ wie in der Vorschau (.heading): Akzentfarbe, auf dem Band weiß, in der Titelschrift */}
      {ueberschrift ? (
        <Satz style={[stil.kopfUeberschrift, { color: band ? WEISS : t.akzent, fontFamily: t.titel }]}>{ueberschrift}</Satz>
      ) : null}
      <Satz style={[stil.name, { color: band ? WEISS : t.akzent, fontFamily: t.titel }]}>{name}</Satz>
      {/* Kontaktzeile wie im Letterhead: klein, Tinte leise, auf dem Band weiß */}
      {/* Nie trennen: Eine lange E-Mail-Adresse bekäme sonst einen Bindestrich, der nicht zur Adresse gehört */}
      {kontakt ? (
        <Satz style={[stil.kontakt, { color: band ? WEISS : farbe.tinteLeise }]} hyphenationCallback={(wort) => [wort]}>
          {kontakt}
        </Satz>
      ) : null}
    </>
  );
  if (!foto) return <View style={band ? rahmen : stil.kopf}>{zeilen}</View>;
  return (
    <View style={[...rahmen, stil.kopfZeile]}>
      <View style={stil.kopfText}>{zeilen}</View>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- Image von react-pdf (Bild in der PDF), kein HTML-img */}
      <Image src={foto.src} style={[stil.foto, fotoStil(foto.form)]} />
    </View>
  );
}

function Punkt({ eintrag, seitenspalte = false }: { eintrag: string; seitenspalte?: boolean }) {
  return (
    <View style={stil.punkt} wrap={false}>
      <Text style={stil.punktZeichen}>•</Text>
      <Satz style={stil.punktText} {...schmal(seitenspalte)}>
        {eintrag}
      </Satz>
    </View>
  );
}

function Punkte({ eintraege, seitenspalte = false }: { eintraege: readonly string[]; seitenspalte?: boolean }) {
  return eintraege.map((eintrag, i) => <Punkt key={i} eintrag={eintrag} seitenspalte={seitenspalte} />);
}

/**
 * Zeichen je Zeile in der Spalte Angaben, eher zu wenige: 121 mm bei 10,5 pt; in der Hauptspalte von „Zweispaltig“
 * (107 mm) entsprechend weniger. Für die Schätzung unten.
 */
const ZEICHEN_JE_ZEILE = 55;
const ZEICHEN_JE_ZEILE_EINSPALTIG = 48;
/** Stationen bis zu so vielen Zeilen (gut ein Drittel der Seite) bleiben ganz; längere dürfen zwischen Aufgaben umbrechen. */
const ZEILEN_GANZ = 16;

/** Grob geschätzte Zeilen einer Station in der Spalte Angaben (einspaltig: Zeitraum als eigene Zeile über dem Titel). */
export function geschaetzteZeilen(station: MappeStation | MappeBerufsstation, einspaltig = false): number {
  const je = einspaltig ? ZEICHEN_JE_ZEILE_EINSPALTIG : ZEICHEN_JE_ZEILE;
  const zeilen = (text: string) => (text ? Math.ceil(text.length / je) : 0);
  const aufgaben = 'aufgaben' in station ? station.aufgaben : [];
  const zeit = einspaltig ? zeilen(station.zeit) : 0;
  return zeit + zeilen(station.titel) + zeilen(station.ort) + aufgaben.reduce((summe, aufgabe) => summe + zeilen(aufgabe), 0);
}

function Abschnitt({
  titel,
  t,
  erster = false,
  seitenspalte = false,
  children,
}: {
  titel: string;
  t: Thema;
  erster?: boolean;
  seitenspalte?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={erster ? {} : stil.abschnitt}>
      {/* Überschrift nicht allein am Seitenende: mindestens eine Zeile Inhalt muss mit auf die Seite */}
      <Satz style={[stil.ueberschrift, { color: t.akzent, fontFamily: t.titel }]} minPresenceAhead={40} {...schmal(seitenspalte)}>
        {titel}
      </Satz>
      {children}
    </View>
  );
}

/**
 * Eine Station: Zeitraum, Titel, Ort und die erste Aufgabe stehen zusammen. Eine kurze Station bleibt ganz auf einer
 * Seite; bei einer langen (viele oder lange Aufgaben) folgen die weiteren Aufgaben darunter und dürfen auf die nächste
 * Seite umbrechen – sonst passte die Station auf keine Seite. `einspaltig` (Hauptspalte von „Zweispaltig“): der
 * Zeitraum steht über dem Titel statt in einer eigenen Spalte.
 */
function Station({ station, einspaltig = false }: { station: MappeStation | MappeBerufsstation; einspaltig?: boolean }) {
  const [erste, ...weitere] = 'aufgaben' in station ? station.aufgaben : [];
  const angaben = (
    <>
      {einspaltig && station.zeit ? <Satz style={stil.zeitOben}>{station.zeit}</Satz> : null}
      {station.titel ? <Satz style={stil.fett}>{station.titel}</Satz> : null}
      {station.ort ? <Satz style={stil.leise}>{station.ort}</Satz> : null}
      {erste ? (
        <View style={stil.aufgaben}>
          <Punkt eintrag={erste} />
        </View>
      ) : null}
    </>
  );
  return (
    <View style={stil.station} wrap={geschaetzteZeilen(station, einspaltig) > ZEILEN_GANZ}>
      {einspaltig ? (
        // Ohne flex: 1 (stil.angaben) – in einer Spalte fiele die Höhe sonst auf null, und die Zeilen lägen übereinander
        <View wrap={false}>{angaben}</View>
      ) : (
        <View style={stil.zeile} wrap={false}>
          <Satz style={stil.zeit}>{station.zeit}</Satz>
          <View style={stil.angaben}>{angaben}</View>
        </View>
      )}
      {weitere.length > 0 ? (
        <View style={einspaltig ? {} : stil.weitere}>
          <Punkte eintraege={weitere} />
        </View>
      ) : null}
    </View>
  );
}

/**
 * Inhalt eines Abschnitts (L5): Stationen, Punkte oder Text. `einspaltig`: Hauptspalte von „Zweispaltig“;
 * `seitenspalte`: die schmale getönte Spalte daneben (Stationen stehen dort nie).
 */
function AbschnittInhalt({ abschnitt, einspaltig, seitenspalte }: { abschnitt: MappeAbschnitt; einspaltig: boolean; seitenspalte: boolean }) {
  switch (abschnitt.art) {
    case 'beruf':
    case 'ausbildung':
      return abschnitt.stationen.map((station, i) => <Station key={i} station={station} einspaltig={einspaltig} />);
    case 'punkte':
      return (
        <View style={stil.aufgaben}>
          <Punkte eintraege={abschnitt.punkte} seitenspalte={seitenspalte} />
        </View>
      );
    case 'text':
      return (
        <Satz style={stil.aufgaben} {...schmal(seitenspalte)}>
          {abschnitt.text}
        </Satz>
      );
  }
}

function Lebenslaufteile({ lebenslauf, t }: { lebenslauf: NonNullable<MappeDokument['lebenslauf']>; t: Thema }) {
  // Zweispaltig: kurze Abschnitte (Schwerpunkte, Sprachen, Führerschein, Interessen) in der getönten Seitenspalte, die
  // übrigen daneben. Zwei Spalten nur, wenn beide etwas haben (wie die Vorschau); sonst genau wie Schlicht
  const seite = lebenslauf.abschnitte.filter((abschnitt) => SEITENSPALTE.has(abschnitt.id));
  const haupt = lebenslauf.abschnitte.filter((abschnitt) => !SEITENSPALTE.has(abschnitt.id));
  const spalten = t.design.vorlage === 'zweispaltig' && seite.length > 0 && haupt.length > 0;
  const setze = (liste: readonly MappeAbschnitt[], einspaltig: boolean, seitenspalte = false) =>
    liste.map((abschnitt, i) => (
      <Abschnitt key={abschnitt.id} titel={abschnitt.titel} t={t} erster={spalten && i === 0} seitenspalte={seitenspalte}>
        <AbschnittInhalt abschnitt={abschnitt} einspaltig={einspaltig} seitenspalte={seitenspalte} />
      </Abschnitt>
    ));

  if (spalten) {
    return (
      <View style={stil.spalten}>
        <View style={[stil.seitenspalte, { backgroundColor: t.toenung }]}>{setze(seite, false, true)}</View>
        <View style={stil.hauptspalte}>{setze(haupt, true)}</View>
      </View>
    );
  }
  return <>{setze(lebenslauf.abschnitte, false)}</>;
}

export function MappePdf({
  dokument,
  erstellt,
  seitenzahlen,
  kontakt = null,
  foto = null,
}: { dokument: MappeDokument; erstellt: Date; seitenzahlen: boolean } & MappePdfPersoenlich) {
  const { anschreiben, lebenslauf } = dokument;
  const kopf = dokument.name ?? 'Bewerbungsmappe';
  const t = themaFuer(dokument.design);
  return (
    <Document
      title={dokument.titel}
      author={dokument.name ?? undefined}
      subject={dokument.betreff}
      creator="Bad und Energie Karriere"
      producer="Bad und Energie Karriere"
      language="de-DE"
      creationDate={erstellt}
      modificationDate={erstellt}
    >
      {anschreiben ? (
        <Page size="A4" style={stil.seite}>
          <View style={stil.inhalt}>
            <Kopf name={kopf} t={t} kontakt={kontakt} />
            <View style={stil.empfaenger}>
              {anschreiben.empfaenger.map((eintrag, i) => (
                <Satz key={i}>{eintrag}</Satz>
              ))}
            </View>
            <Satz style={stil.datum}>{dokument.datum}</Satz>
            <Satz style={stil.betreff}>{dokument.betreff}</Satz>
            <Satz style={stil.brief}>{anschreiben.text}</Satz>
          </View>
          {seitenzahlen ? <Seitenzahl /> : null}
        </Page>
      ) : null}
      {lebenslauf ? (
        <Page size="A4" style={stil.seite}>
          <View style={stil.inhalt}>
            <Kopf name={kopf} ueberschrift="Lebenslauf" t={t} kontakt={kontakt} foto={foto} />
            <Satz style={stil.betreff}>{dokument.betreff}</Satz>
            <Lebenslaufteile lebenslauf={lebenslauf} t={t} />
            <View style={stil.fuss} wrap={false}>
              <Satz style={stil.fussDatum}>{dokument.datum}</Satz>
              {dokument.name ? <Satz style={stil.unterschrift}>{dokument.name}</Satz> : null}
            </View>
          </View>
          {seitenzahlen ? <Seitenzahl /> : null}
        </Page>
      ) : null}
    </Document>
  );
}

/**
 * Seitenobjekte zählen: pdfkit schreibt jedes als eigene Zeile „/Type /Page“ (unkomprimiert); am Zeilenanfang
 * verankert, damit ein Name wie „Max /Type /Page“ im Titel nicht mitzählt (in Texten maskiert pdfkit Umbrüche).
 * `latin1`: die PDF als Text, ein Zeichen je Byte (Server: Buffer.toString('latin1'), Browser: TextDecoder).
 */
export function seitenZaehlen(latin1: string): number {
  return latin1.match(/^\/Type \/Page$/gm)?.length ?? 0;
}
