import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ReactElement, ReactNode } from 'react';
import { ImageResponse } from 'next/og';
import { COMPANY } from '@/lib/content/company';
import { TOKENS } from '@/lib/tokens';
import { r1, type Medium } from '@/lib/zeichnung/norm';
import {
  OG_BAUTEILE,
  OG_ERDLEITUNG_Y,
  OG_GERAET,
  OG_GIEBEL_MASS,
  OG_HAUS_RAHMEN,
  OG_HEIZKOERPER,
  OG_INNENEINHEIT,
  OG_PUMPE,
  ogLeitungen,
  ogPfeile,
} from './og-haus';
import { OG_COLOR as C, OG_IMAGE_SIZE, versal, type OgHomeText, type OgJobText, type OgPlaceText } from './og-image';

/**
 * Teilen-Bilder im Design des Einstiegs: links Papier mit Logo, Etikett, h1 in Bricolage 800 (Navy), Unterzeile und
 * dem roten Knopf; rechts das Navy-Panel mit dem Hausschnitt aus lib/zeichnung (Technische Zeichnung 2.0, E-029):
 * Erdreich als 45°-Schraffur, Außeneinheit maßstäblich, Erdleitung durch die Wanddurchführung, Inneneinheit als
 * Symbol, Flachheizkörper. Der Vorlauf läuft von der Außeneinheit links aus dem Panel, über Bogen und Steigleitung in
 * den Knopf (K-001). Die Startseite trägt darüber die Maße (35 km, 30 Tage, 1926) und „35 km“ als Maß im Giebel; die
 * Stellen-, Orts- und Themenbilder ihren Kennwert als Maßkette (Linienart mass, 45°-Begrenzungsstriche) statt des
 * Heizkreises. Keine Rohrklammer, kein Wärmebild, kein Zirkel.
 *
 * Schriften: die drei Familien der Website als feste TTF-Schnitte aus lib/seo/og-fonts (next/og liest
 * kein WOFF2 und keine variablen Achsen; Herkunft in og-fonts/LIZENZEN.md). Sie liegen im Repository und
 * werden einmal je Prozess gelesen, kein Abruf bei Dritthosts. Fehlt eine Datei, rendert das Bild mit der
 * eingebauten Schrift von next/og weiter, statt zu scheitern.
 */

const { width: W, height: H } = OG_IMAGE_SIZE;
/** Navy-Panel rechts (Papier links, Navy rechts). */
const PANEL_X = 660;
const PANEL_W = W - PANEL_X;
/** Linke Spalte. */
const LEFT = 64;
/** Hausschnitt über die ganze Breite des Panels, unten bündig (Haus, Gerät und Erdreich wie im Einstieg). */
const S = PANEL_W / OG_HAUS_RAHMEN.breite;
const HOUSE_TOP = H - OG_HAUS_RAHMEN.hoehe * S;
/** Szene → Bild. */
const px = (x: number) => PANEL_X + x * S;
const py = (y: number) => HOUSE_TOP + y * S;
/** Strichstärken im Bild (px) → Einheiten des Schnitts. */
const vb = (pixels: number) => pixels / S;
/** Strichmuster der verdeckten Linie (px wie auf der Website) in Einheiten des Schnitts. */
const VERDECKT_MUSTER = TOKENS.linien.verdecktMuster.map(vb).join(' ');

const BUTTON = { left: LEFT, width: 276, height: 64 } as const;
const BUTTON_TOP = 500;
/** Der Vorlauf verlässt das Panel auf Höhe der Erdleitung und steigt kurz vor dem Panel zum Knopf (wie am Desktop). */
const ERD_Y = py(OG_ERDLEITUNG_Y);
const KNOPF_Y = BUTTON_TOP + BUTTON.height / 2;
const STEIG_X = PANEL_X - 40;
const BOGEN = 12;
const LEITUNG = 3;

/**
 * Rollen auf Navy (app/styles/theme.css, [data-tone="inverse"]): Kontur Creme, Vorlauf und Rücklauf in den hellen
 * Linienfarben, Schraffur in line-strong, Schnittflächen in surface-2.
 */
