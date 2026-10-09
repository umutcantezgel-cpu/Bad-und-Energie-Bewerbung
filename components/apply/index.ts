// Der eine Bewerbungsflow (C1). ApplyFlow ist server-sicher (ohne 'use client') und reicht nur
// kleine Daten an seinen Client-Teil weiter. Die Danke-Seite importiert ThankYouView direkt aus
// ./thanks, damit Seiten mit dem Flow deren Client-Code nicht mitladen.
export { ApplyFlow } from './ApplyFlow';
export { getFlowJobOptions, INITIATIVE_OPTION } from './options';
export type { ApplyFlowProps, FlowJobOption } from './types';
