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
    title: 'Moderne Wärmepumpentechnik',
    shortDescription: 'Installation und Einregulierung modernster Luft und Wasser Wärmepumpen von Bosch und Brötje.',
    fullDescription: 'Als führender Meisterbetrieb in Wetzlar rüsten wir Bestandsgebäude und Neubauten im gesamten Lahn Dill Kreis auf zukunftssichere Wärmepumpensysteme um. Unsere Monteure arbeiten mit modernstem hydraulischem Abgleich und digitaler Messung.',
    features: [
      'Bosch Compress Wärmepumpen',
      'Brötje Hybridsysteme',
      'Eigener Hilti Akku Maschinenpark',
      'Regionale Baustellen im 35 km Umkreis',
    ],
    benefits: [
      'Zukunftssicherer Arbeitsplatz in der Energiewende',
      'Herstellerschulungen direkt bei Bosch und Brötje',
      'Keine körperlich einseitige Belastung dank bester Hebehilfen',
    ],
    targetRole: 'Anlagenmechaniker und Heizungsbauer',
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
    shortDescription: 'Störungsdiagnose, Anlagenoptimierung und periodische Wartung mit eigenem Servicefahrzeug.',
    fullDescription: 'Unser Serviceteam betreut Wärmepumpen, Gasbrennwertthermen und Trinkwassersysteme. Jeder Kundendienstmonteur verfügt über ein voll ausgestattetes Servicefahrzeug, iPad und Smartphone.',
    features: [
      'Digitaler Kundendienst ohne Zettelwirtschaft',
      'Modernste Abgas und Durchflussmesstechnik',
      'Persönlicher Firmenwagen zur privaten Nutzung',
      'Geregelte Arbeitszeiten ohne Wochenendbereitschaft',
    ],
    benefits: [
      'Große Eigenverantwortung und Respekt beim Kunden',
      'Direkte Fahrt von zu Hause zur ersten Wartung',
      'Fester Feierabend freitags ab 13:30 Uhr',
    ],
    targetRole: 'Kundendiensttechniker und Servicemonteur',
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
