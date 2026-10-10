import { describe, expect, it } from 'vitest';
import { FUNNEL_TARGET, redirectTargetFor } from '../AnchorAliases';

describe('redirectTargetFor', () => {
  it('sends the old inline funnel anchor to the application page', () => {
    expect(redirectTargetFor('#express-funnel')).toBe(FUNNEL_TARGET);
  });

  it('leaves every other hash alone (in-page aliases are plain spans)', () => {
    for (const hash of ['', '#stellen', '#benefits', '#kontakt', '#express']) {
      expect(redirectTargetFor(hash)).toBeNull();
    }
  });
});
