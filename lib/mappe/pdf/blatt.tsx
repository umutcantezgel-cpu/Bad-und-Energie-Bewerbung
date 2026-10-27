import 'server-only';
import path from 'node:path';
import type { ComponentProps, ReactNode } from 'react';
import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import { AKZENT_FARBEN, type MappeDesign } from '@/lib/mappe/blatt/design';
import type { MappeBerufsstation, MappeDokument, MappeStation } from '@/lib/mappe/blatt/dokument';
import { SCHLICHT } from '@/lib/mappe/blatt/schlicht';

/**
 * Bewerbungsmappe als A4-PDF (Schritt 4a, Designs L3), gesetzt wie das Blatt der Vorschau
 * (components/mappe/MappePreview.tsx): Anschreiben und Lebenslauf in einem der drei Designs (lib/mappe/blatt/design.ts):
 * Schlicht (Name, feine Linien), Farbband (Name auf einem Band in der Akzentfarbe, 10 mm vom Papierrand, damit
 * Drucker ohne Randlosdruck nichts abschneiden) und Zweispaltig (Lebenslauf mit getönter Seitenspalte für die
 * Schwerpunkte). Akzentfarbe für Name, Überschriften und Band; Schriftstil Sachlich (alles Atkinson Hyperlegible Next)
 * oder Markant (Name und Überschriften in Bricolage Grotesque fett). Schriften als statische Schnitte
 * (lib/mappe/schriften), Maße aus lib/mappe/blatt/schlicht.ts. @react-pdf/renderer steht in Nexts Liste der
 * Server-Pakete ohne Bündelung; die Schriften liest es über den Pfad (next.config.ts nimmt sie in die Funktionen auf).
 *
 * Seitenumbruch: kurze Stationen bleiben ganz, lange brechen zwischen den Aufgaben um (Kopf der Station mit der ersten
 * Aufgabe zusammen), Überschriften nie allein am Seitenende, Ort/Datum und Unterschrift direkt unter dem letzten
 * Abschnitt; Seitenzahlen nur auf Folgeseiten. Keine Silbentrennung; nur Wörter über 40 Zeichen (Adressen, Links)
 * dürfen umbrechen. Gleicher Inhalt und gleiches Datum ergeben dieselben Bytes (feste Erstellungszeit). Ohne Namen
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
const SCHRIFTEN = path.join(process.cwd(), 'lib/mappe/schriften');

let registriert = false;
function schriftenRegistrieren() {
  if (registriert) return;
  Font.register({
    family: SCHRIFT,
    fonts: [
      { src: path.join(SCHRIFTEN, 'atkinson-hyperlegible-next-400.ttf'), fontWeight: 400 },
      { src: path.join(SCHRIFTEN, 'atkinson-hyperlegible-next-700.ttf'), fontWeight: 700 },
    ],
  });
  // Nur geladen, wenn ein Dokument im Schriftstil „Markant“ sie braucht
  Font.register({ family: TITELSCHRIFT, fonts: [{ src: path.join(SCHRIFTEN, 'bricolage-grotesque-700.ttf'), fontWeight: 700 }] });
  // Keine Silbentrennung (Kritik am Blatt: getrennte Wörter lesen sich schlecht). Fachwörter wie
  // „Gebäudetechnikinstallationen“ bleiben ganz; nur Wörter über 40 Zeichen (Links, Adressen) dürfen in Stücken umbrechen
  Font.registerHyphenationCallback((wort) => (wort.length > 40 ? (wort.match(/.{1,12}/g) ?? [wort]) : [wort]));
  registriert = true;
}

/** Kosten einer Trennstelle (Knuth-Plass, unendlich = 10000): nur, wenn ein Wort sonst nicht in die Zeile passt. */
const STRAFE_TRENNUNG = 5000;

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
    color: farbe.tinteLeise,
    marginBottom: 4,
  },
  name: {
    fontSize: schrift.name,
    lineHeight: zeilenhoehe(schrift.name, zeile.name),
    fontWeight: 700,
    letterSpacing: -0.22,
  },
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

function Kopf({ name, ueberschrift, t }: { name: string; ueberschrift?: string; t: Thema }) {
  const band = t.design.vorlage === 'farbband';
  return (
    <View style={band ? [stil.band, { backgroundColor: t.akzent }] : stil.kopf}>
      {ueberschrift ? <Satz style={[stil.kopfUeberschrift, band ? { color: WEISS } : {}]}>{ueberschrift}</Satz> : null}
      <Satz style={[stil.name, { color: band ? WEISS : t.akzent, fontFamily: t.titel }]}>{name}</Satz>
    </View>
  );
}

function Punkt({ eintrag }: { eintrag: string }) {
  return (
    <View style={stil.punkt} wrap={false}>
      <Text style={stil.punktZeichen}>•</Text>
      <Satz style={stil.punktText}>{eintrag}</Satz>
    </View>
  );
}

function Punkte({ eintraege }: { eintraege: readonly string[] }) {
  return eintraege.map((eintrag, i) => <Punkt key={i} eintrag={eintrag} />);
}

