/**
 * Profile des Betriebs im Netz für `sameAs` (Plan §C4, M-030): nur echte, selbst geprüfte URLs mit Prüfdatum. Eine
 * Adresse kommt erst hierher, wenn sie aufgerufen wurde und eindeutig zu Bad und Energie GmbH Lahn Dill gehört
 * (Google-Unternehmensprofil, Kununu, BA-Arbeitgeberprofil, Handwerkskammer …). Bis der Inhaber Profile nennt, ist die
 * Liste leer; `sameAs` trägt dann nur die Website für Kunden (SITE_CONFIG.consumerUrl).
 */

export interface Profil {
  /** Wo das Profil liegt, z. B. „Google-Unternehmensprofil“ oder „Kununu“. */
  plattform: string;
  /** Vollständige https-Adresse des Profils. */
  url: string;
  /** Tag, an dem jemand die Adresse aufgerufen und dem Betrieb zugeordnet hat (JJJJ-MM-TT). */
  geprueftAm: string;
}

export const PROFILE: readonly Profil[] = Object.freeze([]);
