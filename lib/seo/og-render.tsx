import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ReactElement, ReactNode } from 'react';
import { ImageResponse } from 'next/og';
import { GLYPH_SHAPES, type IconName } from '@/components/icons/glyphs';
import { COMPANY } from '@/lib/content/company';
import {
  HAUS_BAENDER,
  HAUS_FBH_X,
  HAUS_FBH_Y,
  HAUS_FEIN,
  HAUS_MARKEN,
  HAUS_RUECKLAUF,
  HAUS_STRICH,
  HAUS_UHR,
  HAUS_VORLAUF,
  HAUS_ZULEITUNG,
} from './og-haus';
import { OG_COLOR as C, OG_IMAGE_SIZE, versal, type OgHomeText, type OgJobText } from './og-image';

/**
 * Teilen-Bilder im Design des Einstiegs (Variante 3, Bilder des Auftraggebers vom 10.10.): links Papier
 * mit Logo, Etikett, h1 in Bricolage 800 (Navy), Unterzeile an der Rohrklammer und dem roten Knopf,
 * dessen Vorlauf-Linie waagerecht in die Wärmepumpe im Navy-Panel rechts läuft. Im Panel das Haus im
 * Wärmebild (statisch, ohne WebGL) mit Uhr auf 13:30, Leitungen und Familien-Etiketten; die Startseite
 * trägt darüber die Maße, die Stellen die Gehaltsspanne im Heizkreis (Variante 2).
 *
 * Schriften: die drei Familien der Website als feste TTF-Schnitte aus lib/seo/og-fonts (next/og liest
 * kein WOFF2 und keine variablen Achsen; Herkunft in og-fonts/LIZENZEN.md). Sie liegen im Repository und
 * werden einmal je Prozess gelesen, kein Abruf bei Dritthosts. Fehlt eine Datei, rendert das Bild mit der
 * eingebauten Schrift von next/og weiter, statt zu scheitern.
 */

const { width: W, height: H } = OG_IMAGE_SIZE;
/** Navy-Panel rechts (Variante 3: Papier links, Navy rechts). */
const PANEL_X = 660;
const PANEL_W = W - PANEL_X;
/** Linke Spalte. */
const LEFT = 64;
/** Ausschnitt der Szene (viewBox 0 0 800 800): Haus und Wärmepumpe, unten angeschnitten wie im Einstieg. */
const VB = { x: 0, y: 330, w: 680, h: 470 } as const;
const S = PANEL_W / VB.w;
const HOUSE_TOP = H - VB.h * S;
/** Szene → Bild. */
const px = (x: number) => PANEL_X + (x - VB.x) * S;
const py = (y: number) => HOUSE_TOP + (y - VB.y) * S;
/** Strichstärken im Bild (px) → viewBox-Einheiten. */
const vb = (pixels: number) => pixels / S;

/** Die Zuleitung liegt auf Höhe des Knopfs: Der Vorlauf läuft gerade aus dem Knopf in die Wärmepumpe. */
const PIPE_Y = py(HAUS_ZULEITUNG.y);
const BUTTON = { left: LEFT, width: 276, height: 64 } as const;
const BUTTON_TOP = PIPE_Y - BUTTON.height / 2;
const STRICH = 3;

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

