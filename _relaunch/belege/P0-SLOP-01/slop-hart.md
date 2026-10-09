# Slop-Prüfung, harte Befunde S-01 bis S-07 · P0-SLOP-01

Erstellt 2026-10-09T07:50:43.670Z · Basis http://localhost:3500

Messbedingungen Rendern: Ansichten m375, d1440 · hell · Bewegung no-preference · S-07: domcontentloaded + 300 ms; Rest: networkidle + fonts.ready + 600 ms, dann scrollThrough (mit html{scroll-behavior:auto!important}, damit das Seitenende erreicht wird; Abdeckung steht je Seite in s02.scrollAbdeckung) + 500 ms · Stichprobe S-05 60 Elemente · Tab-Stopps 15 · axe-Regeln color-contrast
Messbedingungen Code: 245 Dateien (.ts, .tsx, .css) in app, components, lib; ausgeschlossen __tests__, *.test.ts(x), *.spec.ts(x), node_modules, .next.
Tokens aus app/styles/theme.css: 42 Farbwerte · Radien 0/6/10/14/20/28/9999 px + full · Schatten xs/sm/lg · Dauern 0/0.15/0.22/0.28 s · Schriftstufen footnote/callout/body/lead/title-3/title-2/title-1/display/numeral

## Zählung je S-Kennung

