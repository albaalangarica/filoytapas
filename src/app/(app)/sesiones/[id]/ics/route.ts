import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { buildIcs } from '@/lib/domain/ics'

/** La sesión como evento de calendario (.ics): en iPhone abre directamente «Añadir al calendario». */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return new NextResponse('No autorizado', { status: 401 })

  const id = decodeURIComponent((await params).id)
  const topic = (await getAppData()).topics.find((t) => t.id === id && t.publicado)
  if (!topic) return new NextResponse('No encontrada', { status: 404 })

  const ics = buildIcs(topic, { url: `${request.nextUrl.origin}/sesiones/${encodeURIComponent(topic.id)}` })
  return new NextResponse(ics, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `inline; filename="filoytapas-${topic.id}.ics"`,
      'cache-control': 'private, no-store',
    },
  })
}
