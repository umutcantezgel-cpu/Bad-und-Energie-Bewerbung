'use client';

import { useCallback, useEffect, useRef } from 'react';
import { WHATSAPP_ZEICHEN } from '../zeichen';
import styles from './knopf.module.css';
import { LEERE_BILANZ, SPRUCH_AUFRUF, wurfSpruch, type WurfBilanz } from './spruch';
import { imRahmen, ruht, schritt, wurfTempo, type Probe, type WurfKoerper, type WurfRahmen } from './wurf';

/** Name für Screenreader und Linkprüfung: eigener Ankertext, damit er keinem anderen WhatsApp-Link gleicht. */
export const KNOPF_NAME = 'WhatsApp-Knopf: Nachricht schreiben (öffnet in neuem Tab)';

type Modus = 'ruht' | 'bereit' | 'gezogen' | 'fliegt' | 'rastet';

/** Ab dieser Bewegung ist es ein Ziehen statt eines Antippens (px). */
const ZIEH_SCHWELLE = 8;
/** Aufprall, ab dem der Knopf sichtbar staucht und das Handy kurz vibriert (px/s). */
const SPUERBAR = 380;
/** Einrasten am Ruheplatz: so lang wie nötig, zwischen 280 und 880 ms (wie bei der Schlüsselschmiede). */
const EINRASTEN_KURZ_MS = 280;
const EINRASTEN_LANG_MS = 880;
/** Abstand zu den Fensterrändern beim Fliegen (px). */
const RAND = 8;
/** So lange steht der Spruch nach einem Wurf (ms). */
const SPRUCH_MS = 2600;
/** Ab diesem Aufpralltempo zählt eine Wand als Bande (px/s). */
const BANDE_AB = 250;

interface Lage {
  dx: number;
  dy: number;
  winkel: number;
  quetsch: number;
  achse: 'x' | 'y';
}

const RUHELAGE: Lage = { dx: 0, dy: 0, winkel: 0, quetsch: 0, achse: 'x' };

/**
 * Der WhatsApp-Knopf am Handy und Tablet (Inhaber, 26.11.2026: „wie bei der Schlüsselschmiede“; „am Handy extrem
 * buggy“ war der Ball des Spiels, der seinen Platz per Rechnung hielt). Dieser Knopf ist ein gewöhnlicher Link, den
 * schon der Server ausliefert:
 *
 * - In Ruhe hält ihn das CSS unten rechts (knopf.module.css). Keine Rechnung, kein Springen, wenn die Adressleiste des
 *   Browsers ein- und ausfährt. Solange die Bewerbenleiste mit ihrem eigenen WhatsApp-Knopf zu sehen ist, blendet er
 *   sich aus: nie zwei WhatsApp-Knöpfe übereinander.
 * - Antippen öffnet WhatsApp. Ziehen und Loslassen wirft ihn: Er prallt an den Wänden ab, staucht kurz, das Handy
 *   vibriert kurz, er fällt auf den Boden und rastet wieder ein. Pro Bild nur transform, kein Rendern.
 * - Senkrechtes Wischen über dem Knopf scrollt die Seite (touch-action: pan-y); geworfen wird, wer seitlich zieht.
 * - Ein Wurf endet nie mit einem Klick auf den Link (Sperre im Capture vor allen anderen Klick-Beobachtern).
 * - Kleines Spiel: Banden, Decke, Weitwurf und Fang im Flug ergeben nach dem Einrasten einen kurzen Spruch über dem
 *   Knopf („Doppelbande! Rekord!“) mit der Aufforderung zu schreiben; ein Rekord lässt das Handy zweimal kurz summen.
 * - Am PC mit Maus zeigt das CSS ihn nicht: Dort ist der Ball Teil des Spiels mit der Figur.
 */
