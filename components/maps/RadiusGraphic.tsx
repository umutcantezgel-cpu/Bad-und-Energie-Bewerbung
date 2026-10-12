import { cn } from '@/lib/utils/cn';
import {
  CENTER_LABEL_ID,
  LANDSCAPE_CLEAR,
  LANDSCAPE_LABEL_FONT_SIZE,
  RING_LABEL_FONT_SIZE,
  SELECTED_RING_RADIUS,
  graphicLabels,
  labelFrame,
  pendelPaths,
  ringLabels,
} from './graphic';
import type { RadiusView, RegionMapData } from './types';

export interface RadiusGraphicProps {
  data: RegionMapData;
  /** The view of the chosen radius (15, 25 or 35 km). */
  view: RadiusView;
  selectedId: string | null;
  /** Pointer shortcut: a tap on a dot or the house picks the place (keyboard: the place list). */
  onSelect?: (id: string) => void;
  titleId: string;
  descId: string;
  /**
   * Places drawn in full and named (pages under /einsatzgebiet: the places of a Kreis, or a place and its
   * neighbours); all others stay small, hollow and unnamed. Omitted: every place as on the home map.
   */
  emphasizeIds?: readonly string[];
  /** Text of <desc>; omitted: the generated description with every place in the frame (home map). */
  description?: string;
  /** Places named first after the selected one and the centre (overview /einsatzgebiet: the larger towns). */
  labelPriority?: readonly string[];
  /**
   * Emphasized places that need not carry a name (Kreis-Hub Lahn-Dill-Kreis: Wetzlar's Stadtteile around the house,
   * which the centre label and the table name). All other emphasized places are always named.
   */
  unnamedIds?: readonly string[];
  className?: string;
}

