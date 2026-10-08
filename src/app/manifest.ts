import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Filo y Tapas',
    short_name: 'Filo y Tapas',
    description: 'El tema del jueves, quién va y qué nos dejó pensando.',
    lang: 'es',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fbfcff',
    theme_color: '#1e47e0',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
