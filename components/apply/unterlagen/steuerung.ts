/**
 * Steuerung der Unterlagen-Auswahl (E-BEW-012) ohne React: Zustand, Auswahl, Übertragung über den Adapter,
 * Entfernen und Abschluss. Die Oberfläche (UnterlagenAuswahl) abonniert sie über useSyncExternalStore; die Tests
 * treiben sie mit einer Attrappe des Adapters.
 *
 * Ehrlichkeit (E-BEW-033): Eine Datei heißt erst „übertragen“, wenn der Adapter die Übertragung bestätigt hat;
 * einen Status „verifiziert“ gibt es hier nicht, den vergibt nur das Cockpit nach der Prüfung.
 */
import type { UploadAdapter, UploadNachweis, UploadSitzung } from './adapter';
import { type DateiAngaben, pruefeDatei, UNTERLAGEN_FEHLER, UNTERLAGEN_GRENZEN } from './regeln';

export type EintragStatus = 'laedt' | 'uebertragen' | 'fehler';

export interface UnterlagenEintrag {
  schluessel: string;
  name: string;
  groesse: number;
  status: EintragStatus;
  /** Übertragener Anteil 0…1. */
  anteil: number;
  /** Ursache und nächster Schritt, nur bei `fehler`. */
  fehler?: string;
}

export type AbschlussStatus = 'offen' | 'sendet' | 'abgeschlossen' | 'fehler';

export interface UnterlagenZustand {
  eintraege: readonly UnterlagenEintrag[];
  /** Abgelehnte Dateien der letzten Auswahl (Typ, Größe, Anzahl). */
  meldungen: readonly string[];
  abschluss: AbschlussStatus;
}

export const LEERER_ZUSTAND: UnterlagenZustand = Object.freeze({ eintraege: [], meldungen: [], abschluss: 'offen' });

export const UEBERTRAGUNG_FEHLER = 'Die Übertragung hat nicht geklappt. Versuch es noch einmal oder schick die Datei per WhatsApp oder E-Mail.';
export const ENTFERNEN_FEHLER = 'Entfernen hat nicht geklappt. Versuch es noch einmal.';

/** Eine gewählte Datei: Blob mit Name, Größe und Typ (File erfüllt das). */
export type WaehlbareDatei = Blob & DateiAngaben;

export interface UnterlagenSteuerung {
  zustand(): UnterlagenZustand;
  abonnieren(hoerer: () => void): () => void;
  /** Prüft die Auswahl, übernimmt gültige Dateien in die Liste und überträgt sie. */
  waehlen(dateien: readonly WaehlbareDatei[]): Promise<void>;
  /** Bricht eine laufende Übertragung ab oder entfernt eine übertragene Datei. */
  entfernen(schluessel: string): Promise<void>;
  /** Meldet den Abschluss für alle übertragenen Dateien. */
  abschliessen(): Promise<void>;
}

export interface SteuerungOptionen {
  adapter: UploadAdapter;
  nachweis?: UploadNachweis | null;
}

const zaehltMit = (eintrag: UnterlagenEintrag) => eintrag.status !== 'fehler';

