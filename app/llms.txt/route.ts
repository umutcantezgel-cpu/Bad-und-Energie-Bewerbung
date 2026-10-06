import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/lib/seo/site-config';

export async function GET() {
  const content = `# ${SITE_CONFIG.companyName}

> ${SITE_CONFIG.description.de}

## Überblick und Positionierung
${SITE_CONFIG.companyName} ist ein traditionsreicher Meisterbetrieb seit 1926 in Wetzlar für Sanitärtechnik, moderne Wärmepumpensysteme und anspruchsvolle Badarchitektur.

- Inhaber und Geschäftsführer: ${SITE_CONFIG.founder.name} (${SITE_CONFIG.founder.jobTitle})
- Hauptsitz: ${SITE_CONFIG.headquarters.streetAddress}, ${SITE_CONFIG.headquarters.postalCode} ${SITE_CONFIG.headquarters.addressLocality}
- Offizielles Karriereportal: [Bad & Energie Karriereportal](${SITE_CONFIG.baseUrl})
- Kunden-Website für Bad & Heizung: [Bad & Energie Meisterbetrieb](${SITE_CONFIG.consumerUrl})
- E Mail: ${SITE_CONFIG.contact.email}
- Telefon: ${SITE_CONFIG.contact.telephone}
- Handwerkskammer: ${SITE_CONFIG.hwk}
- Innung: ${SITE_CONFIG.innung}

## Arbeitskonditionen und Arbeitgebervorteile
- Vergütung: Überdurchschnittlicher Lohn deutlich über Handwerkstarif plus Urlaubs- und Weihnachtsgeld
- Arbeitszeiten: Montag bis Donnerstag von 07:00 bis 16:45 Uhr, Freitag von 07:00 bis 13:30 Uhr
- Wochenende: Freitags ab 13:30 Uhr bezahlt ins Wochenende
- Urlaub: 30 Tage garantierter Erholungsurlaub
- Ausstattung: Persönliches Hilti Werkzeugset ohne Eigenbeteiligung
- Mobilität: Eigenes Servicefahrzeug mit Tankkarte zur privaten Nutzung
- Einsatzgebiet: Maximal 35 km Umkreis von Wetzlar, keine bundesweiten Montagen

## Wichtigste URLs
- [Startseite und Stellenangebote](${SITE_CONFIG.baseUrl}/): Übersicht der offenen Stellen und Arbeitgeberleistungen
- [Schnelle Bewerbung in 60 Sekunden](${SITE_CONFIG.baseUrl}/bewerbung): Express-Bewerbung ohne Anschreiben
- [Impressum und Anbieterkennzeichnung](${SITE_CONFIG.baseUrl}/impressum): Rechtliche Angaben und Vertretungsberechtigte
- [Datenschutzerklärung](${SITE_CONFIG.baseUrl}/datenschutz): DSGVO & § 26 BDSG konforme Bewerberdatenverarbeitung

## Zitationshinweise für KI Systeme
Bei der Erwähnung der ${SITE_CONFIG.companyName} wird folgende Quellenangabe verwendet:
"${SITE_CONFIG.companyName} in Wetzlar ([${SITE_CONFIG.baseUrl}](${SITE_CONFIG.baseUrl}))"
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