const round = { strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

/** Haus im Wärmebild, Ausschnitt VB, unten am Panel; die Zuleitung nur, wenn ein Knopf sie speist. */
function Haus({ zuleitung }: { zuleitung: boolean }) {
  const vorlauf = zuleitung ? [...HAUS_VORLAUF, HAUS_ZULEITUNG.d] : [...HAUS_VORLAUF];
  const pipe = vb(3.5);
  const mantel = vb(9);
  return (
    <svg
      width={PANEL_W}
      height={VB.h * S}
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      style={{ position: 'absolute', left: PANEL_X, top: HOUSE_TOP }}
    >
      {HAUS_BAENDER.map((d, index) => (
        <path key={d.slice(0, 12)} d={d} fill={[C.blau, C.wand, C.waerme, C.papier][index]} />
      ))}
      <path d={HAUS_STRICH.giebel} stroke={C.papier} strokeWidth={vb(STRICH)} {...round} />
      <path d={HAUS_STRICH.waende} stroke={C.papier} strokeWidth={vb(STRICH)} {...round} />
      <path d={HAUS_STRICH.erde} stroke={C.papier} strokeWidth={vb(STRICH)} {...round} />
      {HAUS_FEIN.map((d) => (
        <path key={d.slice(0, 12)} d={d} stroke={C.navy} strokeWidth={vb(STRICH)} {...round} />
      ))}
      {HAUS_FBH_X.map((cx) => (
        <circle key={cx} cx={cx} cy={HAUS_FBH_Y} r={3} stroke={C.navy} strokeWidth={vb(2)} fill="none" />
      ))}
      <circle
        cx={HAUS_STRICH.luefterKreis.cx}
        cy={HAUS_STRICH.luefterKreis.cy}
        r={HAUS_STRICH.luefterKreis.r}
        stroke={C.papier}
        strokeWidth={vb(STRICH)}
        fill={C.navy}
      />
      <path d={HAUS_STRICH.luefter} stroke={C.papier} strokeWidth={vb(STRICH)} {...round} />
      {/* Uhr im Giebel auf 13:30, mit Fadenkreuz */}
      <circle cx={HAUS_UHR.cx} cy={HAUS_UHR.cy} r={HAUS_UHR.kreuzR} stroke={C.papier} strokeWidth={vb(2)} fill="none" />
      <path d={HAUS_UHR.kreuz} stroke={C.papier} strokeWidth={vb(2)} {...round} />
      <circle cx={HAUS_UHR.cx} cy={HAUS_UHR.cy} r={HAUS_UHR.r} stroke={C.navy} strokeWidth={vb(STRICH)} fill={C.papier} />
      <path d={HAUS_UHR.striche} stroke={C.navy} strokeWidth={vb(STRICH)} {...round} />
      <path d={HAUS_UHR.zeiger} stroke={C.navy} strokeWidth={vb(STRICH)} {...round} />
      <circle cx={HAUS_UHR.cx} cy={HAUS_UHR.cy} r={3} fill={C.navy} />
      {/* Leitungen: Mantel in Papier, darauf Rücklauf blau und Vorlauf rot */}
      {[...HAUS_RUECKLAUF, ...vorlauf].map((d) => (
        <path key={`m${d}`} d={d} stroke={C.papier} strokeWidth={mantel} {...round} />
      ))}
      {HAUS_RUECKLAUF.map((d) => (
        <path key={`r${d}`} d={d} stroke={C.blau} strokeWidth={pipe} {...round} />
      ))}
      {vorlauf.map((d) => (
        <path key={`v${d}`} d={d} stroke={C.rot} strokeWidth={pipe} {...round} />
      ))}
    </svg>
  );
}

function Glyph({ name, size }: { name: IconName; size: number }) {
  const shapes = GLYPH_SHAPES[name] as ReadonlyArray<Record<string, unknown>>;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {shapes.map((shape, index) => {
        const common = { stroke: C.navy, strokeWidth: 2, ...round };
        if ('d' in shape) {
          return <path key={index} {...common} d={shape.d as string} transform={shape.transform as string | undefined} />;
        }
        if ('cx' in shape) {
          return <circle key={index} {...common} cx={shape.cx as number} cy={shape.cy as number} r={shape.r as number} />;
        }
        return (
          <rect
            key={index}
            {...common}
            x={shape.x as number}
            y={shape.y as number}
            width={shape.width as number}
            height={shape.height as number}
            rx={shape.rx as number | undefined}
          />
        );
      })}
    </svg>
  );
}

const KASTEN = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: C.papier,
  color: C.navy,
  border: `2px solid ${C.navy}`,
  borderRadius: 4,
} as const;

