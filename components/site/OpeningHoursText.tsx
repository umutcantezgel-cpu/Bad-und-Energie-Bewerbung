import { Fragment } from 'react';
import { Ziffern } from './fuss/Ziffern';

/**
 * Office hours such as „Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr“ with line breaks only
 * between the day groups, never inside a time range or between a day and its time. The times stand
 * in Bricolage digits (`ziffer`, Variante 1), because Atkinson draws the zero with a slash.
 * Server- and client-safe (no hooks); the source text in lib/content stays unchanged.
 *
 * These are the hours the office can be reached, not working hours (working hours are flexible,
 * fakten-abgleich B28). The wrapper carries `data-claims="buerozeiten"`, so scripts/qa/check-claims.mjs
 * skips exactly these times; the label next to it says „Büro erreichbar“.
 */
export function OpeningHoursText({ text }: { text: string }) {
  return (
    <span data-claims="buerozeiten">
      {text.split(', ').map((group, index) => (
        <Fragment key={index}>
          {index > 0 && ', '}
          <span className="whitespace-nowrap">
            <Ziffern text={group} />
          </span>
        </Fragment>
      ))}
    </span>
  );
}
