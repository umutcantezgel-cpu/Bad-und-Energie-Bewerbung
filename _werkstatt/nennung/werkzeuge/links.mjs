// Linkprüfer (Auftrag E0). Liest das ausgelieferte HTML jeder Seite ohne JavaScript (reiner HTTP-Abruf),
// schreibt je Link eine Zeile in links.tsv und eine Zusammenfassung in links-zusammenfassung.md.
import {
  ERWARTET,
  GOOGLEBOT_KENNUNG,
  STANDARD_KENNUNG,
  abrufen,
  alsHauptprogramm,
  attribute,
  ausgabeOrdner,
  ausschreiben,
  basisAus,
  entschluesseln,
  projektAus,
  seitenliste,
} from './gemeinsam.mjs';

const NUTZUNG = `Linkprüfer (Auftrag E0): je Seite Sprache, Meta-Robots, Canonical und alle Links auf codayweb.de,
getrennt nach Footer und außerhalb; zusätzlich ein Abruf mit Googlebot-Kennung zum Vergleich.

Aufruf (aus dem Projektordner, gegen den laufenden Produktions-Server):
  node _werkstatt/nennung/werkzeuge/links.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e0

Optional: --projekt <Projektwurzel> (Standard: dieses Projekt, für Routen und Build-Ausgabe).
Ausgabe: links.tsv (eine Zeile je Link; Seiten ohne Link einmal) und links-zusammenfassung.md.`;

const KOPFZEILE = [
  'url', 'status', 'lang', 'robots', 'canonical', 'coday_footer', 'coday_ausserhalb',
  'ort', 'href', 'text', 'rel', 'target', 'googlebot_gleich',
].join('\t');

/** rel-Werte, nach denen ein Link nicht gefolgt wird. */
const NICHT_GEFOLGT = ['nofollow', 'sponsored', 'ugc'];

/** Kommentare, Skripte und Formatvorlagen entfernen; der Rest ist das Dokument, wie es ohne JavaScript ankommt. */
function ohneSkripte(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, '');
}

/** Alle Tags eines Namens als Attributobjekte. */
function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))].map((m) => attribute(m[1]));
}

/** Sichtbarer Linktext: ohne sr-only-Inhalt, ohne Grafik, ohne Tags, mit aufgelösten Entitäten. */
function sichtbarerText(innen) {
  const ohneHilfe = innen
    .replace(/<(\w+)\b[^>]*\bclass\s*=\s*["'][^"']*\bsr-only\b[^"']*["'][^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');
  return entschluesseln(ohneHilfe).replace(/\s+/g, ' ').trim();
}

/** Liegt die Adresse auf codayweb.de oder einer Subdomain davon? Relative Adressen gelten gegen die Seite. */
export function istCoday(href, seite) {
  try {
    const host = new URL(href.trim(), seite).hostname;
    return host === 'codayweb.de' || host.endsWith('.codayweb.de');
  } catch {
    return false;
  }
}

/**
 * Wertet das HTML einer Seite aus: Sprache, alle Meta-Robots, alle Canonical-Angaben und jeden Link auf codayweb.de
 * mit Ort (footer oder ausserhalb), Linktext, rel und target.
 */
export function analysiere(roh, seite) {
  const html = ohneSkripte(roh);
  const fuesse = [...html.matchAll(/<footer\b[^>]*>[\s\S]*?<\/footer\s*>/gi)].map((m) => [
    m.index,
    m.index + m[0].length,
  ]);
  const imFuss = (position) => fuesse.some(([von, bis]) => position >= von && position < bis);
  const links = [];
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)) {
    const attr = attribute(m[1]);
    if (attr.href === undefined || !istCoday(attr.href, seite)) continue;
    links.push({
      href: attr.href,
      text: sichtbarerText(m[2]),
      rel: attr.rel ?? '',
      target: attr.target ?? '',
      ort: imFuss(m.index) ? 'footer' : 'ausserhalb',
    });
  }
  return {
    lang: tags(html, 'html')[0]?.lang ?? '',
    robots: tags(html, 'meta')
      .filter((a) => (a.name ?? '').toLowerCase() === 'robots')
      .map((a) => a.content ?? '')
      .join(' | '),
    canonical: tags(html, 'link')
      .filter((a) => (a.rel ?? '').toLowerCase().split(/\s+/).includes('canonical'))
      .map((a) => a.href ?? '')
      .join(' | '),
    hatFuss: fuesse.length > 0,
    links,
  };
}

function linkSchluessel(auswertung) {
  return JSON.stringify(auswertung.links.map((l) => [l.ort, l.href, l.text, l.rel, l.target]));
}

/** Felder, in denen sich der Googlebot-Abruf vom Standard-Abruf unterscheidet. */
function abweichungen(standard, googlebot) {
  const liste = [];
  if (standard.status !== googlebot.status) liste.push(`status ${standard.status}/${googlebot.status}`);
  for (const feld of ['lang', 'robots', 'canonical']) {
    if (standard[feld] !== googlebot[feld]) liste.push(feld);
  }
  if (linkSchluessel(standard) !== linkSchluessel(googlebot)) liste.push('links');
  return liste;
}

const tsvWert = (wert) => String(wert ?? '').replace(/[\t\r\n]+/g, ' ');

function listeOderKeine(eintraege) {
  return eintraege.length ? eintraege.map((e) => `- ${e}`).join('\n') : '- keine';
}