export function WhatsAppKnopf({ href, pfad }: { href: string; pfad: string | null }) {
  const knopf = useRef<HTMLAnchorElement>(null);
  const blase = useRef<HTMLSpanElement>(null);
  const z = useRef({
    modus: 'ruht' as Modus,
    anker: { x: 0, y: 0 },
    griff: { x: 0, y: 0 },
    start: { x: 0, y: 0 },
    zeiger: -1,
    lage: { ...RUHELAGE } as Lage,
    koerper: { x: 0, y: 0, vx: 0, vy: 0 } as WurfKoerper,
    rahmen: { links: 0, oben: 0, rechts: 0, unten: 0 } as WurfRahmen,
    proben: [] as Probe[],
    takt: 0,
    zuletzt: 0,
    vibriert: 0,
    sperre: false,
    loesen: null as (() => void) | null,
    /** Spielstand des laufenden Wurfs (null: kein Wurf) und bester Wurf auf dieser Seite */
    bilanz: null as WurfBilanz | null,
    losgelassen: 0,
    rekord: 0,
    blaseUhr: 0,
  });

  const zeichnen = useCallback(() => {
    const el = knopf.current;
    if (!el) return;
    const { dx, dy, winkel, quetsch, achse } = z.current.lage;
    const sx = achse === 'x' ? 1 - quetsch : 1 + quetsch;
    const sy = achse === 'x' ? 1 + quetsch : 1 - quetsch;
    el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) rotate(${winkel.toFixed(1)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
  }, []);

  const setzeModus = useCallback((modus: Modus) => {
    z.current.modus = modus;
    if (knopf.current) knopf.current.dataset.wurf = modus;
  }, []);

  /** Spruch über dem Knopf ein- oder ausblenden (nur dekorativ, für Screenreader verborgen). */
  const spruch = useCallback((text: string | null) => {
    const s = z.current;
    window.clearTimeout(s.blaseUhr);
    const el = blase.current;
    if (!el) return;
    if (!text) {
      delete el.dataset.offen;
      return;
    }
    el.firstChild!.textContent = text;
    el.dataset.offen = '';
    s.blaseUhr = window.setTimeout(() => delete el.dataset.offen, SPRUCH_MS);
  }, []);

  /** Wurf zu Ende: Spruch zeigen, Rekord merken, bei Rekord zweimal kurz summen. */
  const wurfEnde = useCallback(() => {
    const s = z.current;
    const b = s.bilanz;
    s.bilanz = null;
    if (!b) return;
    b.flugMs = performance.now() - s.losgelassen;
    const { titel, rekord } = wurfSpruch(b, s.rekord);
    if (rekord) {
      s.rekord = b.banden;
      try {
        if (typeof navigator.vibrate === 'function') navigator.vibrate([10, 40, 10]);
      } catch {
        /* ohne Vibration */
      }
    }
    spruch(titel);
  }, [spruch]);

  /** Sofort an den Ruheplatz (Seitenwechsel, verborgenes Fenster, Abbau). */
  const zurueck = useCallback(() => {
    const s = z.current;
    cancelAnimationFrame(s.takt);
    s.takt = 0;
    s.loesen?.();
    s.loesen = null;
    s.lage = { ...RUHELAGE };
    const el = knopf.current;
    if (el) {
      el.style.transform = '';
      delete el.dataset.zieht;
    }
    setzeModus('ruht');
  }, [setzeModus]);

  /** Ruheplatz und Rahmen messen: Wände am Fensterrand, Boden auf Höhe des Ruheplatzes. */
  const vermessen = useCallback(() => {
    const el = knopf.current;
    if (!el) return;
    const s = z.current;
    const r = el.getBoundingClientRect();
    // getBoundingClientRect enthält die aktuelle Verschiebung; der Ruheplatz liegt ohne sie
    const w = el.offsetWidth;
    s.anker = { x: r.left + r.width / 2 - w / 2 - s.lage.dx, y: r.top + r.height / 2 - el.offsetHeight / 2 - s.lage.dy };
    s.rahmen = {
      links: RAND,
      oben: RAND,
      rechts: Math.max(RAND, window.innerWidth - w - RAND),
      unten: s.anker.y,
    };
  }, []);

  /** Einrasten: vom Ruhepunkt am Boden an den Ruheplatz, Drehung und Stauchung zurück auf null. */
  const einrasten = useCallback(() => {
    const s = z.current;
    setzeModus('rastet');
    const von = { ...s.lage };
    const dauer = Math.min(EINRASTEN_LANG_MS, EINRASTEN_KURZ_MS + Math.hypot(von.dx, von.dy) * 0.4);
    const beginn = performance.now();
    const bild = (jetzt: number) => {
      const p = Math.min(1, (jetzt - beginn) / dauer);
      const e = 1 - Math.pow(1 - p, 4);
      s.lage = { dx: von.dx * (1 - e), dy: von.dy * (1 - e), winkel: von.winkel * (1 - e), quetsch: von.quetsch * (1 - e), achse: von.achse };
      zeichnen();
      if (p < 1) s.takt = requestAnimationFrame(bild);
      else {
        zurueck();
        wurfEnde();
      }
    };
    s.takt = requestAnimationFrame(bild);
  }, [setzeModus, wurfEnde, zeichnen, zurueck]);

  /** Flug: Rechnung je Bild, Stauchen und Vibrieren beim spürbaren Aufprall, Rollen nach dem Tempo. */
  const fliegen = useCallback(() => {
    const s = z.current;
    setzeModus('fliegt');
    s.zuletzt = performance.now();
    const radius = (knopf.current?.offsetWidth ?? 56) / 2;
    const bild = (jetzt: number) => {
      const dt = (jetzt - s.zuletzt) / 1000;
      s.zuletzt = jetzt;
      const { k, aufprall } = schritt(s.koerper, dt, s.rahmen);
      s.koerper = k;
      s.lage.dx = k.x - s.anker.x;
      s.lage.dy = k.y - s.anker.y;
      s.lage.winkel = (s.lage.winkel + ((k.vx * dt) / radius) * (180 / Math.PI)) % 360;
      s.lage.quetsch *= Math.exp(-18 * dt);
      if (aufprall && s.bilanz && aufprall.tempo > BANDE_AB) {
        if (aufprall.wand === 'links' || aufprall.wand === 'rechts') s.bilanz.banden += 1;
        else if (aufprall.wand === 'oben') s.bilanz.decke = true;
      }
      if (aufprall && aufprall.tempo > SPUERBAR) {
        s.lage.quetsch = Math.min(0.22, aufprall.tempo / 5000);
        s.lage.achse = aufprall.wand === 'links' || aufprall.wand === 'rechts' ? 'x' : 'y';
        if (jetzt - s.vibriert > 120) {
          s.vibriert = jetzt;
          try {
            if (typeof navigator.vibrate === 'function') navigator.vibrate(Math.min(18, Math.round(aufprall.tempo / 200)));
          } catch {
            /* ohne Vibration */
          }
        }
      }
      zeichnen();
      if (ruht(k, s.rahmen)) einrasten();
      else s.takt = requestAnimationFrame(bild);
    };
    s.takt = requestAnimationFrame(bild);
  }, [einrasten, setzeModus, zeichnen]);

  // Seitenwechsel: an den Ruheplatz, ohne Spruch
  useEffect(() => {
    z.current.bilanz = null;
    zurueck();
    spruch(null);
  }, [pfad, spruch, zurueck]);

  useEffect(() => {
    const s0 = z.current;
    const verborgen = () => {
      if (document.hidden) zurueck();
    };
    const groesse = () => {
      const s = z.current;
      if (s.modus === 'ruht') return;
      vermessen();
      const lage = imRahmen(s.koerper.x, s.koerper.y, s.rahmen);
      s.koerper = { ...s.koerper, ...lage };
      s.lage.dx = lage.x - s.anker.x;
      s.lage.dy = lage.y - s.anker.y;
      zeichnen();
    };
    // Nach einem Wurf zählt das Loslassen nie als Klick, auch nicht für die Klick-Beobachter der Seite (Capture am
    // Fenster läuft vor denen am Dokument).
    const sperre = (e: MouseEvent) => {
      const el = knopf.current;
      if (!el || !s0.sperre || !(e.target instanceof Node) || !el.contains(e.target)) return;
      s0.sperre = false;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    document.addEventListener('visibilitychange', verborgen);
    window.addEventListener('resize', groesse, { passive: true });
    window.addEventListener('click', sperre, true);
    return () => {
      document.removeEventListener('visibilitychange', verborgen);
      window.removeEventListener('resize', groesse);
      window.removeEventListener('click', sperre, true);
      cancelAnimationFrame(s0.takt);
      s0.loesen?.();
    };
  }, [vermessen, zeichnen, zurueck]);

  const unten = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const s = z.current;
    cancelAnimationFrame(s.takt);
    s.takt = 0;
    s.loesen?.();
    vermessen();
    // Aus dem Flug oder beim Einrasten gefangen: dort weiterziehen, wo er gerade ist; das Loslassen öffnet nichts
    s.koerper = { x: s.anker.x + s.lage.dx, y: s.anker.y + s.lage.dy, vx: 0, vy: 0 };
    s.griff = { x: e.clientX - s.koerper.x, y: e.clientY - s.koerper.y };
    s.start = { x: e.clientX, y: e.clientY };
    s.zeiger = e.pointerId;
    s.proben = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }];
    s.sperre = s.modus !== 'ruht';
    // Im Flug gefangen: zählt für den Spruch; ein neuer Griff blendet den alten Spruch aus
    if (s.modus === 'fliegt' && s.bilanz) s.bilanz.gefangen = true;
    spruch(null);
    setzeModus('bereit');

    const bewegt = (m: PointerEvent) => {
      if (m.pointerId !== s.zeiger) return;
      if (s.modus !== 'bereit' && s.modus !== 'gezogen') return;
      if (s.modus === 'bereit') {
        const dx = m.clientX - s.start.x;
        const dy = m.clientY - s.start.y;
        if (Math.hypot(dx, dy) < ZIEH_SCHWELLE) return;
        // Am Finger gehört senkrechtes Wischen der Seite (touch-action: pan-y): Geworfen wird nur, wer seitlich zieht.
        if (m.pointerType !== 'mouse' && Math.abs(dy) > Math.abs(dx)) return;
        setzeModus('gezogen');
        // Solange gezogen wird, nimmt der Knopf keine Zeiger an: Loslassen landet nie als Klick auf dem Link
        if (knopf.current) knopf.current.dataset.zieht = '';
        s.lage.quetsch = 0;
      }
      const lage = imRahmen(m.clientX - s.griff.x, m.clientY - s.griff.y, s.rahmen);
      s.koerper = { x: lage.x, y: lage.y, vx: 0, vy: 0 };
      s.lage.dx = lage.x - s.anker.x;
      s.lage.dy = lage.y - s.anker.y;
      s.proben.push({ x: m.clientX, y: m.clientY, t: m.timeStamp });
      if (s.proben.length > 8) s.proben.shift();
      zeichnen();
    };
    const ende = (u: PointerEvent) => {
      if (u.pointerId !== s.zeiger) return;
      s.loesen?.();
      s.loesen = null;
      if (s.modus === 'bereit') {
        // Antippen: Der Klick öffnet WhatsApp (außer er hat den Knopf im Flug gefangen)
        if (s.lage.dx || s.lage.dy) einrasten();
        else setzeModus('ruht');
        return;
      }
      if (s.modus !== 'gezogen') return;
      s.sperre = true;
      if (u.type === 'pointercancel') {
        // Der Browser hat die Geste übernommen (etwa zum Scrollen): kein Wurf, zurück an den Platz
        einrasten();
        window.setTimeout(() => {
          if (knopf.current) delete knopf.current.dataset.zieht;
        }, 0);
        return;
      }
      s.proben.push({ x: u.clientX, y: u.clientY, t: u.timeStamp });
      // Neuer Wurf: Spielstand von vorn, außer er wurde im Flug gefangen und gleich weitergeworfen
      if (!s.bilanz) s.bilanz = { ...LEERE_BILANZ };
      s.losgelassen = performance.now();
      const v = wurfTempo(s.proben);
      s.koerper = { ...s.koerper, vx: v.vx, vy: v.vy };
      fliegen();
      // Erst nach dem Klick-Ereignis des Browsers wieder Zeiger annehmen (dann ist er im Flug fangbar)
      window.setTimeout(() => {
        if (knopf.current) delete knopf.current.dataset.zieht;
      }, 0);
    };
    window.addEventListener('pointermove', bewegt);
    window.addEventListener('pointerup', ende);
    window.addEventListener('pointercancel', ende);
    s.loesen = () => {
      window.removeEventListener('pointermove', bewegt);
      window.removeEventListener('pointerup', ende);
      window.removeEventListener('pointercancel', ende);
    };
  };

  return (
    <>
      <a
        ref={knopf}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={KNOPF_NAME}
        className={`${styles.knopf} print-hidden`}
        data-wurf="ruht"
        data-motion="druck"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={unten}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d={WHATSAPP_ZEICHEN} />
        </svg>
      </a>
      {/* Spruch nach dem Wurf: nur Dekoration, der Link selbst trägt Name und Ziel */}
      <span ref={blase} className={`${styles.blase} print-hidden`} aria-hidden="true" data-knopf-blase="">
        <span className={styles.titel}>Guter Wurf!</span>
        <span className={styles.aufruf}>{SPRUCH_AUFRUF}</span>
      </span>
    </>
  );
}
