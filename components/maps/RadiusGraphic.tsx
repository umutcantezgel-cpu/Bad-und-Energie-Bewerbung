import { cn } from '@/lib/utils/cn';
import { CENTER_DOT_RADIUS, CENTER_LABEL_ID, SELECTED_RING_RADIUS, graphicLabels, radiusNote } from './graphic';
import type { RegionMapData } from './types';

export interface RadiusGraphicProps {
  data: RegionMapData;
  selectedId: string | null;
  titleId: string;
  descId: string;
  className?: string;
}

/**
 * Typographic radius graphic: the 35 km circle around Wetzlar with the places at their real
 * relative positions (no tiles, no external requests). Selection = ink dot with ring, never red.
 */
export function RadiusGraphic({ data, selectedId, titleId, descId, className }: RadiusGraphicProps) {
  const { size, origin, radius } = data;
  const note = radiusNote(data);
  const labels = graphicLabels(data, selectedId);
  const selected = data.places.find((place) => place.id === selectedId) ?? null;
  const centerSelected = selected?.atCenter ?? false;
  const others = data.places.filter((place) => !place.atCenter && place.id !== selected?.id);
  const placeNames = data.places.filter((place) => !place.atCenter).map((place) => place.name);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      className={cn('size-full select-none', className)}
    >
      <title id={titleId}>{`Einsatzgebiet: ${data.radiusKm} km um ${data.centerName}`}</title>
      <desc id={descId}>
        {`Schematische Karte mit ${data.centerName} in der Mitte. Im Umkreis liegen ${placeNames.join(', ')}. Entfernung und Fahrzeit stehen in der Tabelle.`}
      </desc>

      <circle
        cx={origin.x}
        cy={origin.y}
        r={radius}
        className="fill-surface-2 stroke-line-strong"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={origin.x}
        y1={origin.y}
        x2={note.lineEnd.x}
        y2={note.lineEnd.y}
        className="stroke-line-strong"
        strokeWidth={1}
        strokeDasharray="2 4"
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={note.x}
        y={note.y}
        dominantBaseline="central"
        className="fill-ink-muted text-callout tabular-nums sm:text-footnote"
      >
        {note.text}
      </text>

      {others.map((place) => (
        <circle key={place.id} cx={place.x} cy={place.y} r={3} className="fill-ink-muted" />
      ))}

      {selected && !selected.atCenter && (
        <g>
          <circle
            cx={selected.x}
            cy={selected.y}
            r={SELECTED_RING_RADIUS}
            className="fill-none stroke-ink"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={selected.x} cy={selected.y} r={5} className="fill-ink" />
        </g>
      )}

      {centerSelected && (
        <circle
          cx={origin.x}
          cy={origin.y}
          r={SELECTED_RING_RADIUS + 1}
          className="fill-none stroke-ink"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      )}
      <circle cx={origin.x} cy={origin.y} r={CENTER_DOT_RADIUS} className="fill-ink stroke-surface-2" strokeWidth={2} />

      {labels.map((label) => {
        const emphasized = label.id === CENTER_LABEL_ID || label.id === selected?.id;
        return (
          <text
            key={label.id}
            x={label.x}
            y={label.y}
            textAnchor={label.anchor}
            dominantBaseline="central"
            paintOrder="stroke"
            strokeWidth={4}
            strokeLinejoin="round"
            className={cn(
              'fill-ink stroke-surface-2 text-callout sm:text-footnote',
              emphasized ? 'font-semibold' : 'font-medium',
            )}
          >
            {label.text}
          </text>
        );
      })}
    </svg>
  );
}
