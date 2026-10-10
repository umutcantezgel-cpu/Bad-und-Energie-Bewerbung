import { FooterSwitch } from './FooterSwitch';
import { FussSchmal } from './fuss/FussSchmal';
import { FussVoll } from './fuss/FussVoll';

/**
 * Fuß jeder Seite (R4-SHELL-02, E-023): das Navy-Band mit dem Leitungspaar als oberem Abschluss, aus einem Guss
 * mit dem Einstieg der Startseite. Außerhalb des Fokusmodus der volle Fuß (components/site/fuss/FussVoll),
 * im Fokusmodus (/bewerbung…) der schmale mit Rechtslinks, Telefon und WhatsApp (FussSchmal).
 * Beide werden auf dem Server gerendert; FooterSwitch wählt nach dem Pfad.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return <FooterSwitch full={<FussVoll year={year} />} slim={<FussSchmal year={year} />} />;
}