const NAVY = { kontur: C.creme, vorlauf: '#FF6B5F', ruecklauf: '#86AEFF', schraffur: '#8E97D6', schnitt: '#1A2878', flaeche: C.navy } as const;
const MEDIUM: Record<Medium, string> = { vorlauf: NAVY.vorlauf, ruecklauf: NAVY.ruecklauf, kaeltemittel: NAVY.kontur };

type FontWeight = 400 | 600 | 700 | 800;
type LoadedFont = { name: string; data: Buffer; weight: FontWeight; style: 'normal' };

/**
 * Wörtliche Pfade je Datei, damit die Dateiverfolgung beim Build (nft) sie findet: Die Stellenbilder
 * werden stündlich neu erzeugt (revalidate) und brauchen die Schriften dann auch zur Laufzeit.
 */
const FONT_FILES: ReadonlyArray<{ name: string; weight: FontWeight; read: () => Promise<Buffer> }> = [
  { name: 'Bricolage', weight: 800, read: () => readFile(join(process.cwd(), 'lib/seo/og-fonts/bricolage-grotesque-800.ttf')) },
  { name: 'Bricolage', weight: 700, read: () => readFile(join(process.cwd(), 'lib/seo/og-fonts/bricolage-grotesque-700.ttf')) },
  { name: 'Atkinson', weight: 400, read: () => readFile(join(process.cwd(), 'lib/seo/og-fonts/atkinson-hyperlegible-next-400.ttf')) },
  { name: 'Atkinson', weight: 700, read: () => readFile(join(process.cwd(), 'lib/seo/og-fonts/atkinson-hyperlegible-next-700.ttf')) },
  { name: 'Martian', weight: 600, read: () => readFile(join(process.cwd(), 'lib/seo/og-fonts/martian-mono-600.ttf')) },
];

async function loadFont(spec: (typeof FONT_FILES)[number]): Promise<LoadedFont | null> {
  try {
    return { name: spec.name, data: await spec.read(), weight: spec.weight, style: 'normal' };
  } catch {
    return null;
  }
}

