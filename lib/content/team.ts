import { teamData, type TeamMember } from '@/lib/data/team';

/** Alle vier Zitate sind echt und vom Owner freigegeben (ROADMAP §1). */
export const TEAM_QUOTE_IDS = ['demir', 'koch', 'becker', 'weber'] as const;
export type TeamQuoteId = (typeof TEAM_QUOTE_IDS)[number];

export interface TeamQuote {
  id: TeamQuoteId;
  /** Anzeigename ohne akademischen Titel, z. B. „Sabri Demir“. */
  name: string;
  /** Name wie in lib/data/team.ts. */
  fullName: string;
  initials: string;
  role: string;
  /** Nur zeitlose Angaben; fehlt, solange der Stichtag offen ist (siehe timelessProfile). */
  experience?: string;
  quote: string;
}

const FAMILY_NAMES: Record<TeamQuoteId, string> = {
  demir: 'Demir',
  koch: 'Koch',
  becker: 'Becker',
  weber: 'Weber',
};

function findMember(familyName: string): TeamMember {
  const member = teamData.find((m) => m.name.endsWith(` ${familyName}`));
  if (!member) throw new Error(`lib/content/team: kein Teammitglied „${familyName}“ in lib/data/team.ts`);
  return member;
}

/**
 * lib/data/team.ts nennt Lehrjahr und „x Jahre im Betrieb“ ohne Stichtag; beides wird mit der Zeit
 * falsch (fakten-abgleich.md B20/B21). Bis zur Owner-Antwort bleiben nur die zeitlosen Teile:
 * „Auszubildender 2. Lehrjahr“ → „Auszubildender“, relative Dauer entfällt, „Seit August 2024“ bleibt.
 */
function timelessProfile(member: TeamMember): Pick<TeamQuote, 'role' | 'experience'> {
  const role = member.role.replace(/\s+\d+\.\s*Lehrjahr$/, '');
  const relativeTenure = /^\d+\s+Jahre?\s+im\s+Betrieb$/i.test(member.experience);
  return { role, experience: relativeTenure ? undefined : member.experience };
}

function toQuote(id: TeamQuoteId): TeamQuote {
  const member = findMember(FAMILY_NAMES[id]);
  const name = member.name.replace(/^Diplomingenieur\s+/, '');
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return Object.freeze({
    id,
    name,
    fullName: member.name,
    initials,
    ...timelessProfile(member),
    quote: member.quote,
  });
}

export const TEAM_QUOTES: Readonly<Record<TeamQuoteId, TeamQuote>> = Object.freeze({
  demir: toQuote('demir'),
  koch: toQuote('koch'),
  becker: toQuote('becker'),
  weber: toQuote('weber'),
});

export function getTeamQuote(id: TeamQuoteId): TeamQuote {
  return TEAM_QUOTES[id];
}
