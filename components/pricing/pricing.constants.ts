export type CraftRole = 'anlagenmechaniker' | 'kundendienst' | 'helfer' | 'azubi';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'meister';

export interface RolePackageConfig {
  label: string;
  tier: string;
  description: string;
  vehicle: string;
  tools: string;
  compensationTier: string;
}

export const ROLE_CONFIGS: Record<CraftRole, RolePackageConfig> = {
  anlagenmechaniker: {
    label: 'Anlagenmechaniker SHK und Heizungsbauer',
    tier: 'Fachkraft SHK · Premium Stufe',
    description: 'Neubau, Modernisierung und Wärmepumpenmontage im Lahn-Dill-Kreis',
    vehicle: 'Fester Transporter mit Sortimo Regalsystem (Mitnahme nach Hause möglich)',
    tools: '100% persönliche Hilti 22V Akku-Flotte & Viega/Geberit Pressbacken',
    compensationTier: 'Top-Facharbeitervergütung deutlich über Handwerkstarif',
  },
  kundendienst: {
    label: 'Kundendienstmonteur und Servicetechniker',
    tier: 'Spezialist Klimatechnik & Diagnose',
    description: 'Wartung, Inbetriebnahme und Diagnose mit eigenem Servicefahrzeug',
    vehicle: 'Persönliches Servicefahrzeug mit Tankkarte & 1:1 Privatnutzung ab Wohnort',
    tools: 'Buderus & Bosch Digital-Messtechnik, Hilti Koffer & Firmen-iPad',
    compensationTier: 'Höchste Facharbeiter-Einstufung mit Qualitätsprämien',
  },
  helfer: {
    label: 'Montagehelfer und Quereinsteiger',
    tier: 'Praxis-Einstieg mit Meisterbegleitung',
    description: 'Unterstützung auf der Baustelle mit Führerschein Klasse B',
    vehicle: 'Mitfahrt im Teamtransporter oder eigener Service-Caddy nach Absprache',
    tools: 'Vollständige Engelbert Strauss Arbeitskleidung & Hilti Basisausstattung',
    compensationTier: 'Faire, übertarifliche Bezahlung mit schneller Aufstiegschance',
  },
  azubi: {
    label: 'Auszubildender SHK ab August 2026',
    tier: 'Nachwuchsförderung mit Übernahmegarantie',
    description: '3,5-jährige fundierte Ausbildung zum zukunftssicheren Anlagenmechaniker',
    vehicle: 'Fahrtkostenzuschuss zur Berufsschule & Zuschuss zum PKW-Führerschein',
    tools: 'Eigenes Hilti Azubi-Werkzeugset geschenkt (ab Tag 1)',
    compensationTier: 'Attraktive Ausbildungsvergütung über Tarif + Prämien',
  },
};

export const EXPERIENCE_MODIFIERS: Record<
  ExperienceLevel,
  { label: string; badge: string; levelDescription: string }
> = {
  junior: {
    label: '1 bis 2 Jahre Gesellenerfahrung',
    badge: 'Junggeselle / Aufsteiger',
    levelDescription: 'Gezielte Vertiefung in Wärmepumpentechnik mit persönlichem Meistermentor',
  },
  mid: {
    label: '3 bis 5 Jahre Fachpraxis',
    badge: 'Erfahrene Fachkraft',
    levelDescription: 'Selbstständige Baustellenabwicklung ohne Mikromanagement & eigener Firmenwagen',
  },
  senior: {
    label: 'Über 5 Jahre Fachpraxis',
    badge: 'Senior Monteur / Vorarbeiter',
    levelDescription: 'Höchste Tarifstufe, freie Projektgestaltung und Führungsverantwortung im Team',
  },
  meister: {
    label: 'Meister- oder Technikerabschluss',
    badge: 'Meisterebene / Werkstattleitung',
    levelDescription: 'Mitgestaltung der Betriebsplanung, direkte Zusammenarbeit mit Sabri Demir',
  },
};

export const CRAFT_ADDONS = {
  heatPumpCert: {
    label: 'Wärmepumpenschein oder Kälteschein',
    benefitBadge: 'Wärmepumpen-Zertifikat freigeschaltet',
    perk: 'Zusätzliche Spezialisten-Zulage & Buderus, Bosch & NIBE Werkszertifizierungen',
  },
  driversLicenseBE: {
    label: 'Führerschein Klasse BE (Anhänger)',
    benefitBadge: 'Mobilitäts-Plus freigeschaltet',
    perk: 'Zusätzliche Anhänger-Berechtigung & flexiblere Tourenplanung',
  },
  cleanWorkStyle: {
    label: 'Eigenverantwortliche Baustellenführung',
    benefitBadge: 'Qualitätsprämie freigeschaltet',
    perk: 'Monatliche Sauberkeits- und Kundenzufriedenheitsprämie',
  },
};

export const COMPENSATION_GUARANTEES = [
  'Unbefristeter Arbeitsvertrag beim Meisterbetrieb (100 Jahre Firmenjubiläum)',
  'Pünktlichste Gehaltszahlung am 1. Werktag des Monats garantiert',
  'Garantiertes Urlaubs- und Weihnachtsgeld als feste Jahressonderzahlung',
  '30 Tage bezahlter Erholungsurlaub pro Kalenderjahr',
  'Freitags ab 13:30 Uhr bezahlt ins wohlverdiente Wochenende',
  'Keine Fernmontagen: Einsatzradius strikt begrenzt auf maximal 35 km',
];
