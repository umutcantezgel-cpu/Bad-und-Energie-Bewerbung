export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  benefits: string[];
  targetRole: string;
}

export const servicesData: ServiceItem[] = [
  {
    id: 'srv-01',
    slug: 'waermepumpen',
    title: 'Regenerative Wärmepumpensysteme',
    shortDescription: 'Installation, hydraulischer Abgleich und Inbetriebnahme modernster Wärmepumpen von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann.',
    fullDescription: 'Als führender Meisterbetrieb in Wetzlar rüsten wir Bestandsgebäude und Neubauten im gesamten Lahn Dill Kreis auf zukunftssichere Wärmepumpensysteme um. Unsere Monteure arbeiten mit modernstem hydraulischem Abgleich und digitaler Messung.',
    features: [
      'Buderus & Bosch Wärmepumpen mit 14,8 km Werksnähe Lollar',
      'NIBE Premium-Systeme mit 7 Jahren Herstellergarantie',
      'Alpha Innotec & Viessmann Inbetriebnahmen',
      'Hilti Akku-Maschinenpark & digitale Messgeräte',
      'Regionale Baustellen im 35 km Radius (Wetzlar, Gießen, Lahn-Dill)',
    ],
    benefits: [
      'Herstellerschulungen direkt bei Buderus, Bosch und NIBE',
      'Arbeiten mit modernsten Hebehilfen (rückenschonende Montage)',
      'Feste Arbeitszeiten: Freitags pünktlich ab 13:30 Uhr Feierabend',
    ],
    targetRole: 'Anlagenmechaniker für Wärmepumpen & Heizungstechnik',
  },
  {
    id: 'srv-02',
    slug: 'badsanierung',
    title: 'Badarchitektur und Komplettbäder',
    shortDescription: 'Schlüsselfertige Traumbäder in Kooperation mit ELEMENTS und führenden Markenherstellern.',
    fullDescription: 'Wir planen und verwirklichen fugenlose Designbäder, barrierefreie Duschen und hochwertige Sanitärinstallationen. Jedes Bad wird mit handwerklicher Sorgfalt von Vorwandelementen bis zu edlen Armaturen fertiggestellt.',
    features: [
      'Vorwandinstallation Geberit und Vigour',
      'Großformatfliesen und barrierefreie Duschwannen',
      'Staubarme Sanierung mit Luftreinigern',
      'Feste Zeitpläne ohne Überstundendruck',
    ],
    benefits: [
      'Sichtbare handwerkliche Ästhetik auf höchstem Niveau',
      'Zufriedene Privatkunden in Wetzlar und Gießen',
      'Arbeiten mit den besten Sanitärmaterialien',
    ],
    targetRole: 'Sanitärmonteur und Badbauer',
  },
  {
    id: 'srv-03',
    slug: 'kundendienst',
    title: 'Wartung und Kundendienst',
    shortDescription: 'Störungsdiagnose, Anlagenoptimierung, periodische Wartung von Wärmepumpen sowie Instandhaltung öffentlicher Liegenschaften im Lahn-Dill-Kreis.',
    fullDescription: 'Unser Serviceteam betreut Wärmepumpen von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann sowie Liegenschaften des Lahn-Dill-Kreises. Jeder Kundendienstmonteur verfügt über ein voll ausgestattetes Servicefahrzeug, iPad und Smartphone.',
    features: [
      'Digitaler Kundendienst ohne Zettelwirtschaft',
      'Modernste Wärmepumpen- und Durchflussmesstechnik',
      'Persönlicher Firmenwagen zur privaten Nutzung ab Haustür',
      'Geregelte Arbeitszeiten ohne Wochenendbereitschaft',
      'Fester Betreuungspartner für Liegenschaften im Lahn-Dill-Kreis',
    ],
    benefits: [
      'Große Eigenverantwortung und Respekt beim Kunden',
      'Direkte Fahrt von zu Hause zur ersten Wartung',
      'Fester Feierabend freitags ab 13:30 Uhr',
    ],
    targetRole: 'Kundendiensttechniker SHK / Servicemonteur (m/w/d)',
  },
  {
    id: 'srv-04',
    slug: 'ausbildung',
    title: 'Handwerkerausbildung mit Zukunft',
    shortDescription: 'Fundierte 3,5 jährige Ausbildung zum Anlagenmechaniker für Sanitär Heizung und Klimatechnik.',
    fullDescription: 'Seit 1926 bilden wir erfolgreich den handwerklichen Nachwuchs in Wetzlar aus. Azubis erhalten ab Tag 1 ein eigenes Hilti Werkzeugset, volle Fahrtkostenübernahme und eine garantierte Festanstellung.',
    features: [
      'Eigenes Hilti Azubi Werkzeugset geschenkt',
      'Überdurchschnittliche Ausbildungsvergütung über Tarif',
      'Fahrtkostenzuschuss zur Berufsschule',
      '100 Prozent Übernahmegarantie nach Gesellenprüfung',
    ],
    benefits: [
      'Lernen von erfahrenen Meistern auf Augenhöhe',
      'Frühzeitige Praxiserfahrung ohne Hilfsarbeiten',
      'Fester Halt in einem familiären Traditionsbetrieb',
    ],
    targetRole: 'Auszubildender SHK 2026',
  },
];