export function erstelleSteuerung({ adapter, nachweis = null }: SteuerungOptionen): UnterlagenSteuerung {
  let zustand: UnterlagenZustand = LEERER_ZUSTAND;
  let sitzung: Promise<UploadSitzung> | null = null;
  let zaehler = 0;
  const hoerer = new Set<() => void>();
  const abbrueche = new Map<string, AbortController>();
  const serverIds = new Map<string, string>();

  const setze = (naechster: UnterlagenZustand) => {
    zustand = naechster;
    for (const h of hoerer) h();
  };
  const aendere = (schluessel: string, teil: Partial<UnterlagenEintrag>) =>
    setze({ ...zustand, eintraege: zustand.eintraege.map((e) => (e.schluessel === schluessel ? { ...e, ...teil } : e)) });
  const ohne = (schluessel: string) =>
    setze({ ...zustand, eintraege: zustand.eintraege.filter((e) => e.schluessel !== schluessel) });
  const vorhanden = (schluessel: string) => zustand.eintraege.some((e) => e.schluessel === schluessel);

  function holeSitzung(): Promise<UploadSitzung> {
    if (!sitzung) {
      sitzung = adapter.sitzungAnlegen(nachweis);
      // Schlägt das Anlegen fehl, darf die nächste Auswahl es erneut versuchen.
      sitzung.catch(() => {
        sitzung = null;
      });
    }
    return sitzung;
  }

  async function uebertrage(schluessel: string, datei: WaehlbareDatei, mime: string): Promise<void> {
    const abbruch = new AbortController();
    abbrueche.set(schluessel, abbruch);
    try {
      const s = await holeSitzung();
      const { id } = await s.hochladen(
        { datei, name: datei.name, mime, groesse: datei.size },
        (anteil) => {
          if (!abbruch.signal.aborted && vorhanden(schluessel)) aendere(schluessel, { anteil: Math.min(Math.max(anteil, 0), 1) });
        },
        abbruch.signal,
      );
      if (abbruch.signal.aborted || !vorhanden(schluessel)) return;
      serverIds.set(schluessel, id);
      aendere(schluessel, { status: 'uebertragen', anteil: 1 });
    } catch {
      if (abbruch.signal.aborted || !vorhanden(schluessel)) return;
      aendere(schluessel, { status: 'fehler', fehler: UEBERTRAGUNG_FEHLER });
    } finally {
      abbrueche.delete(schluessel);
    }
  }

  return {
    zustand: () => zustand,

    abonnieren(h) {
      hoerer.add(h);
      return () => hoerer.delete(h);
    },

    async waehlen(dateien) {
      if (zustand.abschluss === 'abgeschlossen' || zustand.abschluss === 'sendet') return;
      const meldungen: string[] = [];
      const neue: { eintrag: UnterlagenEintrag; datei: WaehlbareDatei; mime: string }[] = [];
      let frei = UNTERLAGEN_GRENZEN.maxDateien - zustand.eintraege.filter(zaehltMit).length;
      for (const datei of dateien) {
        const pruefung = pruefeDatei(datei);
        if (!pruefung.ok) {
          meldungen.push(pruefung.text);
          continue;
        }
        if (frei <= 0) {
          meldungen.push(UNTERLAGEN_FEHLER.anzahl(datei.name));
          continue;
        }
        frei -= 1;
        zaehler += 1;
        neue.push({
          eintrag: { schluessel: `u${zaehler}`, name: datei.name, groesse: datei.size, status: 'laedt', anteil: 0 },
          datei,
          mime: pruefung.mime,
        });
      }
      setze({ ...zustand, eintraege: [...zustand.eintraege, ...neue.map((n) => n.eintrag)], meldungen, abschluss: 'offen' });
      await Promise.all(neue.map((n) => uebertrage(n.eintrag.schluessel, n.datei, n.mime)));
    },

    async entfernen(schluessel) {
      const eintrag = zustand.eintraege.find((e) => e.schluessel === schluessel);
      if (!eintrag || zustand.abschluss === 'sendet' || zustand.abschluss === 'abgeschlossen') return;
      const laufend = abbrueche.get(schluessel);
      if (laufend) {
        laufend.abort();
        ohne(schluessel);
        return;
      }
      const id = serverIds.get(schluessel);
      if (eintrag.status === 'uebertragen' && id) {
        try {
          await (await holeSitzung()).entfernen(id);
        } catch {
          aendere(schluessel, { fehler: ENTFERNEN_FEHLER });
          return;
        }
        serverIds.delete(schluessel);
      }
      ohne(schluessel);
    },

    async abschliessen() {
      const ids = zustand.eintraege
        .filter((e) => e.status === 'uebertragen')
        .map((e) => serverIds.get(e.schluessel))
        .filter((id): id is string => id !== undefined);
      if (ids.length === 0 || zustand.eintraege.some((e) => e.status === 'laedt')) return;
      setze({ ...zustand, abschluss: 'sendet' });
      try {
        await (await holeSitzung()).abschliessen(ids);
        setze({ ...zustand, abschluss: 'abgeschlossen', meldungen: [] });
      } catch {
        setze({ ...zustand, abschluss: 'fehler' });
      }
    },
  };
}
