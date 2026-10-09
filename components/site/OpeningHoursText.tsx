import { Fragment } from 'react';

/**
 * Opening hours such as „Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr“ with line breaks only
 * between the day groups, never inside a time range or between a day and its time.
 * Server- and client-safe (no hooks); the source text in lib/content stays unchanged.
 */
export function OpeningHoursText({ text }: { text: string }) {
  return text.split(', ').map((group, index) => (
    <Fragment key={index}>
      {index > 0 && ', '}
      <span className="whitespace-nowrap">{group}</span>
    </Fragment>
  ));
}