function zusammenfassung(auswertungen, meta) {
  const n = auswertungen.length;
  const einFooterLink = auswertungen.filter((a) => a.footerZahl === 1);
  const ohneFooterLink = auswertungen.filter((a) => a.footerZahl === 0);
  const mehrAlsEinFooterLink = auswertungen.filter((a) => a.footerZahl > 1);
  const gefolgt = auswertungen.filter((a) =>
    a.links.some((l) => !l.rel.toLowerCase().split(/\s+/).some((wert) => NICHT_GEFOLGT.includes(wert))),
  );
  const unerwartet = auswertungen.filter((a) => a.status !== (ERWARTET[a.pfad] ?? 200));
  const abweichend = auswertungen.filter((a) => a.abweichung.length > 0);
  const zeilen = [
    '# Linkprüfung · Zusammenfassung',
    '',
    `- Stand: ${meta.stand}`,
    `- Basis: ${meta.basis}`,
    `- Projekt (Routen, Build-Ausgabe): ${meta.projekt}`,
    `- Zahl der Seiten: ${n}`,
    `- Seiten mit genau einem Footer-Link auf codayweb.de: ${einFooterLink.length} von ${n}`,
    '',
    `## Seiten ohne Footer-Link auf codayweb.de (${ohneFooterLink.length})`,
    listeOderKeine(ohneFooterLink.map((a) => `${a.pfad} (Status ${a.status})`)),
    '',
    `## Seiten mit mehr als einem Footer-Link (${mehrAlsEinFooterLink.length})`,
    listeOderKeine(mehrAlsEinFooterLink.map((a) => `${a.pfad}: ${a.footerZahl}`)),
    '',
    `## Seiten mit gefolgtem Link, rel ohne nofollow, sponsored, ugc (${gefolgt.length})`,
    listeOderKeine(
      gefolgt.map(
        (a) =>
          `${a.pfad}: ${a.links.map((l) => `${l.ort} rel="${l.rel}"`).join(', ')}`,
      ),
    ),
    '',
    `## Abweichungen Googlebot gegen Standard-Kennung (${abweichend.length})`,
    listeOderKeine(abweichend.map((a) => `${a.pfad}: ${a.abweichung.join(', ')}`)),
    '',
    `## Status weicht vom Erwarteten ab (${unerwartet.length})`,
    listeOderKeine(unerwartet.map((a) => `${a.pfad}: ${a.status} (erwartet ${ERWARTET[a.pfad] ?? 200})`)),
    '',
    '## Hinweise zur Seitenliste',
    listeOderKeine(meta.hinweise),
    '',
    '## Seiten',
    '| Seite | Quellen | Status | Footer | Außerhalb | Googlebot gleich |',
    '| --- | --- | --- | --- | --- | --- |',
    ...auswertungen.map(
      (a) =>
        `| ${a.pfad} | ${a.quellen.join(', ')} | ${a.status} | ${a.footerZahl} | ${a.aussenZahl} | ${a.abweichung.length ? 'nein' : 'ja'} |`,
    ),
    '',
  ];
  return zeilen.join('\n');
}

async function hauptlauf(args) {
  const basis = basisAus(args);
  const aus = await ausgabeOrdner(args);
  const projekt = projektAus(args);
  const { seiten, hinweise } = await seitenliste({ basis, projekt });
  console.log(`Seitenliste: ${seiten.length} Seiten gegen ${basis}`);
  for (const hinweis of hinweise) console.log(`Hinweis: ${hinweis}`);

  const zeilen = [KOPFZEILE];
  const auswertungen = [];
  for (const [index, { pfad, quellen }] of seiten.entries()) {
    const url = `${basis}${pfad}`;
    const standard = await abrufen(url, STANDARD_KENNUNG);
    const googlebot = await abrufen(url, GOOGLEBOT_KENNUNG);
    const a = { status: standard.status, ...analysiere(standard.text, url) };
    const g = { status: googlebot.status, ...analysiere(googlebot.text, url) };
    const abweichung = abweichungen(a, g);
    const footerZahl = a.links.filter((l) => l.ort === 'footer').length;
    const aussenZahl = a.links.length - footerZahl;
    const gleich = abweichung.length === 0 ? 'ja' : 'nein';

    const basisSpalten = [url, a.status, a.lang, a.robots, a.canonical, footerZahl, aussenZahl];
    const linkSpalten = a.links.length
      ? a.links.map((l) => [l.ort, l.href, l.text, l.rel, l.target])
      : [['', '', '', '', '']];
    for (const linkSpalte of linkSpalten) {
      zeilen.push([...basisSpalten, ...linkSpalte, gleich].map(tsvWert).join('\t'));
    }
    auswertungen.push({
      pfad,
      quellen,
      status: a.status,
      footerZahl,
      aussenZahl,
      links: a.links,
      abweichung,
    });
    console.log(
      `${String(index + 1).padStart(3)}/${seiten.length} ${pfad}  Status ${a.status}  Footer-Links ${footerZahl}  außen ${aussenZahl}  Googlebot gleich ${gleich}`,
    );
  }

  await ausschreiben(aus, 'links.tsv', `${zeilen.join('\n')}\n`);
  await ausschreiben(
    aus,
    'links-zusammenfassung.md',
    zusammenfassung(auswertungen, {
      stand: new Date().toISOString(),
      basis,
      projekt,
      hinweise,
    }),
  );
}

alsHauptprogramm(import.meta.url, NUTZUNG, hauptlauf);
