import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Rating } from '../Rating';

describe('Rating', () => {
  it('renders one SVG with the star path once and a <use> per star', () => {
    const html = renderToStaticMarkup(createElement(Rating, { value: 5, size: 'sm' }));
    expect(html.match(/<svg/g)).toHaveLength(1);
    expect(html.match(/<path/g)).toHaveLength(1);
    expect(html.match(/<use/g)).toHaveLength(5);
    expect(html).toContain('aria-label="5,0 von 5 Sternen"');
    expect(html).not.toContain('clipPath');
  });

  it('clips the partly filled star', () => {
    const html = renderToStaticMarkup(createElement(Rating, { value: 4.5 }));
    // 5 outlines are not needed: 4 full stars, 1 outline + 1 clipped fill for the half star.
    expect(html.match(/<use/g)).toHaveLength(6);
    expect(html.match(/<clipPath/g)).toHaveLength(1);
  });

  it('stays light: well under 1 KB per rating', () => {
    expect(renderToStaticMarkup(createElement(Rating, { value: 5, size: 'sm' })).length).toBeLessThan(1024);
  });
});
