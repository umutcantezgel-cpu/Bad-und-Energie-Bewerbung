import { z } from 'zod';

export interface CareerStation {
  period: string;
  role: string;
  company: string;
  location?: string;
  tasks: string[];
}

export interface EducationStation {
  period: string;
  degree: string;
  institution: string;
  location?: string;
}

export interface VaultFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'resume' | 'photo' | 'coverletter' | 'geselle' | 'license' | 'cert' | 'other';
  uploadedAt: string;
  status: 'ready' | 'uploading' | 'verified';
  previewUrl?: string;
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
  photoUrl?: string;
  hasUploadedResume?: boolean;
  careerStations?: CareerStation[];
  educationStations?: EducationStation[];
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
  salaryExpectation: 'Vollzeit • Freitags ab 13:30 Uhr Wochenende • Unbefristet',
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
  photoUrl: '',
  hasUploadedResume: false,
  careerStations: [
    {
      period: '2022 – heute',
      role: 'Geselle Anlagenmechaniker SHK',
      company: 'SHK Meisterbetrieb Mittelhessen',
      location: 'Wetzlar & Gießen',
      tasks: [
        'Montage und Modernisierung von Wärmepumpen (Bosch & Brötje)',
        'Selbstständige Badsanierung und Vorwandinstallation (Geberit/Viega)',
        'Kundenbetreuung und Inbetriebnahme vor Ort',
      ],
    },
    {
      period: '2019 – 2022',
      role: 'Ausbildung zum Anlagenmechaniker SHK',
      company: 'Ausbildungsbetrieb Lahn-Dill',
      location: 'Wetzlar',
      tasks: [
        'Rohrleitungsbau, Pressverbindungen und Heizkörpermontage',
        'Grundlagen der Gas-, Wasser- und Klimatechnik',
        'Abschluss der Gesellenprüfung mit Auszeichnung',
      ],
    },
  ],
  educationStations: [
    {
      period: '2019 – 2022',
      degree: 'Gesellenbrief Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik',
      institution: 'Handwerkskammer Wiesbaden / Theodor-Heuss-Schule Wetzlar',
      location: 'Wetzlar',
    },
    {
      period: '2013 – 2019',
      degree: 'Realschulabschluss (Mittlere Reife)',
      institution: 'Gesamtschule Wetzlar',
      location: 'Wetzlar',
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
  salaryExpectation: z.string().optional(),
  notes: z.string().optional(),
  contactPreference: z.enum(['whatsapp', 'phone', 'email']),
  discretionGuaranteed: z.boolean(),
});

export type FormBuilderValues = z.infer<typeof formBuilderSchema>;
