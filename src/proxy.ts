import { NextResponse, type NextRequest } from 'next/server'

/*
 * Primera barrera: sin cookie de sesión no se entra a ninguna ruta interna.
 * Es una comprobación rápida; cada página y acción vuelve a verificar la sesión
 * firmada y que la cuenta siga activa (requireUser / requireAdmin).
 */

const PUBLIC_PATHS = ['/entrar', '/solicitar']

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (isPublic || request.cookies.has('fyt_sesion')) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = '/entrar'
  url.search = pathname !== '/' ? `?next=${encodeURIComponent(pathname + search)}` : ''
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icons/|brand/|favicon.ico|manifest.webmanifest|sw.js|offline.html|robots.txt).*)'],
}
