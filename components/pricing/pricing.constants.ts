export type CraftRole = 'anlagenmechaniker' | 'kundendienst' | 'helfer' | 'azubi';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'meister';

export interface RoleSalaryConfig {
  label: string;
  baseSalary: number;
  description: string;
}

export const ROLE_CONFIGS: Record<CraftRole, RoleSalaryConfig> = {
  anlagenmechaniker: {
    label: 'Anlagenmechaniker SHK und Heizungsbauer',
    baseSalary: 3600,
    description: 'Neubau, Modernisierung und Wärmepumpenmontage',
  },
  kundendienst: {
    label: 'Kundendienstmonteur und Servicetechniker',
    baseSalary: 3800,
    description: 'Wartung, Inbetriebnahme und Diagnose mit eigenem Servicefahrzeug',
  },
  helfer: {
    label: 'Montagehelfer und Quereinsteiger',
    baseSalary: 2800,
    description: 'Unterstützung auf der Baustelle mit Führerschein Klasse B',
  },
  azubi: {
    label: 'Auszubildender SHK ab August 2026',
    baseSalary: 1100,
    description: '3,5 jährige Ausbildung mit eigenem Hilti Werkzeugset',
  },
};

export const EXPERIENCE_MODIFIERS: Record<ExperienceLevel, { label: string; bonus: number }> = {
  junior: { label: '1 bis 2 Jahre Gesellenerfahrung', bonus: 100 },
  mid: { label: '3 bis 5 Jahre Praxis', bonus: 300 },
  senior: { label: 'Über 5 Jahre Fachpraxis', bonus: 550 },
  meister: { label: 'Meister oder Technikerabschluss', bonus: 850 },
};

export const CRAFT_ADDONS = {
  heatPumpCert: { label: 'Wärmepumpenschein oder Kälteschein', bonus: 200 },
  driversLicenseBE: { label: 'Führerschein Klasse BE (Anhänger)', bonus: 100 },
  cleanWorkStyle: { label: 'Prämien für saubere Baustellenübergabe', bonus: 150 },
};

export const COMPENSATION_GUARANTEES = [
  'Verbindlicher Arbeitsvertrag mit pünktlicher Gehaltszahlung',
  'Urlaubs und Weihnachtsgeld als zusätzliche Sonderzahlung',
  '30 Tage garantierter Erholungsurlaub pro Kalenderjahr',
  'Freitags ab 13:30 Uhr bezahlt ins Wochenende',
  'Hochwertige Hilti Akku Vollausstattung ohne Selbstbeteiligung',
  'Servicefahrzeug mit Tankkarte zur privaten Nutzung',
];