/** Giebel 45° (K-010) around the origin: ±8 wide, roof ridge at −9, base at +7. */
const CENTER_HOUSE = 'M-8 7V-1L0 -9L8 -1V7Z';
/** One stroke width for every line (K-010, --m-strich = 3 px), independent of the zoom. */
const STRICH = 3;
const lineProps = { strokeWidth: STRICH, vectorEffect: 'non-scaling-stroke' as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/**
 * Einsatzgebiet als Plan (E-START-032/-033/-036/-038): der gewählte Ring füllt den Rahmen (Wärme-
 * fläche), die kleineren Ringe gepunktet, Lahn, Dill, A45 und B49 schematisch darunter, Orte an
 * ihrer echten Lage, das Haus der Werkstatt in der Mitte. Der gewählte Ort hängt mit dem
 * Leitungspaar an Wetzlar: Vorlauf rot hin, Rücklauf blau zurück. Rot und Blau nur als Linie (E-016).
 * Keine Kacheln, keine Fremdanfrage, keine Bewegung (Umschalten wechselt die Ansicht sofort).
 */
export function RadiusGraphic({
  data,
  view,
  selectedId,
  onSelect,
  titleId,
  descId,
  emphasizeIds,
  description,
  labelPriority,
  unnamedIds = [],
  className,
}: RadiusGraphicProps) {
  const { size, origin, radius } = view;
  const emphasized = (id: string) => !emphasizeIds || emphasizeIds.includes(id) || id === selectedId;
  const fullFrame = labelFrame(data, view);
  // Gedämpfte Orte bekommen keinen Namen; ihre Punkte dürfen unter einem Namen liegen (klein und hohl).
  // Hervorgehobene Orte (Seiten unter /einsatzgebiet) tragen alle ihren Namen, nötigenfalls mit Hinweislinie.
  const frame = emphasizeIds
    ? {
        ...fullFrame,
        places: fullFrame.places.filter((place) => emphasized(place.id)),
        mustLabel: fullFrame.places.filter((place) => emphasized(place.id) && !unnamedIds.includes(place.id)).map((place) => place.id),
        priority: labelPriority,
      }
    : { ...fullFrame, priority: labelPriority };
  const labels = graphicLabels(frame, selectedId);
  const rings = ringLabels(view);
  const selectedIndex = data.places.findIndex((place) => place.id === selectedId);
  const selectedPlace = selectedIndex >= 0 ? data.places[selectedIndex] : null;
  const selectedPoint = selectedIndex >= 0 ? view.points[selectedIndex] : null;
  const centerSelected = selectedPlace?.atCenter ?? false;
  const pendel =
    selectedPlace && selectedPoint?.inFrame && !selectedPlace.atCenter ? pendelPaths(origin, selectedPoint.drawn) : null;
  const inFrameNames = frame.places.filter((place) => !place.atCenter).map((place) => place.name);
  // Hohl = außerhalb des gewählten Radius, nach der Entfernung der Ortsliste (wie radiusStatus in status.ts),
  // damit Punkt, Kärtchen und Ergebnis dasselbe sagen. Die Lage des Punkts folgt der Luftlinie.
  const outside = (distanceKm: number) => distanceKm > view.radiusKm;
  const maskId = `${titleId}-landschaft`;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      className={cn('block size-full select-none', className)}
    >
      {/* E-023: Die Zusage (35 km) steht in der Überschrift und am Ring; Titel und Beschreibung wiederholen sie nicht. */}
      <title id={titleId}>{`Plan des Einsatzgebiets um ${data.centerName}, Kreise in Luftlinie`}</title>
      <desc id={descId}>
        {description ??
          `${data.centerName} in der Mitte. ` +
            (view.radiusKm === data.radiusKm ? 'Ausschnitt: das ganze Einsatzgebiet. ' : `Ausschnitt: ${view.radiusKm} km um ${data.centerName}. `) +
            `Lahn, Dill, A45 und B49 sind schematisch eingezeichnet. Im Ausschnitt liegen ${inFrameNames.join(', ')}. ` +
            (selectedPlace ? `Gewählt: ${selectedPlace.name}. ` : '') +
            'Entfernung und Fahrzeit stehen in der Ortsliste.'}
      </desc>

      {/* Wärmefläche: alles innerhalb des gewählten Radius */}
      <circle cx={origin.x} cy={origin.y} r={radius} className="fill-waerme" />

      {/* Landschaft, schematisch (unter allem anderen); um das Haus bleibt eine freie Scheibe, damit
          die dichten Orte um Wetzlar lesbar bleiben (dort laufen alle vier Linien zusammen). */}
      <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={size} height={size}>
        <rect width={size} height={size} fill="white" />
        <circle cx={origin.x} cy={origin.y} r={LANDSCAPE_CLEAR} fill="black" />
      </mask>
      <g aria-hidden="true" fill="none" mask={`url(#${maskId})`}>
        {view.landscape.map((line) => (
          <path
            key={line.id}
            d={line.d}
            className="stroke-ink-muted"
            strokeDasharray={line.kind === 'strasse' ? '9 7' : undefined}
            {...lineProps}
          />
        ))}
      </g>

      {/* Ringe: kleinere gepunktet, der gewählte als feste Linie */}
      <g fill="none" className="stroke-brand">
        {view.rings.map((ring) => (
          <circle
            key={ring.km}
            cx={origin.x}
            cy={origin.y}
            r={ring.r}
            strokeDasharray={ring.km === view.radiusKm ? undefined : '0.1 9'}
            {...lineProps}
          />
        ))}
      </g>

      {/* Namen der Landschaft unter dem Pendel: ihr Halo unterbricht Ringe und Landschaft, nie Vorlauf und Rücklauf */}
      <g aria-hidden="true" paintOrder="stroke" strokeLinejoin="round" className="stroke-waerme">
        {view.landscape.map(
          (line) =>
            line.label && (
              <text
                key={line.id}
                x={line.label.x}
                y={line.label.y}
                textAnchor={line.label.anchor}
                dominantBaseline="central"
                strokeWidth={4}
                fontSize={LANDSCAPE_LABEL_FONT_SIZE}
                className={cn('fill-ink-muted', line.kind === 'strasse' ? 'font-mass font-medium' : 'font-medium')}
              >
                {line.name}
              </text>
            ),
        )}
      </g>

      {/* Pendel: Vorlauf hin, Rücklauf zurück (statisch) */}
      {pendel && (
        <g fill="none">
          <path d={pendel.vorlauf} className="stroke-vorlauf" {...lineProps} />
          <path d={pendel.ruecklauf} className="stroke-ruecklauf" {...lineProps} />
        </g>
      )}

      {/* Orte; außerhalb des gewählten Radius hohl */}
      {data.places.map((place, i) => {
        const point = view.points[i];
        if (!point?.inFrame || place.atCenter) return null;
        const { x, y } = point.drawn;
        const isSelected = place.id === selectedId;
        if (!emphasized(place.id)) {
          return (
            <circle
              key={place.id}
              cx={x}
              cy={y}
              r={3}
              className="fill-surface-raised stroke-ink-muted"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          );
        }
        return (
          <g key={place.id}>
            {isSelected && (
              <circle cx={x} cy={y} r={SELECTED_RING_RADIUS} className="fill-none stroke-brand" strokeWidth={2} vectorEffect="non-scaling-stroke" />
            )}
            <circle
              cx={x}
              cy={y}
              r={isSelected ? 5.5 : 4.5}
              className={outside(place.distanceKm) ? 'fill-surface-raised stroke-brand' : 'fill-brand stroke-waerme'}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })}

      {/* Haus der Werkstatt in der Mitte */}
      <path
        d={CENTER_HOUSE}
        transform={`translate(${origin.x} ${origin.y})`}
        className={cn('stroke-brand', centerSelected ? 'fill-brand' : 'fill-surface-raised')}
        {...lineProps}
      />

      {/* Ringe und Orte beschriftet, mit Halo in Wärme, damit Linien darunter nicht durch die Schrift laufen */}
      <g paintOrder="stroke" strokeLinejoin="round" className="stroke-waerme">
        {rings.map((ring) => (
          <text
            key={ring.km}
            x={ring.x}
            y={ring.y}
            dominantBaseline="central"
            strokeWidth={4}
            fontSize={RING_LABEL_FONT_SIZE}
            className="fill-brand font-mass font-semibold"
          >
            {ring.text}
          </text>
        ))}
        {labels.map((label) =>
          label.leader ? (
            <line
              key={`${label.id}-leader`}
              x1={label.leader.x1}
              y1={label.leader.y1}
              x2={label.leader.x2}
              y2={label.leader.y2}
              className="stroke-ink-muted"
              strokeWidth={1.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              aria-hidden="true"
            />
          ) : null,
        )}
        {labels.map((label) => {
          const emphasized = label.id === CENTER_LABEL_ID || label.id === selectedId;
          // Halo in der Farbe der Fläche darunter: Wärme im Ring, außerhalb (Ecken des Rahmens) die Kartenfläche
          const inRing = [label.box.x0, label.box.x1].every((x) =>
            [label.box.y0, label.box.y1].every((y) => Math.hypot(x - origin.x, y - origin.y) <= radius),
          );
          return (
            <text
              key={label.id}
              x={label.x}
              y={label.y}
              textAnchor={label.anchor}
              dominantBaseline="central"
              strokeWidth={4}
              className={cn(
                'fill-ink text-callout sm:text-footnote',
                emphasized ? 'font-bold' : 'font-medium',
                !inRing && 'stroke-surface-raised',
              )}
            >
              {label.text}
            </text>
          );
        })}
      </g>

      {/* Treffflächen für Zeiger (Tastatur: Ortsliste) */}
      {onSelect && (
        <g aria-hidden="true" className="fill-transparent">
          {data.places.map((place, i) => {
            const point = view.points[i];
            if (!point?.inFrame) return null;
            const at = place.atCenter ? origin : point.drawn;
            return (
              <circle
                key={place.id}
                cx={at.x}
                cy={at.y}
                r={place.atCenter ? 14 : 12}
                className="cursor-pointer"
                onClick={() => onSelect(place.id)}
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}
