#!/usr/bin/env python3
"""Schriften für app/fonts reproduzierbar erzeugen (R3-PERF-01, KERN K-005/K-013).

Eingabe sind die unveränderten Originale (Fontsource 5.3.0, OFL-1.1):
  _relaunch/ausbau/referenz/b-runde1/fonts/  Bricolage Grotesque, Atkinson Hyperlegible Next
  _relaunch/richtungen/a/fonts/              Martian Mono
Ausgabe: sechs woff2-Dateien in app/fonts/ und ein Bericht (JSON) mit Größen, Prüfsummen und Treueprüfung.

Vorgehen je Datei:
  1. Achsen auf den genutzten Bereich legen (fontTools.varLib.instancer, Stufe L4 „Bereich“ bzw. L3 „fest“).
     Bedarf festgestellt mit _relaunch/werkzeuge/schriften/bedarf.mjs (alle Seiten, m390 und d1440):
       Bricolage  Gewicht 400–800 (ziffer im Fließtext 400–700, Zitat 500, h2 600, Titel 700, Display 800),
                  optische Größe 12–96 bleibt ganz (sie folgt der Schriftgröße 14–128 px)
       Atkinson   Gewicht 400–700 (Text 400, Bedienelemente 500/600, Hervorhebung 700)
       Martian    Breite fest 75 %, Gewicht 400–800 (genutzt 400–600; 700/800 kosten 0,7 KB und halten
                  font-bold an Maßen möglich)
  2. Teilmenge mit pyftsubset-Optionen: dieselben Zeichen wie das Original (also dieselben unicode-range-Bereiche
     wie in app/fonts/index.ts), Layout-Merkmale nur kern, liga, calt, tnum, lnum, case und rvrn (rvrn trägt die
     FeatureVariations von Martian Mono: $ und ¢ wechseln ab Gewicht 500 die Form), ohne Hinting, desubroutinisiert,
     woff2. Entfallen: frac, numr, dnom, pnum (nicht genutzt), ccmp, mark, mkmk (keine kombinierenden Zeichen im
     Inhalt), locl (nur Türkisch, Katalanisch, Niederländisch u. a.; die Seite ist lang="de").
  3. Treueprüfung: Original und Ergebnis werden an Stützstellen voll instanziert und verglichen – Zeichenvorrat,
     Umrisse, Vorschubbreiten, tnum-Ziffern und Unterschneidung (kern) für alle Paare der Prüfzeichen.

Aufruf (fontTools aus _relaunch/werkzeuge/fonttools-*.whl und brotli in einer venv):
  python3 -m venv <venv> && <venv>/bin/pip install _relaunch/werkzeuge/fonttools-4.66.1-*.whl brotli
  <venv>/bin/python -I _relaunch/werkzeuge/schriften/bauen.py [--nur-pruefen] [--bericht <datei.json>]

Reproduzierbar: head.modified bleibt der Wert des Originals (recalcTimestamp=False); zwei Läufe ergeben
bytegleiche Dateien (SHA-256 im Bericht).
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import io
import json
import logging
import sys
from pathlib import Path

import fontTools
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parents[3]
QUELLE_B = ROOT / "_relaunch/ausbau/referenz/b-runde1/fonts"
QUELLE_A = ROOT / "_relaunch/richtungen/a/fonts"
ZIEL = ROOT / "app/fonts"

MERKMALE = ["kern", "liga", "calt", "tnum", "lnum", "case", "rvrn"]

# Prüfzeichen: alles, was die Seiten heute setzen (bedarf.mjs), dazu Versalien-Umlaute, ẞ-freie Versalien und
# gängige Satzzeichen. Unterschneidung wird für jedes geordnete Paar geprüft.
PRUEFZEICHEN = (
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÄÖÜäöüß0123456789"
    " .,:;!?-–—„“”‚‘’\"'()[]/&%€§©·+*=@#…"
)

AUFTRAEGE = [
    # (Quelle, Ziel, Achsen nach dem Instanzieren, Stützstellen für die Treueprüfung)
    dict(
        quelle=QUELLE_B / "bricolage-grotesque-latin-opsz-normal.woff2",
        ziel="bricolage-grotesque-latin-opsz-wght400-800.woff2",
        achsen={"wght": (400, 800)},
        stuetz=[{"wght": w, "opsz": o} for w in (400, 500, 600, 700, 800) for o in (12, 14, 20, 32, 60, 96)],
    ),
    dict(
        quelle=QUELLE_B / "bricolage-grotesque-latin-ext-opsz-normal.woff2",
        ziel="bricolage-grotesque-latin-ext-opsz-wght400-800.woff2",
        achsen={"wght": (400, 800)},
        stuetz=[{"wght": w, "opsz": o} for w in (400, 700, 800) for o in (14, 32, 96)],
    ),
    dict(
        quelle=QUELLE_B / "atkinson-hyperlegible-next-latin-wght-normal.woff2",
        ziel="atkinson-hyperlegible-next-latin-wght400-700.woff2",
        achsen={"wght": (400, 700)},
        stuetz=[{"wght": w} for w in (400, 450, 500, 600, 650, 700)],
    ),
    dict(
        quelle=QUELLE_B / "atkinson-hyperlegible-next-latin-ext-wght-normal.woff2",
        ziel="atkinson-hyperlegible-next-latin-ext-wght400-700.woff2",
        achsen={"wght": (400, 700)},
        stuetz=[{"wght": w} for w in (400, 500, 700)],
    ),
    dict(
        quelle=QUELLE_A / "martian-mono-latin-wdth-normal.woff2",
        ziel="martian-mono-latin-wdth75-wght400-800.woff2",
        achsen={"wdth": 75, "wght": (400, 800)},
        stuetz=[{"wdth": 75, "wght": w} for w in (400, 450, 500, 600, 700, 800)],
    ),
    dict(
        quelle=QUELLE_A / "martian-mono-latin-ext-wdth-normal.woff2",
        ziel="martian-mono-latin-ext-wdth75-wght400-800.woff2",
        achsen={"wdth": 75, "wght": (400, 800)},
        stuetz=[{"wdth": 75, "wght": w} for w in (400, 500, 800)],
    ),
]


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def neu_laden(font: TTFont) -> TTFont:
    """Speichert unkomprimiert und lädt neu (frische Tabellen; der Teilmengenbildner stolpert sonst über
    gvar-Einträge, die der Instanzierer entfernt hat)."""
    puffer = io.BytesIO()
    font.flavor = None
    font.save(puffer)
    puffer.seek(0)
    return TTFont(puffer, recalcTimestamp=False)


def bauen(auftrag: dict) -> bytes:
    font = TTFont(auftrag["quelle"], recalcTimestamp=False)
    zeichen = sorted(font.getBestCmap().keys())
    font = instancer.instantiateVariableFont(font, auftrag["achsen"], inplace=False)
    font = neu_laden(font)

    opts = subset.Options()
    opts.flavor = "woff2"
    opts.hinting = False
    opts.desubroutinize = True
    opts.layout_features = MERKMALE
    opts.name_IDs = ["*"]
    opts.name_languages = ["*"]
    opts.name_legacy = True
    opts.notdef_outline = True
    opts.glyph_names = False
    opts.recalc_timestamp = False
    teil = subset.Subsetter(opts)
    teil.populate(unicodes=zeichen)
    teil.subset(font)

    puffer = io.BytesIO()
    font.flavor = "woff2"
    font.save(puffer)
    return puffer.getvalue()


# ---------- Treueprüfung ----------

def voll_instanz(font: TTFont, ort: dict) -> TTFont:
    achsen = {a.axisTag for a in font["fvar"].axes} if "fvar" in font else set()
    ort = {k: v for k, v in ort.items() if k in achsen}
    if not ort:
        return font
    return neu_laden(instancer.instantiateVariableFont(copy.deepcopy(font), ort, inplace=False))


def tnum_abbildung(font: TTFont) -> dict:
    """Glyphe → tabellarische Glyphe (GSUB tnum, Einzelersetzung)."""
    abb = {}
    if "GSUB" not in font:
        return abb
    tab = font["GSUB"].table
    for rec in tab.FeatureList.FeatureRecord:
        if rec.FeatureTag != "tnum":
            continue
        for idx in rec.Feature.LookupListIndex:
            lookup = tab.LookupList.Lookup[idx]
            for st in lookup.SubTable:
                typ = lookup.LookupType
                if typ == 7:
                    typ, st = st.ExtensionLookupType, st.ExtSubTable
                if typ == 1:
                    abb.update(st.mapping)
    return abb


def kern_paare(font: TTFont):
    """Unterschneidung eines voll instanzierten Fonts: Funktion (links, rechts) → XAdvance."""
    if "GPOS" not in font:
        return lambda a, b: 0
    tab = font["GPOS"].table
    # Mehrere kern-Einträge (je Schriftsystem) zeigen auf dieselben Lookups: jeden Lookup einmal, in Listenfolge.
    indizes = sorted({idx for rec in tab.FeatureList.FeatureRecord if rec.FeatureTag == "kern" for idx in rec.Feature.LookupListIndex})
    cov = []
    for idx in indizes:
        lookup = tab.LookupList.Lookup[idx]
        subs = []
        for st in lookup.SubTable:
            typ = lookup.LookupType
            if typ == 9:
                typ, st = st.ExtensionLookupType, st.ExtSubTable
            if typ == 2:
                subs.append((st, set(st.Coverage.glyphs)))
        cov.append(subs)

    def wert(a: str, b: str) -> int:
        summe = 0
        for subs in cov:
            for st, glyphen in subs:
                if a not in glyphen:
                    continue
                if st.Format == 1:
                    ps = st.PairSet[st.Coverage.glyphs.index(a)]
                    treffer = next((r for r in ps.PairValueRecord if r.SecondGlyph == b), None)
                    if treffer is None:
                        continue
                    summe += getattr(treffer.Value1, "XAdvance", 0) or 0
                    break
                k1 = st.ClassDef1.classDefs.get(a, 0)
                k2 = st.ClassDef2.classDefs.get(b, 0)
                rec = st.Class1Record[k1].Class2Record[k2]
                summe += getattr(rec.Value1, "XAdvance", 0) or 0
                break
        return summe

    return wert


def umriss(font: TTFont, glyphe: str):
    glyf = font["glyf"]
    koord, enden, _ = glyf[glyphe].getCoordinates(glyf)
    return [tuple(p) for p in koord], list(enden)


def pruefen(quelle: Path, ergebnis: bytes, stuetz: list[dict]) -> dict:
    orig = TTFont(quelle, recalcTimestamp=False)
    neu = TTFont(io.BytesIO(ergebnis), recalcTimestamp=False)
    cmap_o, cmap_n = orig.getBestCmap(), neu.getBestCmap()
    befund = {
        "zeichen_gleich": sorted(cmap_o) == sorted(cmap_n),
        "zeichen": len(cmap_n),
        "stuetzstellen": len(stuetz),
        "max_umriss_abweichung": 0,
        "max_vorschub_abweichung": 0,
        "max_kern_abweichung": 0,
        "kern_paare_geprueft": 0,
        "kern_paare_ungleich_null": 0,
        "upm": neu["head"].unitsPerEm,
        "fehler": [],
    }
    pruef = [ord(c) for c in PRUEFZEICHEN if ord(c) in cmap_n]
    for ort in stuetz:
        fo, fn = voll_instanz(orig, ort), voll_instanz(neu, ort)
        co, cn = fo.getBestCmap(), fn.getBestCmap()
        paare = [(co[u], cn[u]) for u in sorted(cmap_n)]
        to, tn = tnum_abbildung(fo), tnum_abbildung(fn)
        paare += [(to[go], tn[gn]) for go, gn in paare if go in to and gn in tn]
        for go, gn in paare:
            ko, eo = umriss(fo, go)
            kn, en = umriss(fn, gn)
            if eo != en or len(ko) != len(kn):
                befund["fehler"].append(f"{ort} {go}: Konturen verschieden")
                continue
            d = max((max(abs(a[0] - b[0]), abs(a[1] - b[1])) for a, b in zip(ko, kn)), default=0)
            befund["max_umriss_abweichung"] = max(befund["max_umriss_abweichung"], d)
            dv = abs(fo["hmtx"][go][0] - fn["hmtx"][gn][0])
            befund["max_vorschub_abweichung"] = max(befund["max_vorschub_abweichung"], dv)
        ko_, kn_ = kern_paare(fo), kern_paare(fn)
        for a in pruef:
            for b in pruef:
                vo, vn = ko_(co[a], co[b]), kn_(cn[a], cn[b])
                befund["kern_paare_geprueft"] += 1
                if vo:
                    befund["kern_paare_ungleich_null"] += 1
                befund["max_kern_abweichung"] = max(befund["max_kern_abweichung"], abs(vo - vn))
    return befund


def achsen_von(data: bytes) -> dict:
    font = TTFont(io.BytesIO(data))
    if "fvar" not in font:
        return {}
    return {a.axisTag: [a.minValue, a.defaultValue, a.maxValue] for a in font["fvar"].axes}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--nur-pruefen", action="store_true", help="nichts schreiben, nur bauen und mit app/fonts vergleichen")
    parser.add_argument("--ohne-treue", action="store_true", help="Treueprüfung auslassen (schneller)")
    parser.add_argument("--bericht", default=str(ROOT / "_relaunch/belege/r3-perf-01/schriften.json"))
    args = parser.parse_args()
    logging.getLogger("fontTools").setLevel(logging.ERROR)

    bericht = {"fonttools": fontTools.version, "merkmale": MERKMALE, "dateien": []}
    ok = True
    for auftrag in AUFTRAEGE:
        daten = bauen(auftrag)
        ziel = ZIEL / auftrag["ziel"]
        eintrag = {
            "datei": auftrag["ziel"],
            "quelle": str(auftrag["quelle"].relative_to(ROOT)),
            "quelle_bytes": auftrag["quelle"].stat().st_size,
            "quelle_sha256": sha256(auftrag["quelle"].read_bytes()),
            "achsen_festgelegt": {k: list(v) if isinstance(v, tuple) else v for k, v in auftrag["achsen"].items()},
            "achsen_ergebnis": achsen_von(daten),
            "bytes": len(daten),
            "sha256": sha256(daten),
        }
        if args.nur_pruefen:
            eintrag["gleich_wie_app_fonts"] = ziel.exists() and ziel.read_bytes() == daten
            ok &= eintrag["gleich_wie_app_fonts"]
        else:
            ziel.write_bytes(daten)
        if not args.ohne_treue:
            eintrag["treue"] = pruefen(auftrag["quelle"], daten, auftrag["stuetz"])
            t = eintrag["treue"]
            ok &= t["zeichen_gleich"] and not t["fehler"] and t["max_kern_abweichung"] <= 1 and t["max_vorschub_abweichung"] <= 1
        bericht["dateien"].append(eintrag)
        print(f"{auftrag['ziel']:52s} {eintrag['quelle_bytes']:7d} → {len(daten):6d} B  {eintrag['achsen_ergebnis']}"
              + (f"  Treue: Umriss ±{eintrag['treue']['max_umriss_abweichung']} Vorschub ±{eintrag['treue']['max_vorschub_abweichung']}"
                 f" Kern ±{eintrag['treue']['max_kern_abweichung']} ({eintrag['treue']['kern_paare_ungleich_null']} Paare ≠ 0)" if "treue" in eintrag else ""))
    summe = sum(e["bytes"] for e in bericht["dateien"])
    vorher = sum(e["quelle_bytes"] for e in bericht["dateien"])
    bericht["summe_bytes"] = summe
    bericht["summe_vorher_bytes"] = vorher
    print(f"Summe {vorher} → {summe} B ({summe / 1024:.1f} KiB)")
    if args.bericht:
        Path(args.bericht).parent.mkdir(parents=True, exist_ok=True)
        Path(args.bericht).write_text(json.dumps(bericht, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
