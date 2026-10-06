import { z } from 'zod';

export interface VaultFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'geselle' | 'license' | 'cert' | 'other';
  uploadedAt: string;
  status: 'ready' | 'uploading' | 'verified';
}

export interface CandidateDossier {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  position: string;
  currentStatus: 'employed' | 'journeyman' | 'master' | 'student';
  experience: string;
  startDate: string;
  salaryExpectation: string;
  skills: string[];
  workStyle: string;
  coverLetter: string;
  notes: string;
  discretionGuaranteed: boolean;
  contactPreference: 'whatsapp' | 'phone' | 'email';
  createdAt: string;
  files: VaultFile[];
}

export const initialDossierState: CandidateDossier = {
  fullName: 'Alexander Koch',
  phone: '0170 8892341',
  email: 'alexander.koch@beispiel.de',
  location: '35578 Wetzlar',
  position: 'Anlagenmechaniker für Sanitär Heizung und Klimatechnik m w d',
  currentStatus: 'employed',
  experience: '4 Jahre Praxis',
  startDate: 'In 1 Monat (Kündigungsfrist)',
  salaryExpectation: '3.900 € / Monat + Zulagen',
  skills: [
    'Wärmepumpen (Luft und Wasser Bosch & Brötje)',
    'Badsanierung & Vorwandinstallation',
    'Gas Brennwert und Heizungsmodernisierung',
    'Führerschein Klasse B (PKW)',
  ],
  workStyle:
    'Qualitätsorientiert & Sauber: Baustellen verlassen wie vorgefunden, exakte Rohrisolierung, zufriedene Kunden.',
  coverLetter: `Sehr geehrter Herr Demir,

mit großem Interesse bewerbe ich mich als Anlagenmechaniker SHK bei Bad und Energie GmbH Lahn Dill in Wetzlar. Als engagierte Fachkraft lege ich besonderen Wert auf handwerkliche Präzision, moderne Wärmepumpentechnik und saubere Ausführung auf den Baustellen im Lahn Dill Kreis.

Ich schätze einen verlässlichen Meisterbetrieb mit kurzen Entscheidungswegen, hochwertigem Werkzeug und kollegialer Führung auf Augenhöhe. Über ein vertrauliches Kennenlernen freue ich mich.

Mit handwerklichen Grüßen,
Alexander Koch`,
  notes:
    'Erfahrung im Einbau von Bosch Compress Wärmepumpen und modernen Komplettbädern. Suche verlässlichen Betrieb mit geregelten Arbeitszeiten und Wertschätzung.',
  discretionGuaranteed: true,
  contactPreference: 'whatsapp',
  createdAt: new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }),
  files: [
    {
      id: 'default-file-1',
      name: 'Gesellenbrief_SHK_Handwerkskammer.pdf',
      size: 1458000,
      type: 'application/pdf',
      category: 'geselle',
      uploadedAt: '01.03.2026',
      status: 'verified',
    },
  ],
};

export const formBuilderSchema = z.object({
  fullName: z.string().min(3, 'Bitte vollständigen Namen eingeben'),
  phone: z.string().min(6, 'Bitte gültige Telefonnummer oder Mobilnummer eingeben'),
  email: z.string().email('Bitte gültige E Mail Adresse eingeben').or(z.literal('')),
  location: z.string().min(2, 'Bitte Wohnort oder PLZ angeben'),
  position: z.string().min(1, 'Bitte Position auswählen'),
  experience: z.string().min(1, 'Bitte Erfahrung angeben'),
  startDate: z.string().min(1, 'Bitte Starttermin angeben'),
  salaryExpectation: z.string().min(1, 'Bitte Gehaltswunsch angeben'),
  notes: z.string().optional(),
  contactPreference: z.enum(['whatsapp', 'phone', 'email']),
  discretionGuaranteed: z.boolean(),
});

export type FormBuilderValues = z.infer<typeof formBuilderSchema>;
