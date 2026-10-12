export interface CompanyData {
  name: string;
  legalName: string;
  tagline: string;
  foundingYear: number;
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  phone: {
    main: string;
    formatted: string;
    link: string;
  };
  email: string;
  hwk: string;
  innung: string;
  handelsregister: string;
  openingHours: {
    weekdays: string;
    friday: string;
    note: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  milestone2026: string;
  partnerPillars: string[];
  benefits: string[];
}

export const companyData: CompanyData = {
  name: 'Bad und Energie GmbH Lahn Dill',
  legalName: 'Bad und Energie GmbH Lahn Dill',
  tagline: '100 Jahre Meisterbetrieb (1926–2026) für Badarchitektur, Wärmepumpen und Haustechnik in Wetzlar',
  foundingYear: 1926,
  street: 'Siegmund-Hiepe-Str. 20',
  postalCode: '35578',
  city: 'Wetzlar',
  state: 'Hessen',
  country: 'Deutschland',
  phone: {
    main: '0644142956',
    formatted: '(06441) 42956',
    link: '+49644142956',
  },
  email: 'info@bad-energie.de',
  hwk: 'Handwerkskammer Wiesbaden',
  innung: 'Innung Sanitär-, Heizungs- und Klimatechnik Lahn-Dill',
  handelsregister: 'HRB 2449 Amtsgericht Wetzlar',
  // Erreichbarkeit des Büros, keine Arbeitszeit: Die Arbeitszeiten sind flexibel (fakten-abgleich B28).
  openingHours: {
    weekdays: 'Montag bis Donnerstag von 07:00 bis 16:45 Uhr',
    friday: 'Freitag von 07:00 bis 13:30 Uhr',
    note: 'Büro erreichbar zu diesen Zeiten. Keine Notdienst Pflicht am Wochenende.',
  },
  // Firmensitz Siegmund-Hiepe-Str. 20 laut OpenStreetMap (Nominatim), Ziel jeder Messung der Ortsseiten:
  // lib/places/data/messung.json `headquarters`, Protokoll docs/operations/orte-messung.md@b0749f2. Bis
  // 2026-10-12 standen hier die Koordinaten der Wetzlarer Kernstadt (50.56499, 8.49842), nicht die des Hauses.
  geo: {
    latitude: 50.5525,
    longitude: 8.47465,
  },
  milestone2026:
    'Meilenstein 2026: Durch das stetige Wachstum unseres Betriebes war ein Umzug in eine neue und größere Betriebsstätte unausweichlich. Der Hauptstandort wurde in die Siegmund-Hiepe-Str. 20 in Wetzlar verlagert für ein moderneres Büro und ein größeres Lager. Die Bad & Energie GmbH hat sich zum führenden Spezialisten für Wärmepumpen in der Region etabliert. Zusätzlich besteht die Partnerschaft als Fachbetrieb für den Lahn-Dill-Kreis zur Betreuung und Instandhaltung öffentlicher Einrichtungen. Zurzeit sind 15 Mitarbeiter im Betrieb tätig und arbeiten stetig daran, die Heizungen und Bäder der Kunden zu modernisieren. Dabei gilt: ‚Schöner Wohnen mit Top-Qualität‘.',
  partnerPillars: [
    'Buderus & Bosch Partnerbetrieb (Partnerurkunde 2026, 14,8 km Werksnähe zum Buderus-Stammwerk Lollar)',
    'NIBE Effizienzpartner (Berechtigung zur Vergabe von 7 Jahren Herstellergarantie)',
    'Alpha Innotec zertifizierter Inbetriebnahme-Partner',
    'Viessmann Fachbetrieb',
    'Fachbetriebspartner des Lahn-Dill-Kreises für öffentliche Liegenschaften',
  ],
  benefits: [
    'Überdurchschnittliche Vergütung deutlich über Handwerkstarif plus Urlaubs- und Weihnachtsgeld',
    '30 Tage garantierter Erholungsurlaub',
    'Flexible Arbeitszeiten',
    'Hilti Vollausstattung im persönlichen Werkzeugkoffer',
    'Modernes Servicefahrzeug zur privaten Nutzung',
    'Keine bundesweiten Montagen (maximal 35 km Radius)',
  ],
};
