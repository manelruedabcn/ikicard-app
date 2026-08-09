'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

const GA_ID = 'G-T2ZZKZFLHH';
const GA_DOMAINS = ['www.ikigaier.com', 'app.ikigaier.com'];

declare global {
  interface Window {
    dataLayer: unknown[][];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Emite un page_view manual en cada navegación interna (SPA),
 * porque gtag solo dispara uno al cargar la página por primera vez.
 */
function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;

    // El primer page_view ya lo envía gtag('config', ...); solo rastreamos cambios.
    if (!initialized.current) {
      initialized.current = true;
      return;
    }

    const query = searchParams?.toString();
    const page_path = pathname + (query ? `?${query}` : '');
    window.gtag('event', 'page_view', { page_path });
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        id="gtag-base"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            'linker': {
              'domains': ${JSON.stringify(GA_DOMAINS)}
            }
          });
        `}
      </Script>
      <AnalyticsTracker />
    </>
  );
}
