import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RABT | رَبْط — Hifz Retention Engine',
    short_name: 'RABT',
    description: 'A quiet, precise instrument for detecting forgetting and silent erosion in Qur’an memorization (Hifz).',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#176B68',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