async function loadLogo(): Promise<string | null> {
  try {
    const png = await readFile(join(process.cwd(), 'public/images/bad-energie-lahn-dill-logo-transparent.png'));
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

/** Einmal je Prozess: Schriften und Logo ändern sich nicht mit der Anfrage. */
let assets: Promise<{ fonts: LoadedFont[]; logo: string | null }> | null = null;
function loadAssets() {
  assets ??= Promise.all([Promise.all(FONT_FILES.map(loadFont)), loadLogo()]).then(([fonts, logo]) => ({
    fonts: fonts.filter((font): font is LoadedFont => font !== null),
    logo,
  }));
  return assets;
}

// ── Zeichnung ──────────────────────────────────────────────────────────────────────────────────────

const stumpf = { strokeLinecap: 'butt', strokeLinejoin: 'miter', fill: 'none' } as const;

/** Linienarten im Bild (px wie auf der Website, umgerechnet in Einheiten des Schnitts; Konturen mit runden Ecken, E-031). */
const kontur = { ...stumpf, strokeLinejoin: 'round', stroke: NAVY.kontur, strokeWidth: vb(2) } as const;
const fein = { ...stumpf, stroke: NAVY.kontur, strokeWidth: vb(1) } as const;

/**
 * Hausschnitt aus lib/zeichnung/szenen/hausschnitt.ts (über og-haus.ts), unten am Panel; mit Knopf läuft der Vorlauf
 * links aus dem Schnitt.
 */
function Haus({ knopf }: { knopf: boolean }) {
  const g = OG_GERAET;
  const a = g.ansicht;
  const ie = OG_INNENEINHEIT;
  const hk = OG_HEIZKOERPER;
  const lamellen = Array.from({ length: hk.lamellen }, (_, i) => r1(hk.x + ((i + 1) * hk.breite) / (hk.lamellen + 1)));
  const leitungen = ogLeitungen(knopf);
  // Gerät in mm: Strich in mm, damit er im Bild 2 bzw. 1 px misst
  const mm = (pixels: number) => vb(pixels) / g.massstab;
  return (
    <svg
      width={PANEL_W}
      height={OG_HAUS_RAHMEN.hoehe * S}
      viewBox={`0 0 ${OG_HAUS_RAHMEN.breite} ${OG_HAUS_RAHMEN.hoehe}`}
      style={{ position: 'absolute', left: PANEL_X, top: HOUSE_TOP }}
    >
      <path d={OG_BAUTEILE.schraffur} {...stumpf} stroke={NAVY.schraffur} strokeWidth={vb(1)} />
      <path d={OG_BAUTEILE.graben} {...fein} fill={NAVY.flaeche} />
      {/* Schotter unter den Sockeln und Kiesbett am Kondensatrohr (Kreuzschraffur wie das Erdreich) */}
      <path d={OG_BAUTEILE.schotter} {...fein} fill={NAVY.flaeche} />
      <path d={OG_BAUTEILE.schotterSchraffur} {...stumpf} stroke={NAVY.schraffur} strokeWidth={vb(1)} />
      <path d={OG_BAUTEILE.kiesbett} {...fein} fill={NAVY.flaeche} />
      <path d={OG_BAUTEILE.kiesbettSchraffur} {...stumpf} stroke={NAVY.schraffur} strokeWidth={vb(1)} />
      {[OG_BAUTEILE.dach, OG_BAUTEILE.decke, OG_BAUTEILE.bodenplatte, ...OG_BAUTEILE.waende].map((d) => (
        <path key={d.slice(0, 16)} d={d} {...kontur} fill={NAVY.schnitt} />
      ))}
      <path d={OG_BAUTEILE.gelaende} {...kontur} />
      {/* Außeneinheit maßstäblich (1 : 10), einfache Detailstufe */}
      <g transform={`translate(${g.lage.x} ${g.lage.y}) scale(${g.massstab})`}>
        {a.kontur.map((d) => (
          <path key={d} d={d} {...kontur} strokeWidth={mm(2)} fill={NAVY.flaeche} />
        ))}
        {a.fein.map((d) => (
          <path key={d} d={d} {...fein} strokeWidth={mm(1)} />
        ))}
        {a.kreise.map((k) => (
          <circle key={`${k.cx}-${k.r}`} cx={k.cx} cy={k.cy} r={k.r} {...(k.art === 'fein' ? fein : kontur)} strokeWidth={mm(k.art === 'fein' ? 1 : 2)} />
        ))}
        {a.rotor ? <path d={a.rotor.blaetter} transform={`translate(${a.rotor.cx} ${a.rotor.cy})`} {...fein} strokeWidth={mm(1)} /> : null}
      </g>
      {OG_BAUTEILE.sockel.map((d) => (
        <path key={d} d={d} {...kontur} fill={NAVY.schnitt} />
      ))}
      {/* Kondensatrohr Ø 100 mm ins Kiesbett unter der Frosttiefe */}
      <path d={OG_BAUTEILE.kondensat} {...fein} fill={NAVY.flaeche} />
      <path d={OG_BAUTEILE.durchfuehrung} {...kontur} fill={NAVY.flaeche} />
      {/* Inneneinheit als Symbol (Systemgrenze Strich-Punkt) mit Umwälzpumpe; Flachheizkörper */}
      <rect x={ie.x} y={ie.y} width={ie.breite} height={ie.hoehe} {...fein} fill={NAVY.flaeche} strokeDasharray={[16, 4, 2, 4].map(vb).join(' ')} />
      <g transform={`translate(${ie.pumpe.x} ${ie.pumpe.y}) scale(${OG_PUMPE.massstab})`}>
        {OG_PUMPE.formen.map((f, i) =>
          'cx' in f ? (
            <circle key={i} cx={f.cx} cy={f.cy} r={f.r} {...kontur} strokeWidth={vb(2) / OG_PUMPE.massstab} fill={NAVY.flaeche} />
          ) : (
            <path key={i} d={f.d} {...kontur} strokeWidth={vb(2) / OG_PUMPE.massstab} />
          ),
        )}
      </g>
      <rect x={hk.x} y={hk.y} width={hk.breite} height={hk.hoehe} {...kontur} fill={NAVY.flaeche} />
      <path d={lamellen.map((x) => `M${x} ${hk.y}V${hk.y + hk.hoehe}`).join('')} {...fein} />
      {/* Leitungen in Fließrichtung (ohne Kreuzung) */}
      {leitungen.map((l) =>
        l.verdeckt ? (
          // Hinter Gehäuse und Sockel: verdeckte Linie (1 px, gestrichelt wie --m-verdeckt-muster)
          <path key={l.id} d={l.d} {...stumpf} stroke={MEDIUM[l.medium]} strokeWidth={vb(1)} strokeDasharray={VERDECKT_MUSTER} />
        ) : (
          <path key={l.id} d={l.d} fill="none" stroke={MEDIUM[l.medium]} strokeWidth={vb(LEITUNG)} strokeLinecap="round" strokeLinejoin="round" />
        ),
      )}
      {ogPfeile(knopf).map((p) => (
        <path key={p.d} d={p.d} fill={MEDIUM[p.medium]} />
      ))}
    </svg>
  );
}

/** Maßlinie nach DIN 406 (Linienart mass, 1 px): Linie mit 45°-Begrenzungsstrichen an beiden Enden. */
function Masslinie({ width, color }: { width: number; color: string }) {
  const h = 12;
  return (
    <svg width={width + 2 * h} height={h} viewBox={`${-h} 0 ${width + 2 * h} ${h}`} style={{ display: 'flex', marginLeft: -h }}>
      <path d={`M0 ${h / 2}H${width}`} stroke={color} strokeWidth={1} fill="none" />
      {[0, width].map((x) => (
        <path key={x} d={`M${x - h / 2} ${h}L${x + h / 2} 0`} stroke={color} strokeWidth={1} strokeLinecap="butt" fill="none" />
      ))}
    </svg>
  );
}

/** Vorlauf von der Außeneinheit zum Knopf: vom Rand des Panels auf Höhe der Erdleitung, Bogen, Steigleitung, Bogen. */
function VorlaufZumKnopf() {
  const ende = BUTTON.left + BUTTON.width - 2;
  const d =
    `M${PANEL_X} ${ERD_Y}H${STEIG_X + BOGEN}A${BOGEN} ${BOGEN} 0 0 1 ${STEIG_X} ${ERD_Y - BOGEN}` +
    `V${KNOPF_Y + BOGEN}A${BOGEN} ${BOGEN} 0 0 0 ${STEIG_X - BOGEN} ${KNOPF_Y}H${ende}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
      <path d={d} stroke={C.rot} strokeWidth={LEITUNG} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ── Rahmen ─────────────────────────────────────────────────────────────────────────────────────────

interface FrameProps {
  logo: string | null;
  etikett: string;
  title: readonly string[];
  titleSize: number;
  subline: readonly string[];
  action: string | null;
  microcopy: string;
  /** Inhalt des Navy-Panels über dem Haus (absolut positioniert). */
  panel: ReactNode;
}

function Frame({ logo, etikett, title, titleSize, subline, action, microcopy, panel }: FrameProps) {
  const sublineSize = 30;
  const sublineHeight = Math.round(subline.length * sublineSize * 1.12);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        backgroundColor: C.papier,
        color: C.tinte,
        fontFamily: 'Atkinson',
      }}
    >
      {/* Navy-Panel mit dem Hausschnitt */}
      <div style={{ position: 'absolute', left: PANEL_X, top: 0, width: PANEL_W, height: H, backgroundColor: C.navy, display: 'flex' }} />
      <Haus knopf={action !== null} />
      {panel}

      {/* Linke Spalte auf Papier */}
      <div style={{ position: 'absolute', left: LEFT, top: 44, display: 'flex' }}>
        {logo ? (
          // Satori rendert schlichte <img>; next/image gibt es hier nicht.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" width={241} height={44} />
        ) : (
          <div style={{ fontFamily: 'Bricolage', fontWeight: 800, fontSize: 28, color: C.navy }}>{COMPANY.name}</div>
        )}
      </div>
      <div style={{ position: 'absolute', left: LEFT, top: 136, width: PANEL_X - LEFT - 40, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'Martian', fontWeight: 600, fontSize: 18, letterSpacing: 1.1, color: C.navy, lineHeight: 1 }}>
          {etikett}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 18,
            fontFamily: 'Bricolage',
            fontWeight: 800,
            fontSize: titleSize,
            lineHeight: 0.96,
            letterSpacing: -0.01 * titleSize,
            color: C.navy,
          }}
        >
          {title.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <div style={{ display: 'flex', position: 'relative', marginTop: 22, height: sublineHeight }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              fontFamily: 'Bricolage',
              fontWeight: 700,
              fontSize: sublineSize,
              lineHeight: 1.12,
              color: C.tinte2,
            }}
          >
            {subline.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
      </div>

      {action ? (
        <>
          {/* Vorlauf: aus der Außeneinheit über die Erdleitung und die Steigleitung in den Knopf (K-001) */}
          <VorlaufZumKnopf />
          <div
            style={{
              position: 'absolute',
              left: BUTTON.left,
              top: BUTTON_TOP,
              width: BUTTON.width,
              height: BUTTON.height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: C.rot,
              borderRadius: 4,
              boxShadow: `0 4px 0 ${C.rotDruck}`,
              color: C.weiss,
              fontFamily: 'Atkinson',
              fontWeight: 700,
              fontSize: 27,
            }}
          >
            {action}
          </div>
        </>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: LEFT,
          top: action ? BUTTON_TOP + BUTTON.height + 18 : BUTTON_TOP + 16,
          fontSize: action ? 19 : 24,
          fontWeight: action ? 400 : 700,
          color: action ? C.tinte : C.navy,
        }}
      >
        {microcopy}
      </div>
    </div>
  );
}

async function respond(frame: (logo: string | null) => ReactElement): Promise<ImageResponse> {
  const { fonts, logo } = await loadAssets();
  return new ImageResponse(frame(logo), { ...OG_IMAGE_SIZE, fonts: fonts.length > 0 ? fonts : undefined });
}

// ── Startseite ─────────────────────────────────────────────────────────────────────────────────────

/**
 * Die Maße über dem Hausschnitt wie im Einstieg: 35 km Einsatzgebiet, 30 Tage Urlaub, 1926 Gegründet; je Maß der Wert,
 * darunter die Maßlinie (1 px, 45°-Striche am Anfang jedes Maßes und am Ende der Kette), darunter der Name.
 */
function Masse({ measures }: { measures: readonly OgHomeText['measures'][number][] }) {
  const x0 = PANEL_X + 40;
  const top = 40;
  const valueSize = 44;
  const lineY = top + valueSize + 10;
  const widths = [190, 140, 150].slice(0, Math.min(3, measures.length));
  const starts = widths.map((_, index) => x0 + widths.slice(0, index).reduce((sum, w) => sum + w, 0));
  const end = starts[starts.length - 1] + widths[widths.length - 1] - 20;
  const ticks = [...starts, end];
  return (
    <>
      <svg width={PANEL_W} height={20} viewBox={`0 0 ${PANEL_W} 20`} style={{ position: 'absolute', left: PANEL_X, top: lineY - 10 }}>
        <path d={`M${x0 - PANEL_X} 10H${end - PANEL_X}`} stroke={C.creme} strokeWidth={1} fill="none" />
        {ticks.map((x) => (
          <path key={x} d={`M${x - PANEL_X - 6} 16L${x - PANEL_X + 6} 4`} stroke={C.creme} strokeWidth={1} strokeLinecap="butt" />
        ))}
      </svg>
      {measures.slice(0, 3).map((measure, index) => (
        <div
          key={measure.name}
          style={{ position: 'absolute', left: starts[index] + 4, top, width: widths[index] - 16, display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ fontFamily: 'Bricolage', fontWeight: 800, fontSize: valueSize, lineHeight: 1, color: C.weiss, letterSpacing: -0.4 }}>
            {measure.value}
          </div>
          <div style={{ marginTop: 22, fontFamily: 'Atkinson', fontWeight: 700, fontSize: 17, lineHeight: 1.2, color: C.creme }}>{measure.name}</div>
        </div>
      ))}
    </>
  );
}

/** „35 km“ als Maß in Schrift im Giebel (Leitmotiv E-027, seit E-029 ohne Zirkel), mit Maßlinie darunter. */
function GiebelMass({ value }: { value: string }) {
  const breite = 112;
  return (
    <div
      style={{
        position: 'absolute',
        left: px(OG_GIEBEL_MASS.x) - breite / 2,
        top: py(OG_GIEBEL_MASS.y) - 22,
        width: breite,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ fontFamily: 'Martian', fontWeight: 600, fontSize: 26, lineHeight: 1, color: C.creme }}>{value}</div>
      <div style={{ display: 'flex', marginTop: 4 }}>
        <Masslinie width={breite - 8} color={C.creme} />
      </div>
    </div>
  );
}

export async function renderHomeImage(text: OgHomeText): Promise<ImageResponse> {
  return respond((logo) => (
    <Frame
      logo={logo}
      etikett={text.etikett}
      title={text.title}
      titleSize={108}
      subline={text.subline}
      action={text.action}
      microcopy={text.microcopy}
      panel={
        <>
          <Masse measures={[text.radius, ...text.measures]} />
          <GiebelMass value={text.radius.value} />
        </>
      }
    />
  ));
}

// ── Stellen ────────────────────────────────────────────────────────────────────────────────────────

/**
 * Kennwert über dem Hausschnitt (seit E-029 statt des Heizkreises um die Zahl): Wert in Martian Mono, darunter die
 * Maßlinie nach DIN 406, darunter der Name in Versalien. „Lohn auf Anfrage“ bei den Stellen (E-030), die Straßenstrecke
 * bei den Orten, der Kennwert bei den Themen.
 */
function Kennwert({ value, name, gross = false }: OgJobText['salary'] & { gross?: boolean }) {
  const valueSize = gross ? 80 : value.length > 14 ? 42 : 50;
  const breite = Math.min(PANEL_W - 80, Math.round(value.length * valueSize * 0.62));
  return (
    <div style={{ position: 'absolute', left: PANEL_X + 40, top: 48, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'Martian', fontWeight: 600, fontSize: valueSize, lineHeight: 1, letterSpacing: -0.02 * valueSize, color: C.creme }}>
        {value}
      </div>
      <div style={{ display: 'flex', marginTop: 10 }}>
        <Masslinie width={breite} color={C.creme} />
      </div>
      {name ? (
        <div style={{ marginTop: 10, fontFamily: 'Martian', fontWeight: 600, fontSize: 17, lineHeight: 1, letterSpacing: 1, color: C.creme2 }}>
          {versal(name)}
        </div>
      ) : null}
    </div>
  );
}

export async function renderJobImage(text: OgJobText): Promise<ImageResponse> {
  return respond((logo) => (
    <Frame
      logo={logo}
      etikett={text.etikett}
      title={text.title}
      titleSize={text.titleSize}
      subline={text.subline}
      action={text.action}
      microcopy={text.microcopy}
      panel={<Kennwert {...text.salary} />}
    />
  ));
}

// ── Orte ───────────────────────────────────────────────────────────────────────────────────────────

/** Längstes Etikett, das auf dem Teilen-Bild in einer Zeile steht (Martian-Versalien, linke Spalte). */
export const OG_ETIKETT_MAX = 36;

/**
 * Etikett des Teilen-Bilds in einer Zeile: „35080 BAD ENDBACH · LANDKREIS MARBURG-BIEDENKOPF“ brach am Bindestrich um.
 * Erst der Kreis ohne „Landkreis“ („35799 MERENBERG · LIMBURG-WEILBURG“), ist es dann noch zu lang, nur Postleitzahl
 * und Ort („35080 BAD ENDBACH“). Die Seite selbst behält ihr ganzes Etikett.
 */
export function ogEtikett(etikett: string, max = OG_ETIKETT_MAX): string {
  if (etikett.length <= max) return etikett;
  const kurz = etikett.replace(/ · LANDKREIS /i, ' · ');
  if (kurz.length <= max) return kurz;
  const trenner = etikett.lastIndexOf(' · ');
  return trenner > 0 ? etikett.slice(0, trenner) : etikett;
}

/**
 * Teilen-Bild einer Ortsseite (E-028) im Rahmen der Stellenbilder: Etikett und h1 der Seite, Fahrzeit und
 * „Flexible Arbeitszeiten.“ als Unterzeile, als Kennwert die Straßenstrecke („27 km bis zum Firmensitz“).
 */
export async function renderPlaceImage(text: OgPlaceText): Promise<ImageResponse> {
  return respond((logo) => (
    <Frame
      logo={logo}
      etikett={ogEtikett(text.etikett)}
      title={text.title}
      titleSize={text.titleSize}
      subline={text.subline}
      action={text.action}
      microcopy={text.microcopy}
      panel={<Kennwert value={text.distance.value} name={text.distance.name} gross />}
    />
  ));
}
