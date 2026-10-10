// Nur Server-Komponenten. Den Bewerben-Knopf der alten Seitenleiste gibt es nicht mehr: Die eine rote Aktion
// trägt der Kopf der Stellenseite (Seitenkopf), dauerhaft bleiben der klebende Kopf und die StickyApplyBar.
// JobHeader (Seitenkopf mit CSS-Modulen) steht bewusst nicht im Fass, damit die Startseite darüber kein
// Kopf-CSS lädt; die Stellenseite importiert ihre Teile direkt.
export * from './JobCard';
export * from './JobSections';
export * from './SalaryCard';
export * from './PackageList';
export * from './JobQuote';
export * from './JobProcess';
export * from './JobFaq';
export * from './MoreJobs';
export { withSoftHyphens, pageTitle } from './text';
