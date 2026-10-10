import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Maps-Loader ohne Netz und ohne echten Schlüssel: window, document und das Skript-Tag sind gestubbt, Google wird
 * durch den Aufruf des Callbacks nachgestellt. Jeder Test lädt das Modul neu, weil der Loader Zustand pro Seite hält.
 */

const TEST_KEY = 'vitest-maps-key';
const CALLBACK = '__beGoogleMapsLoaded';

class FakeScript {
  src = '';
  async = false;
  onerror: (() => void) | null = null;
  removed = false;
  remove() {
    this.removed = true;
  }
}

interface FakeWindow {
  google?: { maps: { Map?: unknown; importLibrary?: (name: string) => Promise<unknown> } };
  gm_authFailure?: () => void;
  __beGoogleMapsLoaded?: () => void;
  setTimeout: typeof setTimeout;
  clearTimeout: typeof clearTimeout;
}

function stubBrowser() {
  const scripts: FakeScript[] = [];
  const win: FakeWindow = {
    setTimeout: ((fn: () => void, ms?: number) => setTimeout(fn, ms)) as typeof setTimeout,
    clearTimeout: ((id?: ReturnType<typeof setTimeout>) => clearTimeout(id)) as typeof clearTimeout,
  };
  vi.stubGlobal('window', win);
  vi.stubGlobal('document', {
    createElement: () => new FakeScript(),
    head: { appendChild: (script: FakeScript) => scripts.push(script) },
  });
  return { win, scripts };
}

async function freshLoader() {
  vi.resetModules();
  return import('../google-maps-loader');
}

/** The key is resolved asynchronously before the tag is injected. */
async function flush() {
  for (let i = 0; i < 10; i++) await Promise.resolve();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', TEST_KEY);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('loadGoogleMapsScript', () => {
  it('loads the API with loading=async and the callback (no Google console warning)', async () => {
    const { win, scripts } = stubBrowser();
    const loader = await freshLoader();
    const loaded = loader.loadGoogleMapsScript();
    await flush();

    expect(scripts).toHaveLength(1);
    expect(scripts[0].async).toBe(true);
    const url = new URL(scripts[0].src);
    expect(`${url.origin}${url.pathname}`).toBe('https://maps.googleapis.com/maps/api/js');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      key: TEST_KEY,
      v: 'weekly',
      language: 'de',
      region: 'DE',
      loading: 'async',
      callback: CALLBACK,
    });

    const importLibrary = vi.fn(async () => ({}));
    win.google = { maps: { Map: class {}, importLibrary } };
    win[CALLBACK]?.();
    await expect(loaded).resolves.toBe(true);
    expect(importLibrary).toHaveBeenCalledWith('maps');
  });

  it('resolves true without importLibrary as long as google.maps.Map is there', async () => {
    const { win } = stubBrowser();
    const loader = await freshLoader();
    const loaded = loader.loadGoogleMapsScript();
    await flush();
    win.google = { maps: { Map: class {} } };
    win[CALLBACK]?.();
    await expect(loaded).resolves.toBe(true);
  });

  it('resolves false after the timeout when Google never calls back', async () => {
    stubBrowser();
    const loader = await freshLoader();
    const loaded = loader.loadGoogleMapsScript();
    await flush();
    vi.advanceTimersByTime(10_000);
    await expect(loaded).resolves.toBe(false);
  });

  it('a failed script load (network) is not sticky: the tag goes and the next attempt injects a new one', async () => {
    const { win, scripts } = stubBrowser();
    const loader = await freshLoader();
    const first = loader.loadGoogleMapsScript();
    await flush();
    scripts[0].onerror?.();
    await expect(first).resolves.toBe(false);
    expect(scripts[0].removed).toBe(true);
    expect(loader.hasGoogleMapsAuthError()).toBe(false);

    const second = loader.loadGoogleMapsScript();
    await flush();
    expect(scripts).toHaveLength(2);
    expect(scripts[1]).not.toBe(scripts[0]);
    win.google = { maps: { Map: class {} } };
    win[CALLBACK]?.();
    await expect(second).resolves.toBe(true);
  });

  it('gm_authFailure stays sticky: listeners hear it once, no further script is injected', async () => {
    const { win, scripts } = stubBrowser();
    const earlier = vi.fn();
    win.gm_authFailure = earlier;
    const loader = await freshLoader();
    void loader.loadGoogleMapsScript();
    await flush();

    const listener = vi.fn();
    loader.onGoogleMapsAuthError(listener);
    win.gm_authFailure?.();
    win.gm_authFailure?.();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(earlier).toHaveBeenCalled();
    expect(loader.hasGoogleMapsAuthError()).toBe(true);

    await expect(loader.loadGoogleMapsScript()).resolves.toBe(false);
    await flush();
    expect(scripts).toHaveLength(1);
  });
});

describe('reportGoogleMapsProjectError (Googles Fehlerdialog, z. B. BillingNotEnabledMapError)', () => {
  it('falls back like gm_authFailure and stays for the page view', async () => {
    const { scripts } = stubBrowser();
    const loader = await freshLoader();
    const listener = vi.fn();
    loader.onGoogleMapsAuthError(listener);

    loader.reportGoogleMapsProjectError();
    loader.reportGoogleMapsProjectError();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(loader.hasGoogleMapsAuthError()).toBe(true);

    // A remount asks again: it hears the failure at once and loads nothing.
    const late = vi.fn();
    loader.onGoogleMapsAuthError(late);
    expect(late).toHaveBeenCalledTimes(1);
    await expect(loader.loadGoogleMapsScript()).resolves.toBe(false);
    await flush();
    expect(scripts).toHaveLength(0);
  });
});
