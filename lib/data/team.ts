export interface TeamMember {
  name: string;
  role: string;
  experience: string;
  quote: string;
  /**
   * Zitat ausgeblendet, bis der Inhaber ein neues freigibt: Grund mit Zeile in docs/operations/fakten-abgleich.md.
   * Der Wortlaut bleibt als Rohdatum stehen, erscheint aber auf keiner Seite (lib/content/team.ts).
   */
  quoteOnHold?: string;
}

export const teamData: TeamMember[] = [
  {
    name: 'Diplomingenieur Sabri Demir',
    role: 'Geschäftsführer und Meister',
    experience: 'Über 25 Jahre Handwerkserfahrung',
    quote: 'Ein guter Chef sitzt nicht im Elfenbeinturm. Wir sprechen auf Augenhöhe, investieren in bestes Werkzeug und halten Feierabendversprechen ein.',
    quoteOnHold: 'B30: nennt Feierabend; widerspricht den flexiblen Arbeitszeiten (B28).',
  },
  {
    name: 'Alexander Koch',
    role: 'Obermonteur Wärmepumpen',
    experience: '6 Jahre im Betrieb',
    quote: 'Freitags ab 13:30 Uhr Wochenende ist kein Werbespruch, sondern Realität. Das Hilti Werkzeug und die kurzen Wege in Wetzlar machen den Unterschied.',
    quoteOnHold: 'B30: nennt 13:30 Uhr; widerspricht den flexiblen Arbeitszeiten (B28).',
  },
  {
    name: 'Marc Becker',
    role: 'Kundendienstmonteur',
    experience: '4 Jahre im Betrieb',
    quote: 'Mein Firmenwagen vor der Haustür spart mir jeden Tag eine Stunde Fahrzeit. Die Touren sind fair geplant, kein Stress und keine Hektik.',
  },
  {
    name: 'Jonas Weber',
    role: 'Auszubildender 2. Lehrjahr',
    experience: 'Seit August 2024 im Betrieb',
    quote: 'Ich durfte vom ersten Monat an richtig mitarbeiten und nicht nur fegen. Mein eigenes Hilti Werkzeugset hat mich mega motiviert.',
  },
];