| Befund | Code | Gerendert (Summe der Seitenansichten) |
| --- | --- | --- |
| S-01 Erfundenes oder Platzhalter | 28 Treffer (davon 15 übrige, 13 Platzhalter-Attribut) | 6 sichtbare Treffer · 0 Feldplatzhalter mit Muster (von 0) |
| S-02 Effektteppich | – | 0 von 164 Abschnitten mit Scroll-Auftritt · 0 von 24 Seitenansichten über 50 % · 236 Animationen nach Scroll |
| S-03 Unzugänglich | – | Kontrast 0 Verletzungen (10 unklar) · Fokus 0 von 350 Tab-Stopps ohne 2-px-Outline |
| S-04 Gemischte Bildsprache | Quellen lucide-react: 71 · 34 verschiedene Icons · 3 eigene SVG-Komponenten · Icon-Marken ohne strokeWidth 0 · Emojis im Code 0 | Emojis 0 (+ 24 typografisch) · höchstens 3 verschiedene Strichstärken je Seite (Icons) |
| S-05 Ungeordnete Werte | -[ Wertklassen 14 (tokenrelevant 1) · duration-/delay-Zahl 2 · Hex 0 · Inline-style frei 17 · CSS frei 15 · JS-Dauern/Kurven 2 | schriftgroesse 82 · radius 0 · schatten 0 · farbe 0 · hintergrund 0 · dauer 0 (Elemente außerhalb Token, Summe der Seitenansichten) |
| S-06 Halbe Zustände | – | 719 interaktive Elemente · ohne Hover-Stil 135 (am Element selbst 175) · ohne :focus-visible-Stil 0 · Felder ohne aria-invalid-Stil 0 |
| S-07 Blockierender Auftakt | 36 Treffer (davon 0 Kandidaten) | h1 nach 300 ms nicht sichtbar 0 · Scrollen nicht möglich 0 · Vollbild-Überlagerung 0 · Zähleränderungen 0 |

## Teil A: Code

### S-01 Platzhalter-Muster

Muster lorem|ipsum|placeholder|platzhalter|beispiel@|max mustermann|alexander koch|dummy|todo:|xxx (ohne Beachtung der Groß-/Kleinschreibung). Nach Muster: placeholder: 22 · platzhalter: 4 · max mustermann: 1 · alexander koch: 1. „platzhalter-attribut“ = HTML-/Props-/Tailwind-Verwendung des Wortes placeholder; der Inhalt steht in `text` und ist zu prüfen. Erfundene Zahlen, Stimmen oder Auszeichnungen sind per Muster nicht erkennbar (Handprüfung gegen Quellen).

### Fundstellen S-01 (28)

| Datei:Zeile | Muster | Art | Zeile |
| --- | --- | --- | --- |
| app/api/maps/config/route.ts:23 | platzhalter | text-oder-name (Kommentar) | `// Platzhalter aus .env.example gelten als nicht gesetzt.` |
| app/api/maps/config/route.ts:25 | placeholder | text-oder-name | `!apiKey \|\| apiKey === 'MY_GOOGLE_MAPS_API_KEY' \|\| apiKey.startsWith('AIzaSy_placeholder')` |
| components/mappe/MappePreview.tsx:65 | placeholder | platzhalter-attribut | `function Filled({ value, placeholder }: { value: string; placeholder: string }) {` |
| components/mappe/MappePreview.tsx:66 | placeholder | platzhalter-attribut | `return value.trim() ? <>{value.trim()}</> : <span className={styles.placeholder}>{placeholder}</span>;` |
| components/mappe/MappePreview.tsx:82 | placeholder | platzhalter-attribut | `<Filled value={person.name} placeholder="Dein Name" />` |
| components/mappe/MappePreview.tsx:85 | placeholder | platzhalter-attribut | `{contact \|\| <span className={styles.placeholder}>Wohnort · Telefon · E-Mail</span>}` |
| components/mappe/MappePreview.tsx:212 | placeholder | platzhalter-attribut | `<Filled value={person.name} placeholder="Dein Name" />` |
| components/mappe/StationsEditor.tsx:14 | placeholder | platzhalter-attribut | `placeholder?: string;` |
| components/mappe/StationsEditor.tsx:184 | placeholder | platzhalter-attribut | `placeholder={field.placeholder}` |
| components/mappe/StationsEditor.tsx:193 | placeholder | platzhalter-attribut | `placeholder={field.placeholder}` |
| components/mappe/StationsSection.tsx:18 | placeholder | text-oder-name | `const PERIOD_PLACEHOLDER = 'z. B. 08/2021 – heute';` |
| components/mappe/StationsSection.tsx:24 | placeholder | platzhalter-attribut | `{ key: 'period', label: 'Zeitraum', placeholder: PERIOD_PLACEHOLDER, maxLength: MAPPE_LIMITS.period, half: tru` |
| components/mappe/StationsSection.tsx:45 | placeholder | platzhalter-attribut | `{ key: 'period', label: 'Zeitraum', placeholder: PERIOD_PLACEHOLDER, maxLength: MAPPE_LIMITS.period, half: tru` |
| components/mappe/mappe.module.css:103 | placeholder | platzhalter-attribut | `.placeholder {` |
| components/mappe/mappe.module.css:135 | placeholder | platzhalter-attribut | `.placeholder {` |
| components/ui/Input.tsx:11 | placeholder | platzhalter-attribut | `'w-full rounded-sm border border-line-strong bg-surface text-ink placeholder:text-ink-muted',` |
| lib/applications/normalize.ts:49 | max mustermann | text-oder-name (Kommentar) | `/** Erstes Wort des Namens, z. B. „Max“ aus „Max Mustermann“. */` |
| lib/data/team.ts:16 | alexander koch | text-oder-name | `name: 'Alexander Koch',` |
| lib/env.ts:11 | placeholder | text-oder-name | `const PLACEHOLDER_PATTERNS: readonly RegExp[] = [` |
| lib/env.ts:14 | placeholder | text-oder-name | `/placeholder/i,` |
| lib/env.ts:19 | platzhalter | text-oder-name (Kommentar) | `/** Leere Werte und offensichtliche Platzhalter aus .env.example gelten als nicht gesetzt. */` |
| lib/env.ts:20 | placeholder | text-oder-name | `export function isPlaceholder(value: string \| null \| undefined): boolean {` |
| lib/env.ts:22 | placeholder | text-oder-name | `return trimmed === '' \|\| PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));` |
| lib/env.ts:27 | placeholder | text-oder-name | `(value) => (typeof value === 'string' && !isPlaceholder(value) ? value.trim() : undefined),` |
| lib/mappe/template.ts:7 | platzhalter | text-oder-name (Kommentar) | `* falsch oder erfunden war: kein Platzhaltername, keine leeren Aufzählungen,` |
| lib/maps/keys.ts:1 | placeholder | text-oder-name (Kommentar) | `/** Empty values and the .env.example placeholders count as "no key" (same rule as /api/maps/config). */` |
| lib/maps/keys.ts:4 | placeholder | text-oder-name | `return value !== '' && value !== 'MY_GOOGLE_MAPS_API_KEY' && !value.startsWith('AIzaSy_placeholder');` |
| lib/security/ip.ts:27 | platzhalter | text-oder-name (Kommentar) | `* IP_HASH_SALT über lib/env.ts (mind. 32 Zeichen, Platzhalter zählen nicht). Fehlt er, wirft jeder` |

### S-04 Icon-Quellen und Strichstärken

Icon-Quellen: lucide-react: 71 · verschiedene Icons: 34 · Importe: 71 · eigene SVG-Komponenten: 3 · SVG-Dateiimporte: 0

strokeWidth/stroke-width im Code (Wert: Anzahl): 1: 2 · 2: 16 · 4: 1 · 1.75: 45 · 2.5: 4 · 1.5: 3 · 2.25: 3

| Quelle | Icon | Dateien | Verwendungen | Fundstellen (Datei:Zeile des Imports) |
| --- | --- | --- | --- | --- |
| lucide-react | Check | 6 | 7 | components/apply/thanks/ThankYouView.tsx:5, components/jobs/JobSections.tsx:1, components/maps/RegionExplorer.tsx:5 |
| lucide-react | MessageCircle | 7 | 6 | app/error.tsx:5, components/apply/FlowShortcuts.tsx:5, components/apply/SubmitErrorPanel.tsx:1 |
| lucide-react | CircleAlert | 5 | 5 | components/apply/SubmitErrorPanel.tsx:1, components/mappe/MappeActions.tsx:4, components/ui/Checkbox.tsx:2 |
| lucide-react | X | 4 | 5 | components/site/MobileNav.tsx:6, components/ui/Sheet.tsx:4, components/ui/StepHeader.tsx:2 |
| lucide-react | Phone | 5 | 4 | app/error.tsx:5, components/apply/SubmitErrorPanel.tsx:1, components/site/ContactOptions.tsx:2 |
| lucide-react | CircleCheck | 4 | 4 | components/apply/steps.tsx:2, components/apply/thanks/FollowUpForm.tsx:4, components/mappe/MappeActions.tsx:4 |
| lucide-react | Plus | 3 | 3 | components/apply/ContactStep.tsx:5, components/mappe/SkillsSection.tsx:4, components/mappe/StationsEditor.tsx:4 |
| lucide-react | ChevronDown | 3 | 3 | components/mappe/JobSection.tsx:4, components/maps/RegionExplorer.tsx:5, components/ui/Disclosure.tsx:2 |
| lucide-react | ShieldCheck | 2 | 2 | app/bewerbung/page.tsx:2, components/home/ProcessTimeline.tsx:2 |
| lucide-react | RotateCcw | 2 | 2 | app/error.tsx:5, components/mappe/LetterSection.tsx:3 |
| lucide-react | FileText | 2 | 2 | components/apply/ContactStep.tsx:5, components/apply/FlowShortcuts.tsx:5 |
| lucide-react | ArrowRight | 2 | 2 | components/apply/steps.tsx:2, components/jobs/JobCard.tsx:1 |
| lucide-react | ArrowDown | 2 | 2 | components/home/Hero.tsx:2, components/mappe/StationsEditor.tsx:4 |
| lucide-react | Trash2 | 2 | 2 | components/mappe/PersonalSection.tsx:4, components/mappe/StationsEditor.tsx:4 |
| lucide-react | ChevronRight | 2 | 2 | components/reviews/ReviewScroller.tsx:4, components/ui/Breadcrumbs.tsx:2 |
| lucide-react | RotateCw | 1 | 1 | components/apply/SubmitErrorPanel.tsx:1 |
| lucide-react | Mail | 2 | 1 | components/apply/thanks/ThankYouView.tsx:5, components/site/ContactOptions.tsx:2 |
| lucide-react | UserPlus | 1 | 1 | components/apply/thanks/ThankYouView.tsx:5 |
| lucide-react | Printer | 1 | 1 | components/mappe/MappeActions.tsx:4 |
| lucide-react | Camera | 1 | 1 | components/mappe/PersonalSection.tsx:4 |
| lucide-react | ArrowUp | 1 | 1 | components/mappe/StationsEditor.tsx:4 |
| lucide-react | EyeOff | 1 | 1 | components/maps/RegionExplorer.tsx:5 |
| lucide-react | Map | 1 | 1 | components/maps/RegionExplorer.tsx:5 |
| lucide-react | ChevronLeft | 1 | 1 | components/reviews/ReviewScroller.tsx:4 |
| lucide-react | Menu | 1 | 1 | components/site/MobileNav.tsx:6 |
| lucide-react | ArrowLeft | 1 | 1 | components/ui/StepHeader.tsx:2 |
| lucide-react | Banknote | 1 | 0 | components/home/BenefitGrid.tsx:2 |
| lucide-react | CalendarOff | 1 | 0 | components/home/BenefitGrid.tsx:2 |
| lucide-react | FileCheck | 1 | 0 | components/home/BenefitGrid.tsx:2 |
| lucide-react | GraduationCap | 1 | 0 | components/home/BenefitGrid.tsx:2 |
| lucide-react | TabletSmartphone | 1 | 0 | components/home/BenefitGrid.tsx:2 |
| lucide-react | Truck | 1 | 0 | components/home/BenefitGrid.tsx:2 |
| lucide-react | Users | 1 | 0 | components/home/BenefitGrid.tsx:2 |
| lucide-react | Wrench | 1 | 0 | components/home/BenefitGrid.tsx:2 |

JSX-Marken der Icon-Komponenten: 66 gesamt, 66 mit strokeWidth, 0 ohne (Bibliotheksvoreinstellung).

### Icon-Marken ohne strokeWidth (0)

Keine.

### Eigene SVG-Komponenten (<svg im JSX) (3)

| Datei:Zeile | Komponente | Zeile |
| --- | --- | --- |
| components/apply/thanks/CheckMark.tsx:8 | CheckMark | `<svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" st` |
| components/maps/RadiusGraphic.tsx:27 | RadiusGraphic | `<svg` |
| components/ui/Rating.tsx:39 | Rating | `<svg` |

### strokeWidth/stroke-width (74)

| Datei:Zeile | Art | Wert |
| --- | --- | --- |
| app/bewerbung/page.tsx:83 | strokeWidth | `1.75` |
| app/error.tsx:38 | strokeWidth | `1.75` |
| app/error.tsx:48 | strokeWidth | `1.75` |
| app/error.tsx:55 | strokeWidth | `1.75` |
| components/apply/ContactStep.tsx:197 | strokeWidth | `2` |
| components/apply/ContactStep.tsx:205 | strokeWidth | `1.75` |
| components/apply/FlowShortcuts.tsx:47 | strokeWidth | `1.75` |
| components/apply/FlowShortcuts.tsx:54 | strokeWidth | `1.75` |
| components/apply/SubmitErrorPanel.tsx:30 | strokeWidth | `2` |
| components/apply/SubmitErrorPanel.tsx:39 | strokeWidth | `2` |
| components/apply/SubmitErrorPanel.tsx:45 | strokeWidth | `2` |
| components/apply/SubmitErrorPanel.tsx:51 | strokeWidth | `2` |
| components/apply/steps.tsx:32 | strokeWidth | `2` |
| components/apply/steps.tsx:104 | strokeWidth | `2` |
| components/apply/thanks/CheckMark.tsx:8 | strokeWidth | `2.5` |
| components/apply/thanks/FollowUpForm.tsx:97 | strokeWidth | `2` |
| components/apply/thanks/ThankYouView.tsx:123 | strokeWidth | `1.75` |
| components/apply/thanks/ThankYouView.tsx:157 | strokeWidth | `1.75` |
| components/apply/thanks/ThankYouView.tsx:164 | strokeWidth | `1.75` |
| components/apply/thanks/ThankYouView.tsx:217 | strokeWidth | `2.5` |
| components/home/BenefitGrid.tsx:61 | strokeWidth | `1.75` |
| components/home/Hero.tsx:34 | strokeWidth | `1.75` |
| components/home/ProcessTimeline.tsx:37 | strokeWidth | `1.75` |
| components/jobs/JobCard.tsx:37 | strokeWidth | `1.75` |
| components/jobs/JobSections.tsx:31 | strokeWidth | `2` |
| components/mappe/JobSection.tsx:24 | strokeWidth | `1.75` |
| components/mappe/LetterSection.tsx:73 | strokeWidth | `1.75` |
| components/mappe/MappeActions.tsx:76 | strokeWidth | `1.75` |
| components/mappe/MappeActions.tsx:85 | strokeWidth | `2` |
| components/mappe/MappeActions.tsx:97 | strokeWidth | `2` |
| components/mappe/PersonalSection.tsx:110 | strokeWidth | `1.75` |
| components/mappe/PersonalSection.tsx:115 | strokeWidth | `1.75` |
| components/mappe/SkillsSection.tsx:83 | strokeWidth | `1.75` |
| components/mappe/StationsEditor.tsx:145 | strokeWidth | `1.75` |
| components/mappe/StationsEditor.tsx:153 | strokeWidth | `1.75` |
| components/mappe/StationsEditor.tsx:156 | strokeWidth | `1.75` |
| components/mappe/StationsEditor.tsx:210 | strokeWidth | `1.75` |
| components/maps/RadiusGraphic.tsx:43 | strokeWidth | `1` |
| components/maps/RadiusGraphic.tsx:52 | strokeWidth | `1` |
| components/maps/RadiusGraphic.tsx:76 | strokeWidth | `1.5` |
| components/maps/RadiusGraphic.tsx:89 | strokeWidth | `1.5` |
| components/maps/RadiusGraphic.tsx:93 | strokeWidth | `2` |
| components/maps/RadiusGraphic.tsx:105 | strokeWidth | `4` |
| components/maps/RegionExplorer.tsx:94 | strokeWidth | `1.75` |
| components/maps/RegionExplorer.tsx:99 | strokeWidth | `1.75` |
| components/maps/RegionExplorer.tsx:187 | strokeWidth | `2.25` |
| components/maps/RegionExplorer.tsx:229 | strokeWidth | `1.75` |
| components/reviews/ReviewScroller.tsx:108 | strokeWidth | `1.75` |
| components/reviews/ReviewScroller.tsx:118 | strokeWidth | `1.75` |
| components/site/ContactOptions.tsx:67 | strokeWidth | `1.75` |
| components/site/ContactOptions.tsx:98 | strokeWidth | `1.75` |
| components/site/HeaderBar.tsx:106 | strokeWidth | `1.75` |
| components/site/MobileNav.tsx:51 | strokeWidth | `1.75` |
| components/site/MobileNav.tsx:94 | strokeWidth | `1.75` |
| components/site/MobileNav.tsx:131 | strokeWidth | `1.75` |
| components/site/MobileNav.tsx:136 | strokeWidth | `1.75` |
| components/site/StickyApplyBarClient.tsx:222 | strokeWidth | `1.75` |
| components/ui/Breadcrumbs.tsx:25 | strokeWidth | `1.75` |
| components/ui/Checkbox.tsx:52 | strokeWidth | `2` |
| components/ui/Chip.tsx:24 | strokeWidth | `2.25` |

… 14 weitere in slop-hart.json

### Emojis/Pictogramme im Code (2)

| Datei:Zeile | Zeichen | Codepoint | typografisch |
| --- | --- | --- | --- |
| components/site/SiteFooter.tsx:58 | © | U+A9 | true |
| components/site/SiteFooter.tsx:141 | © | U+A9 | true |

### S-05 Freie Werte im Code

Eckige Klammern gesamt 26: Wertklassen 14 (nach Kategorie: mass: 11 · transition-property: 2 · abstand: 1; nach Werttyp: funktion: 8 · laenge: 4 · anderes: 2) · Varianten-Selektoren 2 · Eigenschaften in Klammern 3

Zählgröße für den Lint-Teil von S-05 = eckigWertklassen + zahlDauerKlassen + hexwerteOhneAnker + inlineStyleFrei + cssFreieWerte(dauer). „variante“ = eckige Klammer als Selektor (data-[…]:, aria-[…]:, [&_svg]:), kein freier Wert; min-/max-Breakpoints stehen unter kategorie „breakpoint“. Zeilen mit design-allow sind markiert, aber mitgezählt.

### Tailwind-Wertklassen mit -[…] (14)

| Datei:Zeile | Token | Kategorie | Werttyp |
| --- | --- | --- | --- |
| components/apply/FlowShortcuts.tsx:29 | `grid-cols-[auto_1fr]` | mass | laenge |
| components/apply/FlowShortcuts.tsx:36 | `mt-[calc((1lh_-_1.25rem)/2)]` | abstand | funktion |
| components/apply/thanks/CheckMark.tsx:13 | `transition-[stroke-dashoffset]` | transition-property | anderes |
| components/apply/thanks/ThankYouView.tsx:92 | `sm:grid-cols-[auto_1fr]` | mass | laenge |
| components/jobs/ApplyAnchorButton.tsx:36 | `grid-rows-[1fr]` | mass | laenge |
| components/jobs/ApplyAnchorButton.tsx:36 | `transition-[grid-template-rows,opacity]` | transition-property | anderes |
| components/jobs/ApplyAnchorButton.tsx:36 | `data-folded:grid-rows-[0fr]` | mass | laenge |
| components/legal/LegalDocument.tsx:32 | `grid-cols-[minmax(0,1fr)]` | mass | funktion |
| components/legal/LegalDocument.tsx:32 | `lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]` | mass | funktion |
| components/legal/LegalFacts.tsx:25 | `grid-cols-[minmax(0,1fr)]` | mass | funktion |
| components/legal/LegalFacts.tsx:25 | `sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]` | mass | funktion |
| components/mappe/MappeTool.tsx:238 | `lg:max-h-[calc(100dvh-6rem)]` | mass | funktion |
| components/reviews/ReviewScroller.tsx:145 | `sm:basis-[calc(50%-0.5rem)]` | mass | funktion |
| components/reviews/ReviewScroller.tsx:145 | `lg:basis-[calc((100%-2rem)/3)]` | mass | funktion |

### Eckige Klammern als Variante oder Eigenschaft (kein freier Wert, zur Kenntnis) (12)

| Datei:Zeile | Token | Art/Kategorie |
| --- | --- | --- |
| components/apply/thanks/CheckMark.tsx:13 | `[stroke-dashoffset:0]` | eigenschaft/eigenschaft-in-klammern |
| components/apply/thanks/CheckMark.tsx:13 | `[stroke-dashoffset:1]` | eigenschaft/eigenschaft-in-klammern |
| components/brand/Logo.tsx:35 | `in-data-[tone=inverse]:brightness-0` | variante/variante |
| components/brand/Logo.tsx:35 | `in-data-[tone=inverse]:invert` | variante/variante |
| components/reviews/ReviewScroller.tsx:139 | `[scrollbar-width:none]` | eigenschaft/eigenschaft-in-klammern |
| lib/applications/reference.ts:21 | `-[${REFERENCE_ALPHABET}]` | regex-vermutet/kein Tailwind (regulärer Ausdruck oder Vorlage) |
| lib/apply/draft.ts:45 | `-[0-9a-f]` | regex-vermutet/kein Tailwind (regulärer Ausdruck oder Vorlage) |
| lib/apply/draft.ts:45 | `-[0-9a-f]` | regex-vermutet/kein Tailwind (regulärer Ausdruck oder Vorlage) |
| lib/apply/draft.ts:45 | `-[0-9a-f]` | regex-vermutet/kein Tailwind (regulärer Ausdruck oder Vorlage) |
| lib/apply/draft.ts:45 | `-[0-9a-f]` | regex-vermutet/kein Tailwind (regulärer Ausdruck oder Vorlage) |
| lib/jobs/schema.ts:18 | `?:-[a-z0-9]+)*$/` | regex-vermutet/kein Tailwind (regulärer Ausdruck oder Vorlage) |
| lib/jobs/schema.ts:107 | `/^SHK-[A-Z]` | regex-vermutet/kein Tailwind (regulärer Ausdruck oder Vorlage) |

### duration-/delay-Klassen mit Zahl (2)

| Datei:Zeile | Klasse |
| --- | --- |
| components/apply/thanks/CheckMark.tsx:13 | `delay-150` |
| components/apply/thanks/CheckMark.tsx:13 | `duration-500` |

### Hexwerte in TSX (38)

| Datei:Zeile | Wert | Anker? | Ausnahmekandidat | Zeile |
| --- | --- | --- | --- | --- |
| app/layout.tsx:29 | #FFFFFF | ja | – | `{ media: '(prefers-color-scheme: light)', color: '#FFFFFF' },` |
| app/layout.tsx:30 | #0B0F17 | ja | – | `{ media: '(prefers-color-scheme: dark)', color: '#0B0F17' },` |
| lib/email/templates/layout.ts:14 | #F5F6F8 | ja | – | `page: '#F5F6F8',` |
| lib/email/templates/layout.ts:15 | #FFFFFF | ja | – | `card: '#FFFFFF',` |
| lib/email/templates/layout.ts:16 | #F5F6F8 | ja | – | `subtle: '#F5F6F8',` |
| lib/email/templates/layout.ts:17 | #0A1E3A | ja | – | `ink: '#0A1E3A',` |
| lib/email/templates/layout.ts:18 | #5F6878 | ja | – | `muted: '#5F6878',` |
| lib/email/templates/layout.ts:19 | #E3E6EB | ja | – | `line: '#E3E6EB',` |
| lib/email/templates/layout.ts:20 | #C51E1E | ja | – | `accent: '#C51E1E',` |
| lib/email/templates/layout.ts:21 | #FFFFFF | ja | – | `onAccent: '#FFFFFF',` |
| lib/email/templates/layout.ts:22 | #047857 | ja | – | `success: '#047857',` |
| lib/email/templates/layout.ts:23 | #E8F5EF | ja | – | `successSubtle: '#E8F5EF',` |
| lib/email/templates/layout.ts:24 | #B42318 | ja | – | `danger: '#B42318',` |
| lib/email/templates/layout.ts:25 | #FDECEA | ja | – | `dangerSubtle: '#FDECEA',` |
| lib/maps/google-maps-config.ts:73 | #F5F6F8 | ja | – | `land: '#F5F6F8',` |
| lib/maps/google-maps-config.ts:74 | #DCE5EE | ja | – | `water: '#DCE5EE',` |
| lib/maps/google-maps-config.ts:75 | #FFFFFF | ja | – | `road: '#FFFFFF',` |
| lib/maps/google-maps-config.ts:76 | #E3E6EB | ja | – | `roadMajor: '#E3E6EB',` |
| lib/maps/google-maps-config.ts:77 | #5F6878 | ja | – | `label: '#5F6878',` |
| lib/maps/google-maps-config.ts:78 | #0A1E3A | ja | – | `labelStrong: '#0A1E3A',` |
| lib/maps/google-maps-config.ts:79 | #FFFFFF | ja | – | `labelHalo: '#FFFFFF',` |
| lib/maps/google-maps-config.ts:80 | #0A1E3A | ja | – | `ink: '#0A1E3A',` |
| lib/maps/google-maps-config.ts:81 | #FFFFFF | ja | – | `surface: '#FFFFFF',` |
| lib/maps/google-maps-config.ts:82 | #7D8696 | ja | – | `lineStrong: '#7D8696',` |
| lib/maps/google-maps-config.ts:85 | #121826 | ja | – | `land: '#121826',` |
| lib/maps/google-maps-config.ts:86 | #0B0F17 | ja | – | `water: '#0B0F17',` |
| lib/maps/google-maps-config.ts:87 | #1A2131 | ja | – | `road: '#1A2131',` |
| lib/maps/google-maps-config.ts:88 | #232B3A | ja | – | `roadMajor: '#232B3A',` |
| lib/maps/google-maps-config.ts:89 | #A3ACBA | ja | – | `label: '#A3ACBA',` |
| lib/maps/google-maps-config.ts:90 | #F2F4F7 | ja | – | `labelStrong: '#F2F4F7',` |
| lib/maps/google-maps-config.ts:91 | #0B0F17 | ja | – | `labelHalo: '#0B0F17',` |
| lib/maps/google-maps-config.ts:92 | #F2F4F7 | ja | – | `ink: '#F2F4F7',` |
| lib/maps/google-maps-config.ts:93 | #0B0F17 | ja | – | `surface: '#0B0F17',` |
| lib/maps/google-maps-config.ts:94 | #6B7587 | ja | – | `lineStrong: '#6B7587',` |
| lib/seo/og-image.ts:23 | #FFFFFF | ja | – | `surface: '#FFFFFF',` |
| lib/seo/og-image.ts:24 | #0A1E3A | ja | – | `ink: '#0A1E3A',` |
| lib/seo/og-image.ts:25 | #5F6878 | ja | – | `muted: '#5F6878',` |
| lib/seo/og-image.ts:26 | #E3E6EB | ja | – | `line: '#E3E6EB',` |

### Inline style={{…}} (frei: 17 · ohne-masswerte: 3) (20)

| Datei:Zeile | Status | frei | Inhalt |
| --- | --- | --- | --- |
| app/jobs/[slug]/opengraph-image.tsx:38 (Bildinhalt (ImageResponse)) | frei | zahlenwert | `{ display: 'flex', flexDirection: 'column', gap: 12 }` |
| app/jobs/[slug]/opengraph-image.tsx:39 (Bildinhalt (ImageResponse)) | frei | rem/em | `{ fontSize: titleSize, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.04 }` |
| app/jobs/[slug]/opengraph-image.tsx:42 (Bildinhalt (ImageResponse)) | frei | zahlenwert | `{ fontSize: 40, color: OG_COLOR.muted }` |
| app/jobs/[slug]/opengraph-image.tsx:45 (Bildinhalt (ImageResponse)) | frei | rem/em/zahlenwert | `{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.02em' }` |
| app/opengraph-image.tsx:20 (Bildinhalt (ImageResponse)) | frei | zahlenwert | `{ display: 'flex', flexDirection: 'column', gap: 8 }` |
| app/opengraph-image.tsx:21 (Bildinhalt (ImageResponse)) | frei | rem/em/zahlenwert | `{ fontSize: 92, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.04 }` |
| app/opengraph-image.tsx:23 (Bildinhalt (ImageResponse)) | frei | rem/em/zahlenwert | `{ fontSize: 54, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1, color: OG_COLOR.muted, m` |
| app/opengraph-image.tsx:37 (Bildinhalt (ImageResponse)) | frei | zahlenwert | `{ display: 'flex', gap: 56 }` |
| app/opengraph-image.tsx:39 (Bildinhalt (ImageResponse)) | ohne-masswerte | – | `{ display: 'flex', flexDirection: 'column' }` |
| app/opengraph-image.tsx:40 (Bildinhalt (ImageResponse)) | frei | rem/em/zahlenwert | `{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.02em' }` |
| app/opengraph-image.tsx:41 (Bildinhalt (ImageResponse)) | frei | zahlenwert | `{ fontSize: 22, color: OG_COLOR.muted }` |
| components/site/StickyApplyBarClient.tsx:203 | frei | rem/em | `{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }` |
| components/ui/Sheet.tsx:121 | frei | rem/em | `{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }` |
| components/ui/StepHeader.tsx:69 | ohne-masswerte | – | `{ transform: `scaleX(${stepProgress(current, total)})` }` |
| lib/seo/og-render.tsx:63 (Bildinhalt (ImageResponse)) | frei | px | `{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-be` |
| lib/seo/og-render.tsx:75 (Bildinhalt (ImageResponse)) | ohne-masswerte | – | `{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }` |
| lib/seo/og-render.tsx:81 (Bildinhalt (ImageResponse)) | frei | zahlenwert | `{ fontSize: 28, fontWeight: 600 }` |
| lib/seo/og-render.tsx:83 (Bildinhalt (ImageResponse)) | frei | zahlenwert | `{ fontSize: 26, color: OG_COLOR.muted }` |
| lib/seo/og-render.tsx:89 (Bildinhalt (ImageResponse)) | frei | px/zahlenwert | `{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: `2px solid ${` |
| lib/seo/og-render.tsx:98 (Bildinhalt (ImageResponse)) | frei | zahlenwert | `{ fontSize: 24, color: OG_COLOR.muted }` |

### CSS außerhalb von theme.css (farbe: 7 · schrift: 5 · dauer: 1 · abstand: 1 · radius: 1) (15)

| Datei:Zeile | Kategorie | Wert |
| --- | --- | --- |
| app/globals.css:93 | dauer | `0.01ms` |
| components/mappe/mappe.module.css:26 | abstand | `gap: 24px` |
| components/mappe/mappe.module.css:33 | farbe | `#FFFFFF` |
| components/mappe/mappe.module.css:34 | farbe | `#F5F6F8` |
| components/mappe/mappe.module.css:35 | farbe | `#ECEEF2` |
| components/mappe/mappe.module.css:36 | farbe | `#0A1E3A` |
| components/mappe/mappe.module.css:37 | farbe | `#5F6878` |
| components/mappe/mappe.module.css:38 | farbe | `#E3E6EB` |
| components/mappe/mappe.module.css:39 | farbe | `#7D8696` |
| components/mappe/mappe.module.css:52 | schrift | `10.5pt` |
| components/mappe/mappe.module.css:58 | schrift | `9pt` |
| components/mappe/mappe.module.css:63 | schrift | `12pt` |
| components/mappe/mappe.module.css:69 | schrift | `22pt` |
| components/mappe/mappe.module.css:76 | schrift | `11pt` |
| components/mappe/mappe.module.css:94 | radius | `1.5mm` |

### Dauern/Kurven in TS/TSX (2)

| Datei:Zeile | Art | Wert |
| --- | --- | --- |
| lib/tokens/index.ts:14 | Kurve | `cubic-bezier(0.2, 0, 0, 1)` |
| lib/tokens/index.ts:15 | Kurve | `cubic-bezier(0.05, 0.7, 0.1, 1)` |

### S-07 Auftakt-Muster

Einordnung per Muster, nicht per Urteil: „kandidat“ = Muster preloader/loader-screen/splash/countUp/count-up/odometer in jedem Kontext, oder intro als Komponenten-, Klassen-, id- oder Selektorname; „inhaltsfeld-oder-name“ = intro/INTRO als Datenfeld, Prop oder Bezeichner (z. B. job.intro); „kommentar“ = Kommentarzeile. Kandidaten sind Fundstellen für die Handprüfung, ob Inhalt oder Scrollen zurückgehalten wird.

### Fundstellen S-07: Kandidaten (0)

Keine.

S-07 übrige Treffer: 30 als Inhaltsfeld oder Bezeichner (intro/INTRO), 6 in Kommentaren; vollständig in slop-hart.json.

### Hinweise (keine Zählung der harten Befunde)


### S-02 Bewegungsmechanismen im Code (9)

| Datei:Zeile | Muster | Zeile |
| --- | --- | --- |
| components/apply/ContactStep.tsx:252 | animate-spin | `className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"` |
| components/apply/thanks/FollowUpForm.tsx:144 | animate-spin | `<span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-` |
| components/jobs/ApplyAnchorButton.tsx:26 | IntersectionObserver | `if (!target \|\| typeof IntersectionObserver === 'undefined') return;` |
| components/jobs/ApplyAnchorButton.tsx:27 | IntersectionObserver | `const observer = new IntersectionObserver(([entry]) => setFlowVisible(entry.isIntersecting));` |
| components/site/HeaderBar.tsx:37 | IntersectionObserver | `if (!sentinel \|\| typeof IntersectionObserver === 'undefined') return;` |
| components/site/HeaderBar.tsx:38 | IntersectionObserver | `const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));` |
| components/site/StickyApplyBarClient.tsx:88 | IntersectionObserver | `typeof IntersectionObserver === 'undefined'` |
| components/site/StickyApplyBarClient.tsx:90 | IntersectionObserver | `: new IntersectionObserver((entries) => {` |
| components/ui/Button.tsx:60 | animate-spin | `className="absolute inset-0 m-auto size-5 animate-spin rounded-full border-2 border-current border-r` |

### S-03 Hover-Reveal und title-Attribute (0)

Keine.

### S-06 Ladezustand-Verdacht (Heuristik) (1)

| Datei:Zeile | Anlass |
| --- | --- |
| components/mappe/SkillsSection.tsx:67 | <form onSubmit={handleAdd} noValidate> |

### S-06 Leerzustand-Verdacht (Heuristik) (4)

| Datei:Zeile | Art |
| --- | --- |
| app/sitemap.ts:24 | datengetriebene Liste ohne erkennbaren Leerzustand (Heuristik) |
| components/home/JobList.tsx:29 | datengetriebene Liste ohne erkennbaren Leerzustand (Heuristik) |
| components/mappe/JobSection.tsx:51 | datengetriebene Liste ohne erkennbaren Leerzustand (Heuristik) |
| components/site/SiteFooter.tsx:103 | datengetriebene Liste ohne erkennbaren Leerzustand (Heuristik) |

## Teil B: gerendert

### Übersicht je Seite und Ansicht

| Seite | Ansicht | Status | S-01 | S-02 Abschnitte mit Auftritt | S-03 Kontrast | S-03 Fokus nicht ok | S-04 Emoji | S-04 Strich (berechnet) | S-05 Elemente außerhalb | S-06 ohne Hover / ohne Fokus / Feld ohne Fehlerstil | S-07 h1 300 ms / scrollbar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | m375 | 200 | 1 | 0/8 (0 %) | 0 | 0/15 | 0 | 5 | s1 r0 s0 f0 h0 d0 | 8 / 0 / 0 | ja / ja |
| / | d1440 | 200 | 1 | 0/8 (0 %) | 0 | 0/15 | 0 | 5 | s0 r0 s0 f0 h0 d0 | 8 / 0 / 0 | ja / ja |
| /jobs | m375 | 200 | 0 | 0/2 (0 %) | 0 | 0/15 | 0 | 1 | s0 r0 s0 f0 h0 d0 | 5 / 0 / 0 | ja / ja |
| /jobs | d1440 | 200 | 0 | 0/2 (0 %) | 0 | 0/15 | 0 | 1 | s0 r0 s0 f0 h0 d0 | 6 / 0 / 0 | ja / ja |
| /jobs/anlagenmechaniker-shk-wetzlar | m375 | 200 | 1 | 0/11 (0 %) | 0 | 0/15 | 0 | 3 | s0 r0 s0 f0 h0 d0 | 5 / 0 / 0 | ja / ja |
| /jobs/anlagenmechaniker-shk-wetzlar | d1440 | 200 | 1 | 0/11 (0 %) | 0 | 0/15 | 0 | 3 | s0 r0 s0 f0 h0 d0 | 9 / 0 / 0 | ja / ja |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | m375 | 200 | 0 | 0/11 (0 %) | 0 | 0/15 | 0 | 3 | s0 r0 s0 f0 h0 d0 | 5 / 0 / 0 | ja / ja |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | d1440 | 200 | 0 | 0/11 (0 %) | 0 | 0/15 | 0 | 3 | s0 r0 s0 f0 h0 d0 | 9 / 0 / 0 | ja / ja |
| /jobs/obermonteur-projektleiter-shk-wetzlar | m375 | 200 | 1 | 0/11 (0 %) | 0 | 0/15 | 0 | 3 | s0 r0 s0 f0 h0 d0 | 5 / 0 / 0 | ja / ja |
| /jobs/obermonteur-projektleiter-shk-wetzlar | d1440 | 200 | 1 | 0/11 (0 %) | 0 | 0/15 | 0 | 3 | s0 r0 s0 f0 h0 d0 | 9 / 0 / 0 | ja / ja |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | m375 | 200 | 0 | 0/11 (0 %) | 0 | 0/15 | 0 | 3 | s0 r0 s0 f0 h0 d0 | 5 / 0 / 0 | ja / ja |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | d1440 | 200 | 0 | 0/11 (0 %) | 0 | 0/15 | 0 | 3 | s0 r0 s0 f0 h0 d0 | 9 / 0 / 0 | ja / ja |
| /bewerbung | m375 | 200 | 0 | 0/1 (0 %) | 0 | 0/15 | 0 | 2 | s0 r0 s0 f0 h0 d0 | 2 / 0 / 0 | ja / ja |
| /bewerbung | d1440 | 200 | 0 | 0/1 (0 %) | 0 | 0/15 | 0 | 2 | s0 r0 s0 f0 h0 d0 | 2 / 0 / 0 | ja / ja |
| /bewerbung/danke | m375 | 200 | 0 | 0/1 (0 %) | 0 | 0/10 | 0 | 1 | s0 r0 s0 f0 h0 d0 | 5 / 0 / 0 | ja / ja |
| /bewerbung/danke | d1440 | 200 | 0 | 0/1 (0 %) | 0 | 0/10 | 0 | 1 | s0 r0 s0 f0 h0 d0 | 5 / 0 / 0 | ja / kurz |
| /bewerbung/mappe | m375 | 200 | 0 | 0/6 (0 %) | 0 | 0/15 | 0 | 2 | s44 r0 s0 f0 h0 d0 | 3 / 0 / 0 | ja / ja |
| /bewerbung/mappe | d1440 | 200 | 0 | 0/6 (0 %) | 0 | 0/15 | 0 | 2 | s37 r0 s0 f0 h0 d0 | 3 / 0 / 0 | ja / ja |
| /datenschutz | m375 | 200 | 0 | 0/12 (0 %) | 0 | 0/15 | 0 | 1 | s0 r0 s0 f0 h0 d0 | 12 / 0 / 0 | ja / ja |
| /datenschutz | d1440 | 200 | 0 | 0/12 (0 %) | 0 | 0/15 | 0 | 1 | s0 r0 s0 f0 h0 d0 | 12 / 0 / 0 | ja / ja |
| /impressum | m375 | 200 | 0 | 0/7 (0 %) | 0 | 0/15 | 0 | 1 | s0 r0 s0 f0 h0 d0 | 2 / 0 / 0 | ja / ja |
| /impressum | d1440 | 200 | 0 | 0/7 (0 %) | 0 | 0/15 | 0 | 1 | s0 r0 s0 f0 h0 d0 | 2 / 0 / 0 | ja / ja |
| /gibt-es-nicht-404 | m375 | 404 | 0 | 0/1 (0 %) | 0 | 0/15 | 0 | 1 | s0 r0 s0 f0 h0 d0 | 2 / 0 / 0 | ja / ja |
| /gibt-es-nicht-404 | d1440 | 404 | 0 | 0/1 (0 %) | 0 | 0/15 | 0 | 1 | s0 r0 s0 f0 h0 d0 | 2 / 0 / 0 | ja / ja |

Kürzel S-05: s Schriftgröße · r Radius · s Schatten · f Farbe · h Hintergrund · d Dauer (je Anzahl Elemente außerhalb der Token, Volltext der Seite).

### S-01 sichtbarer Text mit Platzhalter-Muster (6)

| Seite | Ansicht | Muster | Fundstelle | Kontext |
| --- | --- | --- | --- | --- |
| / | m375 | alexander koch | `ll > figcaption.text-callout > span.block.font-semibold:nth-of-type(1)` | Alexander Koch |
| / | d1440 | alexander koch | `ll > figcaption.text-callout > span.block.font-semibold:nth-of-type(1)` | Alexander Koch |
| /jobs/anlagenmechaniker-shk-wetzlar | m375 | alexander koch | `flex-col:nth-of-type(2) > span.text-callout.font-medium:nth-of-type(1)` | Alexander Koch |
| /jobs/anlagenmechaniker-shk-wetzlar | d1440 | alexander koch | `flex-col:nth-of-type(2) > span.text-callout.font-medium:nth-of-type(1)` | Alexander Koch |
| /jobs/obermonteur-projektleiter-shk-wetzlar | m375 | alexander koch | `flex-col:nth-of-type(2) > span.text-callout.font-medium:nth-of-type(1)` | Alexander Koch |
| /jobs/obermonteur-projektleiter-shk-wetzlar | d1440 | alexander koch | `flex-col:nth-of-type(2) > span.text-callout.font-medium:nth-of-type(1)` | Alexander Koch |

### S-01 sichtbare Feld-Platzhaltertexte (d1440, zur Kenntnis; Handprüfung auf Beispieltexte) (0)

Keine.

### S-01 Prüfliste Zahlenangaben im sichtbaren Text (d1440; kein Befund – Handprüfung gegen Quellen auf Erfundenes) (156)

| Seite | Zahlangabe | Fundstelle |
| --- | --- | --- |
| / | Dauert ca. 60 Sekunden. Kein Lebenslauf nö | `r.flex.flex-col > div.mt-2.flex > p.basis-full.text-footnote` |
| / | 35 km | `> div.flex.flex-col > p.tabular-nums.text-ink:nth-of-type(1)` |
| / | Wetzlar + 35 km | `.flex > p.flex.flex-col > span.text-ink-muted:nth-of-type(1)` |
| / | 3.600–4.600 € / Monat | `flex.flex-col > span.font-medium.tabular-nums:nth-of-type(2)` |
| / | Wetzlar + 35 km | `.flex > p.flex.flex-col > span.text-ink-muted:nth-of-type(1)` |
| / | 3.800–4.900 € / Monat | `flex.flex-col > span.font-medium.tabular-nums:nth-of-type(2)` |
| / | Wetzlar + 35 km | `.flex > p.flex.flex-col > span.text-ink-muted:nth-of-type(1)` |
| / | 4.400–5.600 € / Monat | `flex.flex-col > span.font-medium.tabular-nums:nth-of-type(2)` |
| / | instieg noch möglich. In 3,5 Jahren wirst du Anlagenmechanik | ` > article.rounded-lg.bg-surface-2 > p.max-w-prose.text-body` |
| / | Wetzlar + 35 km | `.flex > p.flex.flex-col > span.text-ink-muted:nth-of-type(1)` |
| / | 1.050–1.400 € / Monat | `flex.flex-col > span.font-medium.tabular-nums:nth-of-type(2)` |
| / | 35 km um Wetzlar. Keine Fernmo | `h2#einsatzgebiet-title` |
| / | 35 km | `elect-none > text.fill-ink-muted.text-callout:nth-of-type(1)` |
| / | arbeiten im Umkreis von 35 km um Wetzlar. | `) > div.flex.flex-col:nth-of-type(1) > p.-mt-1.text-footnote` |
| / | 1 km | `r-b.border-line:nth-of-type(1) > td.py-3.pr-4:nth-of-type(1)` |
| / | 3 Min. | `r-b.border-line:nth-of-type(1) > td.py-3.pr-2:nth-of-type(2)` |
| / | 4 km | `r-b.border-line:nth-of-type(2) > td.py-3.pr-4:nth-of-type(1)` |
| / | 6 Min. | `r-b.border-line:nth-of-type(2) > td.py-3.pr-2:nth-of-type(2)` |
| / | 4 km | `r-b.border-line:nth-of-type(3) > td.py-3.pr-4:nth-of-type(1)` |
| / | 7 Min. | `r-b.border-line:nth-of-type(3) > td.py-3.pr-2:nth-of-type(2)` |
| / | 4 km | `r-b.border-line:nth-of-type(4) > td.py-3.pr-4:nth-of-type(1)` |
| / | 7 Min. | `r-b.border-line:nth-of-type(4) > td.py-3.pr-2:nth-of-type(2)` |
| / | 5 km | `r-b.border-line:nth-of-type(5) > td.py-3.pr-4:nth-of-type(1)` |
| / | 8 Min. | `r-b.border-line:nth-of-type(5) > td.py-3.pr-2:nth-of-type(2)` |
| / | 6 km | `r-b.border-line:nth-of-type(6) > td.py-3.pr-4:nth-of-type(1)` |
| / | 9 Min. | `r-b.border-line:nth-of-type(6) > td.py-3.pr-2:nth-of-type(2)` |
| / | 7 km | `r-b.border-line:nth-of-type(7) > td.py-3.pr-4:nth-of-type(1)` |
| / | 10 Min. | `r-b.border-line:nth-of-type(7) > td.py-3.pr-2:nth-of-type(2)` |
| / | 14 km | `r-b.border-line:nth-of-type(8) > td.py-3.pr-4:nth-of-type(1)` |
| / | 18 Min. | `r-b.border-line:nth-of-type(8) > td.py-3.pr-2:nth-of-type(2)` |
| / | 15 km | `r-b.border-line:nth-of-type(9) > td.py-3.pr-4:nth-of-type(1)` |
| / | 16 Min. | `r-b.border-line:nth-of-type(9) > td.py-3.pr-2:nth-of-type(2)` |
| / | 24 km | `-b.border-line:nth-of-type(10) > td.py-3.pr-4:nth-of-type(1)` |
| / | 22 Min. | `-b.border-line:nth-of-type(10) > td.py-3.pr-2:nth-of-type(2)` |
| / | Bewerben in 60 Sekunden | `> li.flex.flex-col:nth-of-type(1) > h3.text-title-3.text-ink` |
| / | 100 % Diskretion | `th-of-type(2) > span.inline-flex.items-center:nth-of-type(2)` |
| / | eb (Partnerurkunde 2026, 14,8 km Werksnähe zum Buderus-St | `l.divide-y.divide-line > li.py-3.text-callout:nth-of-type(1)` |
| / | chtigung zur Vergabe von 7 Jahren Herstellergarantie) | `l.divide-y.divide-line > li.py-3.text-callout:nth-of-type(2)` |
| / | Freitags ab 13:30 Uhr Wochenende ist kein Werb | `pe(2) > figure.flex.w-full > blockquote.flex-1.text-body > p` |
| / | Mo–Do 07:00–16:45 Uhr | `tnote.text-ink-muted > span.whitespace-nowrap:nth-of-type(1)` |
| / | Fr 07:00–13:30 Uhr | `tnote.text-ink-muted > span.whitespace-nowrap:nth-of-type(2)` |
| / | bis Donnerstag 07:00–16:45 Uhr | `nth-of-type(1) > address.flex.flex-col > span:nth-of-type(2)` |
| / | Freitag 07:00–13:30 Uhr | `nth-of-type(1) > address.flex.flex-col > span:nth-of-type(2)` |
| /jobs | eb seit 1926 in Wetzlar: 30 Tage Urlaub und freitags ab 1 | `box-content > header.flex.flex-col > p.max-w-prose.text-lead` |
| /jobs | rlaub und freitags ab 13:30 Uhr Feierabend. | `box-content > header.flex.flex-col > p.max-w-prose.text-lead` |
| /jobs | Wetzlar + 35 km | `.flex > p.flex.flex-col > span.text-ink-muted:nth-of-type(1)` |
| /jobs | 3.600–4.600 € / Monat | `flex.flex-col > span.font-medium.tabular-nums:nth-of-type(2)` |
| /jobs | Wetzlar + 35 km | `.flex > p.flex.flex-col > span.text-ink-muted:nth-of-type(1)` |
| /jobs | 3.800–4.900 € / Monat | `flex.flex-col > span.font-medium.tabular-nums:nth-of-type(2)` |
| /jobs | Wetzlar + 35 km | `.flex > p.flex.flex-col > span.text-ink-muted:nth-of-type(1)` |
| /jobs | 4.400–5.600 € / Monat | `flex.flex-col > span.font-medium.tabular-nums:nth-of-type(2)` |
| /jobs | instieg noch möglich. In 3,5 Jahren wirst du Anlagenmechanik | ` > article.rounded-lg.bg-surface-2 > p.max-w-prose.text-body` |
| /jobs | Wetzlar + 35 km | `.flex > p.flex.flex-col > span.text-ink-muted:nth-of-type(1)` |
| /jobs | 1.050–1.400 € / Monat | `flex.flex-col > span.font-medium.tabular-nums:nth-of-type(2)` |
| /jobs | 35 km um Wetzlar. Keine Fernmo | `h2#einsatzgebiet` |
| /jobs | Mo–Do 07:00–16:45 Uhr | `tnote.text-ink-muted > span.whitespace-nowrap:nth-of-type(1)` |
| /jobs | Fr 07:00–13:30 Uhr | `tnote.text-ink-muted > span.whitespace-nowrap:nth-of-type(2)` |
| /jobs | bis Donnerstag 07:00–16:45 Uhr | `nth-of-type(1) > address.flex.flex-col > span:nth-of-type(2)` |
| /jobs | Freitag 07:00–13:30 Uhr | `nth-of-type(1) > address.flex.flex-col > span:nth-of-type(2)` |
| /jobs/anlagenmechaniker-shk-wetzlar | Wetzlar + 35 km | `lex-wrap > li:nth-of-type(2) > span.inline-flex.items-center` |

… 96 weitere in slop-hart.json

### S-02 Abschnitte mit Scroll-Auftritt (0)

Keine.

S-02 Nebenbefunde: Elemente außerhalb des ersten Bildschirms mit opacity < 1 oder transform ≠ none, die sich beim Scrollen nicht ändern (statisch): 56 Elemente in Summe; Animationen insgesamt gesehen 250, davon nach dem ersten Scrollereignis gestartet 236.

### S-03 Kontrast (axe color-contrast) (0)

Keine.

### S-03 Tab-Stopps ohne sichtbare Outline ≥ 2 px (0)

Keine.

### S-04 Emojis im sichtbaren Text (24)

| Seite | Ansicht | Zeichen | Codepoint | typografisch | Fundstelle |
| --- | --- | --- | --- | --- | --- |
| / | m375 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| / | d1440 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /jobs | m375 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /jobs | d1440 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /jobs/anlagenmechaniker-shk-wetzlar | m375 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /jobs/anlagenmechaniker-shk-wetzlar | d1440 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | m375 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | d1440 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /jobs/obermonteur-projektleiter-shk-wetzlar | m375 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /jobs/obermonteur-projektleiter-shk-wetzlar | d1440 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | m375 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | d1440 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /bewerbung | m375 | © | U+A9 | true | `e > div.mx-auto.box-content > p.text-footnote.text-ink-muted` |
| /bewerbung | d1440 | © | U+A9 | true | `e > div.mx-auto.box-content > p.text-footnote.text-ink-muted` |
| /bewerbung/danke | m375 | © | U+A9 | true | `e > div.mx-auto.box-content > p.text-footnote.text-ink-muted` |
| /bewerbung/danke | d1440 | © | U+A9 | true | `e > div.mx-auto.box-content > p.text-footnote.text-ink-muted` |
| /bewerbung/mappe | m375 | © | U+A9 | true | `e > div.mx-auto.box-content > p.text-footnote.text-ink-muted` |
| /bewerbung/mappe | d1440 | © | U+A9 | true | `e > div.mx-auto.box-content > p.text-footnote.text-ink-muted` |
| /datenschutz | m375 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /datenschutz | d1440 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /impressum | m375 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /impressum | d1440 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /gibt-es-nicht-404 | m375 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| /gibt-es-nicht-404 | d1440 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |

### S-04 Strichstärken inline-SVG (d1440)

| Seite | sichtbare SVG | lucide | eigen | stroke-width Attribute | berechnet | effektiv px |
| --- | --- | --- | --- | --- | --- | --- |
| / | 38 | 27 | 11 | 1×2 2×1 4×4 1.75×26 2.25×1 1.5×10 | 1×2 2×1 4×4 1.75×53 2.25×1 | 1×2 1.17×11 1.75×28 2.49×1 4.98×4 1.46×14 1.5×1 |
| /jobs | 9 | 9 | 0 | 1.75×9 | 1.75×14 | 1.17×10 1.46×4 |
| /jobs/anlagenmechaniker-shk-wetzlar | 26 | 26 | 0 | 2×8 1.75×13 2.5×5 | 2×8 1.75×17 2.5×5 | 1.17×9 1.67×13 1.46×8 |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | 26 | 26 | 0 | 2×8 1.75×13 2.5×5 | 2×8 1.75×17 2.5×5 | 1.17×9 1.67×13 1.46×8 |
| /jobs/obermonteur-projektleiter-shk-wetzlar | 27 | 27 | 0 | 2×9 1.75×13 2.5×5 | 2×9 1.75×17 2.5×5 | 1.17×9 1.67×14 1.46×8 |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | 22 | 22 | 0 | 2×6 1.75×13 2.5×3 | 2×6 1.75×17 2.5×3 | 1.17×9 1.67×9 1.46×8 |
| /bewerbung | 12 | 12 | 0 | 2.5×6 1.75×6 | 2.5×6 1.75×12 | 1.67×6 1.46×12 |
| /bewerbung/danke | 3 | 3 | 0 | 1.75×3 | 1.75×4 | 1.46×4 |
| /bewerbung/mappe | 9 | 9 | 0 | 1.75×6 2.5×3 | 1.75×12 2.5×3 | 1.46×12 1.67×3 |
| /datenschutz | 2 | 2 | 0 | 1.75×2 | 1.75×2 | 1.17×2 |
| /impressum | 2 | 2 | 0 | 1.75×2 | 1.75×2 | 1.17×2 |
| /gibt-es-nicht-404 | 1 | 1 | 0 | 1.75×1 | 1.75×1 | 1.17×1 |

### S-05 Werte außerhalb der Tokens (Volltext aller sichtbaren Elemente; Beispiele je Wert)


### S-05 abweichende Werte (alle Seitenansichten zusammen, sortiert nach Häufigkeit) (5)

| Eigenschaft | Wert | Elemente (Summe) | Seitenansichten | Beispiel (Seite · Selektor) |
| --- | --- | --- | --- | --- |
| schriftgroesse | `14px` | 46 | 2 | /bewerbung/mappe · `.mappe-module__I2zLJq__page.mappe-module__I2zLJq__paper:nth-of-type(1)` |
| schriftgroesse | `12px` | 12 | 2 | /bewerbung/mappe · `.min-w-0 > p.mappe-module__I2zLJq__small.text-ink-muted:nth-of-type(2)` |
| schriftgroesse | `17px` | 8 | 2 | / · `flex.flex-col:nth-of-type(1) > div.relative > select.w-full.rounded-sm` |
| schriftgroesse | `29.33px` | 8 | 2 | /bewerbung/mappe · `-line > div.flex.min-w-0 > p.mappe-module__I2zLJq__name:nth-of-type(1)` |
| schriftgroesse | `14.67px` | 8 | 2 | /bewerbung/mappe · `h3#mappe-seite-lebenslauf` |

Schriftstufen laut Token bei 1440 px: footnote 13px · callout 15px · body 17px · lead 21px · title-3 24px · title-2 34px · title-1 48px · display 72px · numeral 100.8px; bei 375 px: footnote 13px · callout 15px · body 16.14px · lead 18.14px · title-3 20.25px · title-2 24.58px · title-1 31.08px · display 39px · numeral 48px.

Stichprobe (60 Elemente je Seitenansicht, gleichmäßig durch die Dokumentreihenfolge): Elemente mit mindestens einer Abweichung

| Seite | Ansicht | Elemente gemessen (Seite) | Stichprobe | mit Abweichung | Schrift | Radius | Schatten | Farbe | Hintergrund | Dauer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | m375 | 528 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| / | d1440 | 536 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /jobs | m375 | 158 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /jobs | d1440 | 166 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /jobs/anlagenmechaniker-shk-wetzlar | m375 | 322 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /jobs/anlagenmechaniker-shk-wetzlar | d1440 | 343 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | m375 | 323 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | d1440 | 344 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /jobs/obermonteur-projektleiter-shk-wetzlar | m375 | 326 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /jobs/obermonteur-projektleiter-shk-wetzlar | d1440 | 347 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | m375 | 305 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | d1440 | 326 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /bewerbung | m375 | 101 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /bewerbung | d1440 | 101 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /bewerbung/danke | m375 | 55 | 55 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /bewerbung/danke | d1440 | 55 | 55 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /bewerbung/mappe | m375 | 199 | 60 | 12 | 12 | 0 | 0 | 0 | 0 | 0 |
| /bewerbung/mappe | d1440 | 200 | 60 | 10 | 10 | 0 | 0 | 0 | 0 | 0 |
| /datenschutz | m375 | 298 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /datenschutz | d1440 | 306 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /impressum | m375 | 151 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /impressum | d1440 | 159 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /gibt-es-nicht-404 | m375 | 68 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| /gibt-es-nicht-404 | d1440 | 76 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

### S-06 Hover-/Fokus-/Fehlerstil je interaktivem Element

| Seite | Ansicht | Links ohne Hover (am Element selbst) | Knöpfe ohne Hover | Felder ohne Hover | Links ohne :focus-visible | Knöpfe ohne :focus-visible | Felder ohne :focus-visible | Felder ohne aria-invalid-Stil | CSS-Regeln (Hover/Fokus/Invalid) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | m375 | 2/28 (6) | 0/6 (0) | 0/1 | 0/28 | 0/6 | 0/1 | 0/1 | 13/9/1 |
| / | d1440 | 2/32 (6) | 0/5 (0) | 0/1 | 0/32 | 0/5 | 0/1 | 0/1 | 13/9/1 |
| /jobs | m375 | 5/24 (9) | 0/1 (0) | 0/0 | 0/24 | 0/1 | 0/0 | 0/0 | 13/9/1 |
| /jobs | d1440 | 6/28 (10) | 0/0 (0) | 0/0 | 0/28 | 0/0 | 0/0 | 0/0 | 13/9/1 |
| /jobs/anlagenmechaniker-shk-wetzlar | m375 | 2/24 (5) | 0/7 (0) | 0/0 | 0/24 | 0/7 | 0/0 | 0/0 | 13/9/1 |
| /jobs/anlagenmechaniker-shk-wetzlar | d1440 | 6/29 (9) | 0/6 (0) | 0/0 | 0/29 | 0/6 | 0/0 | 0/0 | 13/9/1 |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | m375 | 2/24 (5) | 0/7 (0) | 0/0 | 0/24 | 0/7 | 0/0 | 0/0 | 13/9/1 |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | d1440 | 6/29 (9) | 0/6 (0) | 0/0 | 0/29 | 0/6 | 0/0 | 0/0 | 13/9/1 |
| /jobs/obermonteur-projektleiter-shk-wetzlar | m375 | 2/24 (5) | 0/7 (0) | 0/0 | 0/24 | 0/7 | 0/0 | 0/0 | 13/9/1 |
| /jobs/obermonteur-projektleiter-shk-wetzlar | d1440 | 6/29 (9) | 0/6 (0) | 0/0 | 0/29 | 0/6 | 0/0 | 0/0 | 13/9/1 |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | m375 | 2/24 (5) | 0/5 (0) | 0/0 | 0/24 | 0/5 | 0/0 | 0/0 | 13/9/1 |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | d1440 | 6/29 (9) | 0/4 (0) | 0/0 | 0/29 | 0/4 | 0/0 | 0/0 | 13/9/1 |
| /bewerbung | m375 | 2/10 (2) | 0/6 (0) | 0/0 | 0/10 | 0/6 | 0/0 | 0/0 | 13/9/1 |
| /bewerbung | d1440 | 2/10 (2) | 0/6 (0) | 0/0 | 0/10 | 0/6 | 0/0 | 0/0 | 13/9/1 |
| /bewerbung/danke | m375 | 5/10 (5) | 0/0 (0) | 0/0 | 0/10 | 0/0 | 0/0 | 0/0 | 13/9/1 |
| /bewerbung/danke | d1440 | 5/10 (5) | 0/0 (0) | 0/0 | 0/10 | 0/0 | 0/0 | 0/0 | 13/9/1 |
| /bewerbung/mappe | m375 | 2/5 (2) | 0/15 (0) | 0/7 | 0/5 | 0/15 | 0/7 | 0/7 | 13/9/1 |
| /bewerbung/mappe | d1440 | 2/5 (2) | 0/15 (0) | 0/7 | 0/5 | 0/15 | 0/7 | 0/7 | 13/9/1 |
| /datenschutz | m375 | 12/42 (12) | 0/1 (0) | 0/0 | 0/42 | 0/1 | 0/0 | 0/0 | 13/9/1 |
| /datenschutz | d1440 | 12/46 (12) | 0/0 (0) | 0/0 | 0/46 | 0/0 | 0/0 | 0/0 | 13/9/1 |
| /impressum | m375 | 2/28 (2) | 0/1 (0) | 0/0 | 0/28 | 0/1 | 0/0 | 0/0 | 13/9/1 |
| /impressum | d1440 | 2/32 (2) | 0/0 (0) | 0/0 | 0/32 | 0/0 | 0/0 | 0/0 | 13/9/1 |
| /gibt-es-nicht-404 | m375 | 2/17 (2) | 0/1 (0) | 0/0 | 0/17 | 0/1 | 0/0 | 0/0 | 13/9/1 |
| /gibt-es-nicht-404 | d1440 | 2/21 (2) | 0/0 (0) | 0/0 | 0/21 | 0/0 | 0/0 | 0/0 | 13/9/1 |

### S-06 Elemente ohne Hover-Stil (d1440) (76)

| Seite | Typ | Element | Fundstelle |
| --- | --- | --- | --- |
| / | link | Zum Inhalt springen | `a.sr-only` |
| / | link | Bad und Energie GmbH Lahn Dill, zur Star | `header.sticky.top-0 > div.mx-auto.box-content > a.-mx-1.inline-flex` |
| / | sonstiges | Stimmen von Kunden und Team | `-16.border-t:nth-of-type(3) > div.mt-8:nth-of-type(2) > div > ul.-mx-gutter.mt-6` |
| / | sonstiges | Wie läuft der diskrete Wechsel ab, wenn  | `l:nth-of-type(2) > details.group.border-b:nth-of-type(1) > summary.flex.min-h-11` |
| / | sonstiges | Brauche ich ein Anschreiben oder einen L | `l:nth-of-type(2) > details.group.border-b:nth-of-type(2) > summary.flex.min-h-11` |
| / | sonstiges | Welche Heizsysteme und Sanitäranlagen mo | `l:nth-of-type(2) > details.group.border-b:nth-of-type(3) > summary.flex.min-h-11` |
| / | sonstiges | Darf ich das Firmenfahrzeug mit nach Hau | `l:nth-of-type(2) > details.group.border-b:nth-of-type(4) > summary.flex.min-h-11` |
| / | sonstiges | Gibt es Fernmontagen oder Wochenendarbei | `l:nth-of-type(2) > details.group.border-b:nth-of-type(5) > summary.flex.min-h-11` |
| /jobs | link | Zum Inhalt springen | `a.sr-only` |
| /jobs | link | Bad und Energie GmbH Lahn Dill, zur Star | `header.sticky.top-0 > div.mx-auto.box-content > a.-mx-1.inline-flex` |
| /jobs | link | Stellen | `> nav.hidden > ul.flex.items-center > li:nth-of-type(1) > a.inline-flex.min-h-11` |
| /jobs | link | Anrufen06441 42956 | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(1) > a.group.flex` |
| /jobs | link | WhatsAppNachricht schreiben (öffnet in n | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(2) > a.group.flex` |
| /jobs | link | E-Mailinfo@bad-energie.de | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(3) > a.group.flex` |
| /jobs/anlagenmechaniker-shk-wetzlar | link | Zum Inhalt springen | `a.sr-only` |
| /jobs/anlagenmechaniker-shk-wetzlar | link | Bad und Energie GmbH Lahn Dill, zur Star | `header.sticky.top-0 > div.mx-auto.box-content > a.-mx-1.inline-flex` |
| /jobs/anlagenmechaniker-shk-wetzlar | link | Stellen | `> nav.hidden > ul.flex.items-center > li:nth-of-type(1) > a.inline-flex.min-h-11` |
| /jobs/anlagenmechaniker-shk-wetzlar | sonstiges | Wie läuft der diskrete Wechsel ab, wenn  | `er-t.border-line > details.group.border-b:nth-of-type(1) > summary.flex.min-h-11` |
| /jobs/anlagenmechaniker-shk-wetzlar | sonstiges | Darf ich das Firmenfahrzeug mit nach Hau | `er-t.border-line > details.group.border-b:nth-of-type(2) > summary.flex.min-h-11` |
| /jobs/anlagenmechaniker-shk-wetzlar | sonstiges | Gibt es Fernmontagen oder Wochenendarbei | `er-t.border-line > details.group.border-b:nth-of-type(3) > summary.flex.min-h-11` |
| /jobs/anlagenmechaniker-shk-wetzlar | link | Anrufen06441 42956 | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(1) > a.group.flex` |
| /jobs/anlagenmechaniker-shk-wetzlar | link | WhatsAppNachricht schreiben (öffnet in n | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(2) > a.group.flex` |
| /jobs/anlagenmechaniker-shk-wetzlar | link | E-Mailinfo@bad-energie.de | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(3) > a.group.flex` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | link | Zum Inhalt springen | `a.sr-only` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | link | Bad und Energie GmbH Lahn Dill, zur Star | `header.sticky.top-0 > div.mx-auto.box-content > a.-mx-1.inline-flex` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | link | Stellen | `> nav.hidden > ul.flex.items-center > li:nth-of-type(1) > a.inline-flex.min-h-11` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | sonstiges | Wie läuft der diskrete Wechsel ab, wenn  | `er-t.border-line > details.group.border-b:nth-of-type(1) > summary.flex.min-h-11` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | sonstiges | Darf ich das Firmenfahrzeug mit nach Hau | `er-t.border-line > details.group.border-b:nth-of-type(2) > summary.flex.min-h-11` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | sonstiges | Gibt es Fernmontagen oder Wochenendarbei | `er-t.border-line > details.group.border-b:nth-of-type(3) > summary.flex.min-h-11` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | link | Anrufen06441 42956 | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(1) > a.group.flex` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | link | WhatsAppNachricht schreiben (öffnet in n | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(2) > a.group.flex` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | link | E-Mailinfo@bad-energie.de | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(3) > a.group.flex` |
| /jobs/obermonteur-projektleiter-shk-wetzlar | link | Zum Inhalt springen | `a.sr-only` |
| /jobs/obermonteur-projektleiter-shk-wetzlar | link | Bad und Energie GmbH Lahn Dill, zur Star | `header.sticky.top-0 > div.mx-auto.box-content > a.-mx-1.inline-flex` |
| /jobs/obermonteur-projektleiter-shk-wetzlar | link | Stellen | `> nav.hidden > ul.flex.items-center > li:nth-of-type(1) > a.inline-flex.min-h-11` |
| /jobs/obermonteur-projektleiter-shk-wetzlar | sonstiges | Wie läuft der diskrete Wechsel ab, wenn  | `er-t.border-line > details.group.border-b:nth-of-type(1) > summary.flex.min-h-11` |
| /jobs/obermonteur-projektleiter-shk-wetzlar | sonstiges | Darf ich das Firmenfahrzeug mit nach Hau | `er-t.border-line > details.group.border-b:nth-of-type(2) > summary.flex.min-h-11` |
| /jobs/obermonteur-projektleiter-shk-wetzlar | sonstiges | Gibt es Fernmontagen oder Wochenendarbei | `er-t.border-line > details.group.border-b:nth-of-type(3) > summary.flex.min-h-11` |
| /jobs/obermonteur-projektleiter-shk-wetzlar | link | Anrufen06441 42956 | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(1) > a.group.flex` |
| /jobs/obermonteur-projektleiter-shk-wetzlar | link | WhatsAppNachricht schreiben (öffnet in n | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(2) > a.group.flex` |
| /jobs/obermonteur-projektleiter-shk-wetzlar | link | E-Mailinfo@bad-energie.de | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(3) > a.group.flex` |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | link | Zum Inhalt springen | `a.sr-only` |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | link | Bad und Energie GmbH Lahn Dill, zur Star | `header.sticky.top-0 > div.mx-auto.box-content > a.-mx-1.inline-flex` |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | link | Stellen | `> nav.hidden > ul.flex.items-center > li:nth-of-type(1) > a.inline-flex.min-h-11` |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | sonstiges | Brauche ich ein Anschreiben oder einen L | `er-t.border-line > details.group.border-b:nth-of-type(1) > summary.flex.min-h-11` |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | sonstiges | Welche Heizsysteme und Sanitäranlagen mo | `er-t.border-line > details.group.border-b:nth-of-type(2) > summary.flex.min-h-11` |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | sonstiges | Gibt es Fernmontagen oder Wochenendarbei | `er-t.border-line > details.group.border-b:nth-of-type(3) > summary.flex.min-h-11` |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | link | Anrufen06441 42956 | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(1) > a.group.flex` |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | link | WhatsAppNachricht schreiben (öffnet in n | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(2) > a.group.flex` |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | link | E-Mailinfo@bad-energie.de | `ex.flex-col:nth-of-type(2) > ul.flex.flex-col > li:nth-of-type(3) > a.group.flex` |

… 26 weitere in slop-hart.json

### S-06 Elemente ohne :focus-visible-Stil (d1440) (0)

Keine.

### S-06 Felder ohne aria-invalid-Fehlerdarstellung (d1440) (0)

Keine.

### S-07 Auftakt: Inhalt und Scrollen 300 ms nach domcontentloaded

| Seite | Ansicht | h1 vorhanden | h1 Deckkraft | h1 im ersten Bildschirm | h1 sichtbar nach 300 ms | Seite scrollbar nötig | Scrollen möglich | overflow html/body | Vollbild-Überlagerung | Zähler ändern sich |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | m375 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| / | d1440 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /jobs | m375 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /jobs | d1440 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /jobs/anlagenmechaniker-shk-wetzlar | m375 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /jobs/anlagenmechaniker-shk-wetzlar | d1440 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | m375 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | d1440 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /jobs/obermonteur-projektleiter-shk-wetzlar | m375 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /jobs/obermonteur-projektleiter-shk-wetzlar | d1440 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | m375 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | d1440 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /bewerbung | m375 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /bewerbung | d1440 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /bewerbung/danke | m375 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /bewerbung/danke | d1440 | ja | 1 | true | true | nein | – | visible/visible | keine | 0 |
| /bewerbung/mappe | m375 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /bewerbung/mappe | d1440 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /datenschutz | m375 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /datenschutz | d1440 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /impressum | m375 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /impressum | d1440 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /gibt-es-nicht-404 | m375 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |
| /gibt-es-nicht-404 | d1440 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |

## Hinweise zur Methode

- Zählung, nicht Urteil: Jede Zahl gehört zu einer Katalogregel; Fundstellen stehen als Datei:Zeile (Code) oder Seite + Selektor (gerendert) in slop-hart.json. Der Selektor ist ein gekürzter Pfad (bis 5 Ebenen) und kein eindeutiger CSS-Selektor.
- S-02 (gerendert): Ein Abschnitt zählt als „mit Auftritt“, wenn nach dem ersten Scrollereignis eine Animation (CSS, Übergang, WAAPI, scroll-/view-gebunden) mit opacity/transform/translate/scale/rotate/clip-path/filter/visibility in ihm startet oder ein Element außerhalb des ersten Bildschirms seinen opacity-/transform-Wert beim Durchscrollen ändert. Abschnitte = oberste `section` in `main` (sonst Kinder von `main`). Grenze: > 50 % der Abschnitte.
- S-03: axe-core-Regel color-contrast allein; Fokus: echte Tab-Taste, `:focus-visible` muss zutreffen und am Element selbst, an `::after`/`::before` oder an einem bis zu drei Ebenen höheren Vorfahren mit `:has(:focus-visible)` muss `outline-style` ≠ none mit `outline-width` ≥ 2 px gelten (ein Ring über box-shadow zählt nicht als Outline, wird aber als „nur box-shadow“ ausgewiesen; der Ort des Rings steht in `ringOrt`). „Information nur über Hover oder Farbe“ ist per Skript nicht entscheidbar; Hinweise stehen unter Code.
- S-05 Stichprobe: gleichmäßig durch die Dokumentreihenfolge aller sichtbaren Elemente; Vergleich mit den aus theme.css gelesenen Werten (Farben alle Hex-Werte der Datei, Radien, Schatten über Prüfelement normalisiert, Dauern, Schriftstufen als clamp() für die jeweilige Ansichtsbreite aufgelöst). Der Volltext derselben Seite ist die vollständige Zählung. Farben mit Deckkraft < 1 gelten als Token, wenn der RGB-Anteil einem Token entspricht (±3).
- S-06: Hover-/Fokus-Regeln werden aus allen lesbaren Stylesheets samt verschachtelten Regeln und @media/@supports/@layer gesammelt; ein Element hat den Stil, wenn es den Selektor ohne die Pseudoklasse trifft (Vorfahren-Hover im Selektor eingeschlossen). Für Hover zählt zusätzlich ein Hover-Stil an einem der vier nächsten Vorfahren (Karte mit gestrecktem Link: der Zeiger über dem Link liegt immer auch über der Karte); `hoverSelbst` in der JSON-Datei und die Spalte „am Element selbst“ weisen die strenge Zählung aus. Medienbedingungen wie (hover: hover) werden nicht ausgewertet.
- S-07: `domcontentloaded` + 300 ms; h1 gilt als sichtbar bei Gesamt-Deckkraft ≥ 0,999, visibility visible und Lage im ersten Bildschirm; Scrollen wird mit scrollTo geprüft, wenn die Seite höher als der Bildschirm ist; Zähler = Blattelemente, deren Text nur aus Ziffern und Zeichen besteht und sich zwischen 300 ms und 2,5 s ändert.