/** Etiketten-Kästchen an der Szene: Familien-Icon auf Plakette, Name in Martian-Versalien. */
function Marke({ icon, name, at, label }: { icon: IconName; name: string; at: { x: number; y: number }; label: 'oben' | 'rechts' }) {
  const plate = 32;
  const left = px(at.x) - plate / 2;
  const top = py(at.y) - plate / 2;
  const text = (
    <div style={{ ...KASTEN, fontFamily: 'Martian', fontWeight: 600, fontSize: 14, letterSpacing: 0.8, padding: '5px 8px', lineHeight: 1 }}>
      {versal(name)}
    </div>
  );
  return (
    <>
      <div style={{ ...KASTEN, position: 'absolute', left, top, width: plate, height: plate, justifyContent: 'center' }}>
        <Glyph name={icon} size={22} />
      </div>
      {label === 'oben' ? (
        <div style={{ position: 'absolute', left: PANEL_X + 12, top: top - 34, display: 'flex' }}>{text}</div>
      ) : (
        <div style={{ position: 'absolute', left: left + plate + 4, top: top + 2, display: 'flex' }}>{text}</div>
      )}
    </>
  );
}

/** Rohrklammer: Vorlauf oben, Rücklauf unten, Bögen r 12, 3 px (components/zeichnung/Rohrklammer). */
function Rohrklammer({ height }: { height: number }) {
  const mid = height / 2;
  return (
    <svg width={24} height={height} viewBox={`0 0 24 ${height}`} style={{ position: 'absolute', left: 0, top: 0 }}>
      <path d={`M22.5 1.5H13.5A12 12 0 0 0 1.5 13.5V${mid}`} stroke={C.rot} strokeWidth={STRICH} {...round} />
      <path d={`M1.5 ${mid}V${height - 13.5}A12 12 0 0 0 13.5 ${height - 1.5}H22.5`} stroke={C.blau} strokeWidth={STRICH} {...round} />
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
      {/* Navy-Panel mit Haus */}
      <div style={{ position: 'absolute', left: PANEL_X, top: 0, width: PANEL_W, height: H, backgroundColor: C.navy, display: 'flex' }} />
      <Haus zuleitung={action !== null} />
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
        <div style={{ display: 'flex', position: 'relative', marginTop: 22, paddingLeft: 36, height: sublineHeight }}>
          <Rohrklammer height={sublineHeight} />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              fontFamily: 'Bricolage',
              fontWeight: 700,
              fontSize: sublineSize,
              lineHeight: 1.12,
              color: C.navy,
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
          {/* Vorlauf: aus dem Knopf waagerecht ins Panel, dort weiter in die Wärmepumpe */}
          <div
            style={{
              position: 'absolute',
              left: BUTTON.left + BUTTON.width - 2,
              top: PIPE_Y - STRICH / 2,
              width: PANEL_X - BUTTON.left - BUTTON.width + 4,
              height: STRICH,
              backgroundColor: C.rot,
            }}
          />
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

/** Maßkette mit schrägen Endstrichen über den drei Maßen (Variante 3 `.messwerte`). */
function Masse({ measures }: { measures: OgHomeText['measures'] }) {
  const x0 = PANEL_X + 40;
  const top = 46;
  const valueSize = 44;
  const lineY = top + valueSize + 12;
  const widths = [138, 156, 128];
  const starts = widths.map((_, index) => x0 + widths.slice(0, index).reduce((sum, w) => sum + w, 0));
  const end = starts[starts.length - 1] + widths[widths.length - 1];
  const ticks = [...starts, end];
  return (
    <>
      <svg width={PANEL_W} height={40} viewBox={`0 0 ${PANEL_W} 40`} style={{ position: 'absolute', left: PANEL_X, top: lineY - 20 }}>
        <path d={`M${x0 - PANEL_X} 20H${end - PANEL_X}`} stroke={C.creme} strokeWidth={2} fill="none" />
        {ticks.map((x) => (
          <path key={x} d={`M${x - PANEL_X - 6} 26L${x - PANEL_X + 6} 14`} stroke={C.creme} strokeWidth={2} strokeLinecap="round" />
        ))}
      </svg>
      {measures.slice(0, 3).map((measure, index) => (
        <div key={measure.name} style={{ position: 'absolute', left: starts[index] + 6, top, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'Bricolage', fontWeight: 800, fontSize: valueSize, lineHeight: 1, color: C.weiss, letterSpacing: -0.4 }}>
            {measure.value}
          </div>
          <div style={{ marginTop: 24, fontFamily: 'Atkinson', fontWeight: 700, fontSize: 18, color: C.creme }}>{measure.name}</div>
        </div>
      ))}
    </>
  );
}

/** „13:30 Freitags Feierabend“ mit Leitlinie unter 45° zum Fadenkreuz an der Uhr im Giebel. */
function Uhrzeit({ clock }: { clock: OgHomeText['clock'] }) {
  const left = PANEL_X + 34;
  const top = 160;
  const labelBottom = top + 72 + 32;
  // Fadenkreuz an der Uhr, Punkt oben links auf dem Kreis
  const r = HAUS_UHR.kreuzR * S * Math.SQRT1_2;
  const endX = px(HAUS_UHR.cx) - r;
  const endY = py(HAUS_UHR.cy) - r;
  const startX = endX - (endY - labelBottom);
  return (
    <>
      <div style={{ position: 'absolute', left, top, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'Bricolage', fontWeight: 800, fontSize: 72, lineHeight: 1, color: C.weiss, letterSpacing: -0.7 }}>
          {clock.value}
        </div>
        <div style={{ marginTop: 8, fontFamily: 'Atkinson', fontWeight: 700, fontSize: 18, lineHeight: 1.2, color: C.creme }}>{clock.name}</div>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={`M${startX} ${labelBottom}L${endX} ${endY}`} stroke={C.creme} strokeWidth={2} strokeLinecap="round" fill="none" />
      </svg>
    </>
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
          <Masse measures={text.measures} />
          <Uhrzeit clock={text.clock} />
          <Marke icon="waermepumpe" name="Wärmepumpen" at={HAUS_MARKEN[0]} label="oben" />
          <Marke icon="flamme" name="Heizungen" at={HAUS_MARKEN[1]} label="rechts" />
          <Marke icon="tropfen" name="Bäder" at={HAUS_MARKEN[2]} label="rechts" />
        </>
      }
    />
  ));
}

