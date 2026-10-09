import type {NextConfig} from 'next';

const isDev = process.env.NODE_ENV === 'development';

// Report-Only bis Phase 3, danach scharf. Meldungen gehen an /api/csp-report (report-to, ältere
// Browser report-uri). Google-Maps-Hosts nach Googles „Content Security Policy for Maps JavaScript
// API“ (Allowlist-Variante); deren 'unsafe-eval' fehlt bewusst, die Meldungen zeigen vor Phase 3,
// ob die 2-Klick-Karte es braucht. `unsafe-eval` nur lokal, weil React Refresh im Dev-Server eval nutzt.
const CSP_REPORT_PATH = '/api/csp-report';
const CSP_REPORT_GROUP = 'csp-endpoint';

const GOOGLE_MAPS = {
  script: 'https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.ggpht.com https://*.googleusercontent.com blob:',
  img: 'https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.googleusercontent.com https://*.ggpht.com',
  connect: 'https://*.googleapis.com https://*.google.com https://*.gstatic.com data: blob:',
  frame: 'https://*.google.com',
};

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} ${GOOGLE_MAPS.script}`, // Bewusst ohne Hash/Nonce: ein Hash schaltet 'unsafe-inline' ab und sperrte die Inline-Skripte von Next (self.__next_f); bis zur Nonce-Strategie deckt 'unsafe-inline' alle ab, auch das Kopfskript (Hash: lib/motion/head-script.ts HEAD_SCRIPT_SHA256; Prüfung lib/motion/__tests__/csp.test.ts)
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `img-src 'self' data: blob: ${GOOGLE_MAPS.img}`,
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' ${GOOGLE_MAPS.connect} https://*.supabase.co`,
  `frame-src ${GOOGLE_MAPS.frame}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  `report-uri ${CSP_REPORT_PATH}`,
  `report-to ${CSP_REPORT_GROUP}`,
].join('; ');

// Einzige Quelle für Security-Header (proxy.ts setzt keine).
const securityHeaders = [
  {key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload'},
  {key: 'X-Content-Type-Options', value: 'nosniff'},
  {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
  // Kein `interest-cohort`: FLoC ist eingestellt, Chrome meldet das Feature als Konsolenfehler.
  {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'},
  {key: 'Cross-Origin-Opener-Policy', value: 'same-origin'},
  {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
  {key: 'X-DNS-Prefetch-Control', value: 'on'},
  {key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy},
  {key: 'Reporting-Endpoints', value: `${CSP_REPORT_GROUP}="${CSP_REPORT_PATH}"`},
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {},
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  output: 'standalone',
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)\\.(png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?|eot|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/api/:path*',
        headers: [{key: 'X-Robots-Tag', value: 'noindex'}],
      },
    ];
  },
};

export default nextConfig;
