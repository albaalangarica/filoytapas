import type { Metadata } from 'next'
import { RequestAccessForm } from '../AuthForms'

export const metadata: Metadata = { title: 'Solicitar acceso' }

export default function RequestAccessPage() {
  return <RequestAccessForm />
}