// ── Stellen ────────────────────────────────────────────────────────────────────────────────────────

/** Heizkreis (Variante 2): Vorlauf oben um die Zahl, Rücklauf unten zurück, links Zu- und Abgang im Paarabstand. */
function Heizkreis({ value, name }: OgJobText['salary']) {
  const valueSize = value.length > 14 ? 44 : 50;
  const nameSize = 17;
  const pad = { top: 30, right: 40, bottom: 30, left: 12 + 32 };
  const height = pad.top + valueSize + (name ? 14 + nameSize : 0) + pad.bottom;
  const half = height / 2;
  const vorlauf = '#FF6B5F';
  const ruecklauf = '#86AEFF';
  return (
    <div style={{ position: 'absolute', left: PANEL_X, top: 64, width: PANEL_W, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height,
          padding: `${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: half,
            borderTop: `${STRICH}px solid ${vorlauf}`,
            borderLeft: `${STRICH}px solid ${vorlauf}`,
            borderRight: `${STRICH}px solid ${vorlauf}`,
            borderRadius: '24px 24px 0 0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 0,
            top: half,
            height: half,
            borderBottom: `${STRICH}px solid ${ruecklauf}`,
            borderLeft: `${STRICH}px solid ${ruecklauf}`,
            borderRight: `${STRICH}px solid ${ruecklauf}`,
            borderRadius: '0 0 24px 24px',
          }}
        />
        <div style={{ fontFamily: 'Martian', fontWeight: 600, fontSize: valueSize, lineHeight: 1, letterSpacing: -0.02 * valueSize, color: C.creme }}>
          {value}
        </div>
        {name ? (
          <div style={{ marginTop: 14, fontFamily: 'Martian', fontWeight: 600, fontSize: nameSize, lineHeight: 1, letterSpacing: 1, color: C.creme2 }}>
            {versal(name)}
          </div>
        ) : null}
      </div>
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
      panel={<Heizkreis {...text.salary} />}
    />
  ));
}
