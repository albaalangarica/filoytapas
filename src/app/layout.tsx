import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/figtree'
import './globals.css'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: { default: 'Filo y Tapas', template: '%s · Filo y Tapas' },
  description: 'El tema del jueves, quién va y qué nos dejó pensando.',
  applicationName: 'Filo y Tapas',
  appleWebApp: { capable: true, title: 'Filo y Tapas', statusBarStyle: 'default' },
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#fbfcff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh overflow-x-clip">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
