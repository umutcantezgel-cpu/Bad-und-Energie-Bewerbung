import { describe, expect, it } from 'vitest';
import { IN_APP_BROWSER, inAppBrowser, kannTeilen, pdfDatei } from '../pdf-download';

/** „PDF herunterladen“ (L4): In-App-Browser an der Kennung, Teilen nur mit Teilen-Menü für Dateien. */

const UA = {
  instagramIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 334.0.4.32.98 (iPhone15,2; iOS 17_5; de_DE; de; scale=3.00; 1179x2556; 609529009)',
  instagramAndroid:
    'Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/AP2A.240805.005; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.103 Mobile Safari/537.36 Instagram 343.0.0.33.101 Android (34/14; 420dpi; 1080x2400; Google/google; Pixel 7; panther; panther; de_DE; 629298823)',
  facebookIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.39.106;FBBV/617306468;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBSS/3;FBID/phone;FBLC/de_DE;FBOP/5;FBRV/619180366]',
  facebookAndroid:
    'Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/AP2A.240805.005; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.103 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/478.0.0.41.86;]',
  tiktokIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_35.5.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/de Region/DE WKWebView/1 BytedanceWebview/d8a21c6',
  tiktokAndroid:
    'Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/AP2A.240805.005; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.103 Mobile Safari/537.36 trill_350503 JsSdk/1.0 NetType/WIFI Channel/googleplay AppName/musical_ly app_version/35.5.3 ByteLocale/de BytedanceWebview/d8a21c6',
  chromeAndroid: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  safariIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  chromeDesktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
} as const;

describe('In-App-Browser', () => {
  it('erkennt Instagram, Facebook und TikTok auf iOS und Android', () => {
    expect(inAppBrowser(UA.instagramIos)).toBe('instagram');
    expect(inAppBrowser(UA.instagramAndroid)).toBe('instagram');
    expect(inAppBrowser(UA.facebookIos)).toBe('facebook');
    expect(inAppBrowser(UA.facebookAndroid)).toBe('facebook');
    expect(inAppBrowser(UA.tiktokIos)).toBe('tiktok');
    expect(inAppBrowser(UA.tiktokAndroid)).toBe('tiktok');
  });

  it('lässt normale Browser in Ruhe (Chrome Android, Safari iOS, Desktop)', () => {
    expect(inAppBrowser(UA.chromeAndroid)).toBeNull();
    expect(inAppBrowser(UA.safariIos)).toBeNull();
    expect(inAppBrowser(UA.chromeDesktop)).toBeNull();
    expect(inAppBrowser('')).toBeNull();
  });

  it('nennt die App beim Namen', () => {
    expect(IN_APP_BROWSER).toEqual({ instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' });
  });
});

describe('kannTeilen', () => {
  const datei = pdfDatei(new Blob(['%PDF-1.3'], { type: 'application/pdf' }), 'Bewerbungsmappe_Mueller.pdf');
  const teilen = async () => {};

  it('nur, wenn das Teilen-Menü Dateien annimmt', () => {
    expect(kannTeilen(datei, { canShare: () => true, share: teilen })).toBe(true);
    expect(kannTeilen(datei, { canShare: () => false, share: teilen })).toBe(false);
  });

  it('ohne Teilen (Desktop-Browser, Node) oder bei Fehlern: nein', () => {
    expect(kannTeilen(datei, undefined)).toBe(false);
    expect(kannTeilen(datei, {})).toBe(false);
    expect(kannTeilen(datei, { share: teilen })).toBe(false);
    expect(kannTeilen(datei, { canShare: () => true })).toBe(false);
    expect(
      kannTeilen(datei, {
        canShare: () => {
          throw new TypeError('kaputt');
        },
        share: teilen,
      }),
    ).toBe(false);
  });

  it('gibt dem Teilen-Menü eine PDF-Datei mit Namen', () => {
    expect(datei.name).toBe('Bewerbungsmappe_Mueller.pdf');
    expect(datei.type).toBe('application/pdf');
  });
});
