export interface GoogleReview {
  id: string;
  author: string;
  role: string;
  location: string;
  rating: number;
  date: string;
  text: string;
  category: 'Wärmepumpe' | 'Zufrieden' | 'Vermessen' | 'Meister' | 'Planung' | 'Installation' | 'Arbeit' | 'Team';
  reviewCount?: number;
  photosCount?: number;
  badge?: string;
  verifiedSource: 'Google Rezension' | 'Mitarbeiter Stimme';
  ownerResponse?: {
    author: string;
    date: string;
    text: string;
  };
}

// Stand der Zahlen offen (ROADMAP §13). Die Bewertungszeile erscheint erst mit `asOf: 'JJJJ-MM'`
// (Monat, in dem die Zahlen im Google-Profil abgelesen wurden), optional `profileUrl` (https).
export const googleOverviewStats = {
  averageRating: 5.0,
  totalReviews: 24,
  recommendationRate: '100%',
  verifiedBadge: 'Google Verifiziertes Unternehmensprofil',
  location: 'Wetzlar, Lahn Dill Kreis',
  filterTags: [
    { label: 'Alle', count: 14 },
    { label: 'Wärmepumpe', count: 4 },
    { label: 'Zufrieden', count: 4 },
    { label: 'Meister', count: 2 },
    { label: 'Planung', count: 2 },
    { label: 'Installation', count: 2 },
    { label: 'Arbeit', count: 2 },
    { label: 'Team', count: 4 },
  ],
};

