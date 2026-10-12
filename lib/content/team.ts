import { teamData, type TeamMember } from '@/lib/data/team';

/** Alle vier im Team mit Profil (Name, Rolle); die Zitate sind echt und vom Owner freigegeben (ROADMAP §1). */
export const TEAM_MEMBER_IDS = ['demir', 'koch', 'becker', 'weber'] as const;
export type TeamMemberId = (typeof TEAM_MEMBER_IDS)[number];

/**
 * Zitate, die gezeigt werden. Demir und Koch nennen Feierabend bzw. 13:30 Uhr und widersprechen damit den
 * flexiblen Arbeitszeiten (fakten-abgleich B28): ausgeblendet, bis der Inhaber neue Zitate freigibt (B30,
 * `quoteOnHold` in lib/data/team.ts). Ihr Wortlaut kommt in kein HTML, keinen Feed und kein JSON-LD.
 */
export const TEAM_QUOTE_IDS = ['becker', 'weber'] as const satisfies readonly TeamMemberId[];
export type TeamQuoteId = (typeof TEAM_QUOTE_IDS)[number];

/** Person ohne Zitat (z. B. Geschäftsführer im Impressum und in den Stammdaten). */
export interface TeamProfile {
  id: TeamMemberId;
  /** Anzeigename ohne akademischen Titel, z. B. „Sabri Demir“. */
  name: string;
  /** Name wie in lib/data/team.ts. */
  fullName: string;
  initials: string;
  role: string;
  /** Nur zeitlose Angaben; fehlt, solange der Stichtag offen ist (siehe timelessProfile). */
  experience?: string;
}

export interface TeamQuote extends TeamProfile {
  id: TeamQuoteId;
  quote: string;
}

const FAMILY_NAMES: Record<TeamMemberId, string> = {
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
function timelessProfile(member: TeamMember): Pick<TeamProfile, 'role' | 'experience'> {
  const role = member.role.replace(/\s+\d+\.\s*Lehrjahr$/, '');
  const relativeTenure = /^\d+\s+Jahre?\s+im\s+Betrieb$/i.test(member.experience);
  return { role, experience: relativeTenure ? undefined : member.experience };
}

function toProfile(id: TeamMemberId): TeamProfile {
  const member = findMember(FAMILY_NAMES[id]);
  const name = member.name.replace(/^Diplomingenieur\s+/, '');
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return Object.freeze({ id, name, fullName: member.name, initials, ...timelessProfile(member) });
}

export const TEAM_PROFILES: Readonly<Record<TeamMemberId, TeamProfile>> = Object.freeze(
  Object.fromEntries(TEAM_MEMBER_IDS.map((id) => [id, toProfile(id)])) as Record<TeamMemberId, TeamProfile>,
);

function toQuote(id: TeamQuoteId): TeamQuote {
  const member = findMember(FAMILY_NAMES[id]);
  if (member.quoteOnHold) throw new Error(`lib/content/team: Zitat „${id}“ ist ausgeblendet (${member.quoteOnHold})`);
  return Object.freeze({ ...TEAM_PROFILES[id], id, quote: member.quote });
}

export const TEAM_QUOTES: Readonly<Record<TeamQuoteId, TeamQuote>> = Object.freeze({
  becker: toQuote('becker'),
  weber: toQuote('weber'),
});

/** Ausgeblendete Zitate (nur für Tests und Doku): Id und Grund, ohne Wortlaut. */
export const TEAM_QUOTES_ON_HOLD: readonly { id: TeamMemberId; reason: string }[] = Object.freeze(
  TEAM_MEMBER_IDS.flatMap((id) => {
    const reason = findMember(FAMILY_NAMES[id]).quoteOnHold;
    return reason ? [Object.freeze({ id, reason })] : [];
  }),
);

export function getTeamQuote(id: TeamQuoteId): TeamQuote {
  return TEAM_QUOTES[id];
}

/** Zitat einer Person, falls freigegeben; sonst undefined (ausgeblendet, siehe TEAM_QUOTE_IDS). */
export function getReleasedQuote(id: TeamMemberId): TeamQuote | undefined {
  return (TEAM_QUOTE_IDS as readonly TeamMemberId[]).includes(id) ? TEAM_QUOTES[id as TeamQuoteId] : undefined;
}