/** Zeichen je Zeile in der Spalte Angaben, eher zu wenige (121 mm bei 10,5 pt): für die Schätzung unten. */
const ZEICHEN_JE_ZEILE = 55;
/** Stationen bis zu so vielen Zeilen (gut ein Drittel der Seite) bleiben ganz; längere dürfen zwischen Aufgaben umbrechen. */
const ZEILEN_GANZ = 16;

/** Grob geschätzte Zeilen einer Station in der Spalte Angaben. */
export function geschaetzteZeilen(station: MappeStation | MappeBerufsstation): number {
  const zeilen = (text: string) => (text ? Math.ceil(text.length / ZEICHEN_JE_ZEILE) : 0);
  const aufgaben = 'aufgaben' in station ? station.aufgaben : [];
  return zeilen(station.titel) + zeilen(station.ort) + aufgaben.reduce((summe, aufgabe) => summe + zeilen(aufgabe), 0);
}

function Abschnitt({ titel, t, erster = false, children }: { titel: string; t: Thema; erster?: boolean; children: ReactNode }) {
  return (
    <View style={erster ? {} : stil.abschnitt}>
      {/* Überschrift nicht allein am Seitenende: mindestens eine Zeile Inhalt muss mit auf die Seite */}
      <Satz style={[stil.ueberschrift, { color: t.akzent, fontFamily: t.titel }]} minPresenceAhead={40}>
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
    <View style={stil.station} wrap={geschaetzteZeilen(station) > ZEILEN_GANZ}>
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

function Lebenslaufteile({ lebenslauf, t }: { lebenslauf: NonNullable<MappeDokument['lebenslauf']>; t: Thema }) {
  const beruf =
    lebenslauf.beruf.length > 0 ? (
      <Abschnitt titel="Berufserfahrung" t={t} erster={t.design.vorlage === 'zweispaltig'}>
        {lebenslauf.beruf.map((station, i) => (
          <Station key={i} station={station} einspaltig={t.design.vorlage === 'zweispaltig'} />
        ))}
      </Abschnitt>
    ) : null;
  const ausbildung =
    lebenslauf.ausbildung.length > 0 ? (
      <Abschnitt titel="Schule und Ausbildung" t={t} erster={t.design.vorlage === 'zweispaltig' && lebenslauf.beruf.length === 0}>
        {lebenslauf.ausbildung.map((station, i) => (
          <Station key={i} station={station} einspaltig={t.design.vorlage === 'zweispaltig'} />
        ))}
      </Abschnitt>
    ) : null;
  const schwerpunkte =
    lebenslauf.schwerpunkte.length > 0 ? (
      <Abschnitt titel="Schwerpunkte" t={t} erster={t.design.vorlage === 'zweispaltig'}>
        <View style={stil.aufgaben}>
          <Punkte eintraege={lebenslauf.schwerpunkte} />
        </View>
      </Abschnitt>
    ) : null;

  // Zweispaltig mit Schwerpunkten: Seitenspalte (getönt) links, Stationen rechts; ohne Schwerpunkte wie Schlicht
  if (t.design.vorlage === 'zweispaltig' && schwerpunkte && (beruf || ausbildung)) {
    return (
      <View style={stil.spalten}>
        <View style={[stil.seitenspalte, { backgroundColor: t.toenung }]}>{schwerpunkte}</View>
        <View style={stil.hauptspalte}>
          {beruf}
          {ausbildung}
        </View>
      </View>
    );
  }
  return (
    <>
      {beruf}
      {ausbildung}
      {schwerpunkte}
    </>
  );
}

function MappePdf({ dokument, erstellt, seitenzahlen }: { dokument: MappeDokument; erstellt: Date; seitenzahlen: boolean }) {
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
            <Kopf name={kopf} t={t} />
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
            <Kopf name={kopf} ueberschrift="Lebenslauf" t={t} />
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

export interface MappePdfErgebnis {
  pdf: Buffer;
  seiten: number;
}

/** PDF der Mappe; `erstellt` steht als Erstellungszeit in der Datei (gleiche Eingaben, gleiche Bytes). */
export async function mappePdf(dokument: MappeDokument, erstellt: Date): Promise<MappePdfErgebnis> {
  schriftenRegistrieren();
  let pdf: Buffer;
  try {
    pdf = await renderToBuffer(<MappePdf dokument={dokument} erstellt={erstellt} seitenzahlen />);
  } catch {
    // Rückfall ohne Seitenzahlen: Ein Fehler beim Setzen der Seitenzahlen (fixed mit render) soll die Mappe nicht kosten
    pdf = await renderToBuffer(<MappePdf dokument={dokument} erstellt={erstellt} seitenzahlen={false} />);
  }
  // Seitenobjekte zählen: pdfkit schreibt jedes als eigene Zeile „/Type /Page“ (unkomprimiert); am Zeilenanfang
  // verankert, damit ein Name wie „Max /Type /Page“ im Titel nicht mitzählt (in Texten maskiert pdfkit Umbrüche)
  const seiten = pdf.toString('latin1').match(/^\/Type \/Page$/gm)?.length ?? 0;
  return { pdf, seiten };
}