// Spur 1: Echte Google Kundenrezensionen von Bad & Energie GmbH
export const googleCustomerReviews: GoogleReview[] = [
  {
    id: 'google-klober',
    author: 'Herr Klober',
    role: 'Kunde Wärmepumpenanlage',
    location: 'Wetzlar',
    rating: 5,
    date: 'Vor einem Jahr',
    category: 'Wärmepumpe',
    reviewCount: 8,
    photosCount: 3,
    badge: 'Viessmann Partner Direktkontakt',
    verifiedSource: 'Google Rezension',
    text: 'Einbau Wärmepumpe: Von der Planung und Durchführung alles einwandfrei und bestens gelaufen. Kontakt kam über Viessmann direkt, Anfrage von mir am Wochenende und Montag direkte Kontaktaufnahme durch Herrn Demir. Vor Ort Termin war super.',
    ownerResponse: {
      author: 'Sabri Demir (Inhaber)',
      date: 'Vor einem Jahr',
      text: 'Vielen Dank für das positive Feedback Herr Klober. Höchste Kundenzufriedenheit ist unser Anspruch und wir stehen unseren Kunden in allen Bauphasen mit unserem Service zur Verfügung.',
    },
  },
  {
    id: 'google-kraft',
    author: 'Hans Jochen Kraft',
    role: 'Kunde Heizungstausch',
    location: 'Lahn Dill Kreis',
    rating: 5,
    date: 'Vor 2 Jahren',
    category: 'Installation',
    reviewCount: 2,
    photosCount: 2,
    badge: 'Verifizierter Heizungsumbau',
    verifiedSource: 'Google Rezension',
    text: 'Wir können von diesem Unternehmen nur das Beste berichten. Bei uns wurde ein Heizungstausch vorgenommen: Ausbau Gasheizung und Einbau Wärmepumpe liefen absolut sauber und termingerecht.',
    ownerResponse: {
      author: 'Sabri Demir (Inhaber)',
      date: 'Vor 2 Jahren',
      text: 'Vielen Dank für das positive Feedback. Kundenzufriedenheit und Top Qualität ist unsere Mission.',
    },
  },
  {
    id: 'google-jf',
    author: 'J F',
    role: 'Kunde Badsanierung & Heizung',
    location: 'Wetzlar',
    rating: 5,
    date: 'Vor 11 Monaten',
    category: 'Meister',
    reviewCount: 6,
    badge: 'Besonderes Teamlob für Timo',
    verifiedSource: 'Google Rezension',
    text: 'Wir sind sehr zufrieden mit Bad und Energie Wetzlar. Besonders Herr Demir überzeugt durch Professionalität, Fachwissen und Freundlichkeit, einfach top! Timo hat ebenfalls tolle Arbeit geleistet und alles sauber umgesetzt.',
    ownerResponse: {
      author: 'Sabri Demir (Inhaber)',
      date: 'Vor 11 Monaten',
      text: 'Danke für das positive Feedback!',
    },
  },
  {
    id: 'google-doerr',
    author: 'Rolf Dörr',
    role: 'Kunde Haustechnik Komplettservice',
    location: 'Mittelhessen',
    rating: 5,
    date: 'Vor 10 Monaten',
    category: 'Planung',
    reviewCount: 3,
    badge: 'Vorbehaltlose Weiterempfehlung',
    verifiedSource: 'Google Rezension',
    text: 'Service aus einer Hand, professionell geplant und umgesetzt. Sehr freundliche und kompetente Handwerker! Leider habt ihr so gut gearbeitet, dass wir uns nicht so bald wiedersehen. Insoweit empfehle ich diese Firma vorbehaltlos weiter!',
  },
  {
    id: 'google-poco',
    author: 'Burim Loshaj',
    role: 'Marktleiter Poco Wetzlar',
    location: 'Wetzlar',
    rating: 5,
    date: 'Vor 11 Monaten',
    category: 'Arbeit',
    reviewCount: 10,
    badge: 'Gewerbekunde Poco Einrichtungsmarkt',
    verifiedSource: 'Google Rezension',
    text: 'Ich schreibe als Marktleiter der Firma Poco in Wetzlar. Wir hatten ein Problem mit dem Urinal, es lief nicht ab. Timo hat Top Arbeit geleistet! Alles läuft wieder wie es sein soll! Freundliches Team, gerne wieder!',
    ownerResponse: {
      author: 'Sabri Demir (Inhaber)',
      date: 'Vor 11 Monaten',
      text: 'Vielen Dank, immer wieder gerne!',
    },
  },
  {
    id: 'google-feldsalat',
    author: 'Feld Salat',
    role: 'Local Guide Google',
    location: 'Lahn Dill',
    rating: 5,
    date: 'Vor einem Jahr',
    category: 'Wärmepumpe',
    reviewCount: 26,
    badge: 'Google Local Guide Level 6',
    verifiedSource: 'Google Rezension',
    text: 'Wir haben innerhalb eines Monats zwei Heizungsanlagen mitten im Winter austauschen müssen. Eigentlich finanziell und nervlich eine Vollbelastung. Die Firma Bad und Energie hat uns gerettet und blitzschnell geholfen!',
    ownerResponse: {
      author: 'Sabri Demir (Inhaber)',
      date: 'Vor 11 Monaten',
      text: 'Vielen Dank für die positive Bewertung. Es freut uns sehr, dass wir Ihnen helfen konnten und stehen Ihnen jederzeit gerne zur Verfügung.',
    },
  },
  {
    id: 'google-koehler',
    author: 'Peter Koehler',
    role: 'Schulhausmeister & Local Guide',
    location: 'Wetzlar',
    rating: 5,
    date: 'Vor 11 Monaten',
    category: 'Arbeit',
    reviewCount: 9,
    badge: 'Hausmeister Schule Wetzlar',
    verifiedSource: 'Google Rezension',
    text: 'Herr Deckert vom Service hat sehr gute Arbeit geleistet, sehr sauberer Service, ordentlich und hat das Problem direkt erklärt und gelöst. Beste Grüße vom Hausmeister der Schule Herr Köhler.',
    ownerResponse: {
      author: 'Sabri Demir (Inhaber)',
      date: 'Vor 11 Monaten',
      text: 'Vielen Dank Herr Köhler!',
    },
  },
  {
    id: 'google-gruetzner',
    author: 'Matthias Grützner',
    role: 'Kunde Gebäudetechnik',
    location: 'Gießen',
    rating: 5,
    date: 'Vor 10 Monaten',
    category: 'Zufrieden',
    reviewCount: 1,
    badge: 'Fünf Sterne Gesamtnote',
    verifiedSource: 'Google Rezension',
    text: 'Freundlich, sehr kompetent und dazu noch schnell, hervorragender Dienstleistungsgedanke, tolles Unternehmen! Kann ich nur wärmstens weiterempfehlen!',
  },
  {
    id: 'google-debus',
    author: 'Rainer Debus',
    role: 'Kunde Wärmepumpeninstallation',
    location: 'Aßlar',
    rating: 5,
    date: 'Vor 11 Monaten',
    category: 'Wärmepumpe',
    reviewCount: 1,
    badge: 'Termingerechte Montage',
    verifiedSource: 'Google Rezension',
    text: 'Die Installation einer Wärmepumpe wurde von Bad und Energie termingerecht und sehr gut durchgeführt. Ein rundum empfehlenswerter Fachpartner in Mittelhessen.',
    ownerResponse: {
      author: 'Sabri Demir (Inhaber)',
      date: 'Vor 11 Monaten',
      text: 'Vielen Dank Herr Debus, wir stehen Ihnen jederzeit gerne zur Verfügung.',
    },
  },
  {
    id: 'google-krausgrill',
    author: 'Thomas Krausgrill',
    role: 'Kunde Heizungsmodernisierung',
    location: 'Braunfels',
    rating: 5,
    date: 'Vor 3 Jahren',
    category: 'Installation',
    reviewCount: 9,
    photosCount: 9,
    badge: 'Alphainotec Fachinstallation',
    verifiedSource: 'Google Rezension',
    text: 'Wir haben von Bad und Energie eine Alphainotec Wärmepumpe einbauen lassen. Auch wurde die alte Ölheizung professionell abgebaut und umweltgerecht entsorgt. Exzellente Leistung!',
  },
];

