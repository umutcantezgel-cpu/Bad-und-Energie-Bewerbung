import { expect, test, type ElementHandle, type Page } from '@playwright/test';
import { JOB_PAGE_PATH, PAGE_FLOW_PATH, TapCounter, answerQuestions, fillContact, flowRoot, safeDecode, submitButton, waitForHydration } from './support/flow';
import { useOwnClientIp } from './support/site';

/**
 * Herkunft ohne Browser-Speicher (Plan §D, lib/attribution/link.ts und klick.ts): Der Link-Beobachter hängt den Kanal
 * an Bewerbungslinks und den sichtbaren Code an WhatsApp-Links, sobald jemand den Link benutzt; ein neuer Tab mit
 * `?herkunft=` trägt den Kanal bis in die Bewerbung. Im echten Browser, mit React und nachgeladenem Beobachter.
 *
 * Beides nur mit dem Schalter FUNNEL_EVENTS (lib/attribution/schalter.ts, Freigabe M-034): Der Testserver läuft ohne
 * ihn (Standard, Wortlaut von /datenschutz#herkunft); für „an“ setzt ein Init-Skript das Meta-Element des Root-Layouts.
 */

test.beforeEach(async ({ page }) => {
  await useOwnClientIp(page);
});

/** Schalter an wie mit FUNNEL_EVENTS=true: `<meta name="be-ereignisse" content="an">` vor dem ersten Skript der Seite. */
async function schalterAn(page: Page) {
  await page.addInitScript(() => {
    // Sobald der Parser <head> angelegt hat, vor jedem Skript der Seite (Mikrotask nach dem Einfügen)
    const beobachter = new MutationObserver(() => {
      if (!document.head) return;
      beobachter.disconnect();
      const meta = document.createElement('meta');
      meta.name = 'be-ereignisse';
      meta.content = 'an';
      document.head.append(meta);
    });
    beobachter.observe(document, { childList: true, subtree: true });
  });
  // Ereignisse gehen ins Leere: Der Server hat den Schalter nicht und sagt nein, das stört den Test nicht.
  await page.route('**/api/e', (route) => route.fulfill({ status: 204, body: '' }));
}

test('ohne Schalter (Standard bis M-034): Links bleiben unverändert, ?herkunft= zählt nicht', async ({ page }) => {
  let attribution: unknown = null;
  await page.route('**/api/bewerbung', async (route) => {
    attribution = (route.request().postDataJSON() as { attribution?: unknown }).attribution ?? null;
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'SERVICE_UNAVAILABLE' }) });
  });

  await page.goto(`${JOB_PAGE_PATH}?utm_source=indeed&utm_medium=jobboard&utm_campaign=test`);
  expect(await page.locator('meta[name="be-ereignisse"]').count()).toBe(0);
  const bewerben = await page.locator('a[href="/bewerbung"]').first().elementHandle();
  const whatsapp = await page.locator('a[href^="https://api.whatsapp.com/send"]').first().elementHandle();
  if (!bewerben || !whatsapp) throw new Error('Links fehlen');
  const waVorher = await whatsapp.getAttribute('href');
  // Dem Beobachter Zeit geben, falls er doch nachgeladen würde
  await page.waitForTimeout(1500);
  expect(await hrefNachKontextmenue(bewerben)).toBe('/bewerbung');
  expect(await hrefNachKontextmenue(whatsapp)).toBe(safeDecode(waVorher ?? ''));

  // Ein Link mit ?herkunft= von außen: Die Bewerbung trägt keinen Kanal daraus
  await page.goto(`${PAGE_FLOW_PATH}&herkunft=ind`);
  const flow = flowRoot(page, 'page');
  await waitForHydration(flow);
  const taps = new TapCounter(test.info());
  await answerQuestions(flow, taps);
  await fillContact(flow);
  await taps.tap(submitButton(flow));
  await expect.poll(() => attribution, { message: 'Bewerbung abgeschickt' }).not.toBeNull();
  // Nur, was der Flow selbst weiß (Einstiegsseite, eigener Funnel), kein Kanal aus ?herkunft=
  expect(attribution).toEqual({ landingPath: '/bewerbung', funnel: 'bewerbung' });
});

/**
 * Löst das Kontextmenü aus (wie „In neuem Tab öffnen“), bis der nachgeladene Beobachter den Link geändert hat. Ein
 * fester Handle statt eines Locators: Der Locator mit dem alten href träfe nach der Änderung einen anderen Link.
 */
async function hrefNachKontextmenue(link: ElementHandle): Promise<string> {
  await link.dispatchEvent('contextmenu');
  return safeDecode((await link.getAttribute('href')) ?? '');
}

test('mit Schalter, Einstieg über Indeed: Bewerbungslink und WhatsApp tragen den Kanal, ohne Cookie und ohne Speicher', async ({ page }) => {
  await schalterAn(page);
  await page.goto(`${JOB_PAGE_PATH}?utm_source=indeed&utm_medium=jobboard&utm_campaign=test`);

  // „Jetzt bewerben“ im Kopf führt auf /bewerbung (der Knopf der Stelle springt zum eingebetteten Flow).
  const bewerben = await page.locator('a[href="/bewerbung"]').first().elementHandle();
  if (!bewerben) throw new Error('kein Link auf /bewerbung');
  await expect.poll(() => hrefNachKontextmenue(bewerben), { message: 'Bewerbungslink mit Herkunft' }).toBe('/bewerbung?herkunft=ind');
  // Nur der Kanal geht mit, nie die Kampagne
  expect(await bewerben.getAttribute('href')).not.toMatch(/utm_|test/);

  const whatsapp = await page.locator('a[href^="https://api.whatsapp.com/send"]').first().elementHandle();
  if (!whatsapp) throw new Error('kein WhatsApp-Link');
  await expect.poll(() => hrefNachKontextmenue(whatsapp), { message: 'WhatsApp mit Code' }).toMatch(/\n– W-IND$/);

  expect(await page.context().cookies()).toEqual([]);
  const gespeichert = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  expect(gespeichert).not.toMatch(/indeed|herkunft|utm|attribution/i);
});

test('mit Schalter, neuer Tab mit ?herkunft=ind: die Bewerbung trägt den Kanal Indeed', async ({ page }, testInfo) => {
  await schalterAn(page);
  let attribution: unknown = null;
  await page.route('**/api/bewerbung', async (route) => {
    attribution = (route.request().postDataJSON() as { attribution?: unknown }).attribution ?? null;
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'SERVICE_UNAVAILABLE' }) });
  });

  await page.goto(`${PAGE_FLOW_PATH}&herkunft=ind`);
  const flow = flowRoot(page, 'page');
  await waitForHydration(flow);
  const taps = new TapCounter(testInfo);
  await answerQuestions(flow, taps);
  await fillContact(flow);
  await taps.tap(submitButton(flow));

  await expect.poll(() => attribution, { message: 'Bewerbung abgeschickt' }).not.toBeNull();
  expect(attribution).toMatchObject({ utmSource: 'indeed', landingPath: '/bewerbung' });
  expect(attribution).not.toHaveProperty('utmCampaign');
});
