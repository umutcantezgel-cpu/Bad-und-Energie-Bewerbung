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
  benefits: string[];
}

export const companyData: CompanyData = {
  name: 'Bad und Energie GmbH Lahn Dill',
  legalName: 'Bad und Energie GmbH Lahn Dill',
  tagline: 'Meisterbetrieb für Badarchitektur, Wärmepumpen und Haustechnik seit 1926 in Wetzlar',
  foundingYear: 1926,
  street: 'Siegmund Hiepe Str. 20',
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
  innung: 'Innung Sanitär Heizung und Klimatechnik Lahn Dill',
  handelsregister: 'HRB 8459 Amtsgericht Wetzlar',
  openingHours: {
    weekdays: 'Montag bis Donnerstag von 07:00 bis 16:45 Uhr',
    friday: 'Freitag von 07:00 bis 13:30 Uhr',
    note: 'Freitags pünktlich ab 13:30 Uhr ins Wochenende. Keine Notdienst Pflicht am Wochenende.',
  },
  geo: {
    latitude: 50.56499,
    longitude: 8.49842,
  },
  benefits: [
    'Bis zu 4800 Euro Gehalt plus Urlaubs und Weihnachtsgeld',
    '30 Tage garantierter Erholungsurlaub',
    'Freitags ab 13:30 Uhr Feierabend',
    'Hilti Vollausstattung im persönlichen Werkzeugkoffer',
    'Modernes Servicefahrzeug zur privaten Nutzung',
    'Keine bundesweiten Montagen (maximal 35 km Radius)',
  ],
};