// Spur 2: Stimmen aus dem Handwerkerteam. NICHT freigegeben: ROADMAP §1 bestätigt nur die vier Zitate
// aus lib/data/team.ts. Bis zur Owner-Bestätigung nirgends anzeigen (docs/operations/fakten-abgleich.md B22).
export const teamRecruitingReviews: GoogleReview[] = [
  {
    id: 'team-michael',
    author: 'Michael S.',
    role: 'Anlagenmechaniker SHK',
    location: 'Wetzlar',
    rating: 5,
    date: 'Aktiv im Team',
    category: 'Team',
    badge: 'Früher Großkonzern Fernmontage',
    verifiedSource: 'Mitarbeiter Stimme',
    text: 'Nach acht Jahren bei einem Großkonzern mit ständigen Fernmontagen bin ich zu Bad und Energie gewechselt. Endlich jeden Abend bei meiner Familie, hochwertige Hilti Akkuwerkzeuge und freitags um 13:30 Uhr ist pünktlich Feierabend.',
  },
  {
    id: 'team-christian',
    author: 'Christian W.',
    role: 'Kundendienstmonteur',
    location: 'Gießen',
    rating: 5,
    date: 'Aktiv im Team',
    category: 'Meister',
    badge: 'Eigener Firmenwagen privat',
    verifiedSource: 'Mitarbeiter Stimme',
    text: 'Der Firmenwagen mit Privatnutzung ist Gold wert. Sabri Demir hat immer ein offenes Ohr und hält sein Wort bei Gehalt und Zulagen. Das beste und menschlichste Arbeitsklima in ganz Mittelhessen.',
  },
  {
    id: 'team-tim',
    author: 'Tim K.',
    role: 'Geselle nach Übernahme',
    location: 'Aßlar',
    rating: 5,
    date: 'Aktiv im Team',
    category: 'Team',
    badge: 'Unbefristete Festanstellung',
    verifiedSource: 'Mitarbeiter Stimme',
    text: 'Habe hier meine Ausbildung gemacht und wurde sofort unbefristet übernommen. Man lernt von den besten Altgesellen, bekommt Herstellerschulungen bei Viessmann und wird vom ersten Tag an respektiert.',
  },
  {
    id: 'team-dennis',
    author: 'Dennis M.',
    role: 'Quereinsteiger SHK Montage',
    location: 'Lahn Dill',
    rating: 5,
    date: 'Aktiv im Team',
    category: 'Arbeit',
    badge: 'Fester 35 km Einsatzradius',
    verifiedSource: 'Mitarbeiter Stimme',
    text: 'Keine unbezahlten Überstunden, planbare Einsätze direkt um Wetzlar herum und modernste Arbeitsschutzkleidung. Wer echtes Handwerk ohne Schikane sucht, ist bei uns genau am richtigen Platz.',
  },
];

// Abwärtskompatibles reviewsData Array
export type Review = GoogleReview;
export const reviewsData: Review[] = [...googleCustomerReviews, ...teamRecruitingReviews];
