# Slop-Prüfung, harte Befunde S-01 bis S-07 · test-slop

Erstellt 2026-10-09T07:38:40.297Z · Basis http://localhost:3500

Messbedingungen Code: 245 Dateien (.ts, .tsx, .css) in app, components, lib; ausgeschlossen __tests__, *.test.ts(x), *.spec.ts(x), node_modules, .next.

## Zählung je S-Kennung

| Befund | Code | Gerendert (Summe der Seitenansichten) |
| --- | --- | --- |
| S-01 Erfundenes oder Platzhalter | 28 Treffer (davon 15 übrige, 13 Platzhalter-Attribut) | – |
| S-02 Effektteppich | – | – |
| S-03 Unzugänglich | – | – |
| S-04 Gemischte Bildsprache | Quellen lucide-react: 71 · 34 verschiedene Icons · 3 eigene SVG-Komponenten · Icon-Marken ohne strokeWidth 0 · Emojis im Code 0 | – |
| S-05 Ungeordnete Werte | -[ Wertklassen 14 (tokenrelevant 1) · duration-/delay-Zahl 2 · Hex 0 · Inline-style frei 17 · CSS frei 15 · JS-Dauern/Kurven 2 | – |
| S-06 Halbe Zustände | – | – |
| S-07 Blockierender Auftakt | 36 Treffer (davon 0 Kandidaten) | – |

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

## Hinweise zur Methode

- Zählung, nicht Urteil: Jede Zahl gehört zu einer Katalogregel; Fundstellen stehen als Datei:Zeile (Code) oder Seite + Selektor (gerendert) in slop-hart.json. Der Selektor ist ein gekürzter Pfad (bis 5 Ebenen) und kein eindeutiger CSS-Selektor.
- S-02 (gerendert): Ein Abschnitt zählt als „mit Auftritt“, wenn nach dem ersten Scrollereignis eine Animation (CSS, Übergang, WAAPI, scroll-/view-gebunden) mit opacity/transform/translate/scale/rotate/clip-path/filter/visibility in ihm startet oder ein Element außerhalb des ersten Bildschirms seinen opacity-/transform-Wert beim Durchscrollen ändert. Abschnitte = oberste `section` in `main` (sonst Kinder von `main`). Grenze: > 50 % der Abschnitte.
- S-03: axe-core-Regel color-contrast allein; Fokus: echte Tab-Taste, `:focus-visible` muss zutreffen und `outline-style` ≠ none mit `outline-width` ≥ 2 px (ein Ring über box-shadow zählt nicht als Outline, wird aber als „nur box-shadow“ ausgewiesen). „Information nur über Hover oder Farbe“ ist per Skript nicht entscheidbar; Hinweise stehen unter Code.
- S-05 Stichprobe: gleichmäßig durch die Dokumentreihenfolge aller sichtbaren Elemente; Vergleich mit den aus theme.css gelesenen Werten (Farben alle Hex-Werte der Datei, Radien, Schatten über Prüfelement normalisiert, Dauern, Schriftstufen als clamp() für die jeweilige Ansichtsbreite aufgelöst). Der Volltext derselben Seite ist die vollständige Zählung. Farben mit Deckkraft < 1 gelten als Token, wenn der RGB-Anteil einem Token entspricht (±3).
- S-06: Hover-/Fokus-Regeln werden aus allen lesbaren Stylesheets samt verschachtelten Regeln und @media/@supports/@layer gesammelt; ein Element hat den Stil, wenn es den Selektor ohne die Pseudoklasse trifft (Vorfahren-Hover eingeschlossen). Medienbedingungen wie (hover: hover) werden nicht ausgewertet.
- S-07: `domcontentloaded` + 300 ms; h1 gilt als sichtbar bei Gesamt-Deckkraft ≥ 0,999, visibility visible und Lage im ersten Bildschirm; Scrollen wird mit scrollTo geprüft, wenn die Seite höher als der Bildschirm ist; Zähler = Blattelemente, deren Text nur aus Ziffern und Zeichen besteht und sich zwischen 300 ms und 2,5 s ändert.
