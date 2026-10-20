import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.API_URL ?? 'http://localhost:9000'
const SECRET  = process.env.INTERNAL_API_SECRET

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { path } = await params

  // Enforce that the userId in the path matches the logged-in user.
  // Routes with a userId as last segment: dashboard/:id, trading212/*/:userId, calendar/*/:userId
  // Exception: calendar/apple has no userId (it's a per-user ICS proxy, no id in path).
  const userIdSegment = path[path.length - 1]
  const routesWithUserId = ['dashboard', 'trading212', 'calendar']
  // const noUserIdPaths   = ['calendar/apple']
  const pathStr = path.join('/')
  if (
    routesWithUserId.includes(path[0]) &&
    // !noUserIdPaths.some(p => pathStr.startsWith(p)) &&
    userIdSegment !== session.user.id
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const encodedPath = path.map(encodeURIComponent).join('/')

  // Force userId on the OAuth redirect so an attacker cannot link Google Calendar to a victim's account
  const search = req.nextUrl.search
  // if (pathStr === 'auth/google/redirect') {
  //   const qs = new URLSearchParams(req.nextUrl.searchParams)
  //   qs.set('userId', session.user.id)
  //   search = `?${qs.toString()}`
  // }

  const url = `${BACKEND}/${encodedPath}${search}`

  if (!SECRET) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

  const headers: Record<string, string> = {
    'X-Internal-Secret': SECRET,
    'Content-Type': 'application/json',
    'X-User-Id': session.user.id,
  }

  // Versioned saves: pass the client's preconditions through (only on writes — on a GET the
  // browser may add If-None-Match itself for caching, which the backend doesn't handle)
  if (req.method !== 'GET') {
    for (const name of ['If-Match', 'If-None-Match']) {
      const value = req.headers.get(name)
      if (value) headers[name] = value
    }
  }

  const body =
    req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined

  const upstream = await fetch(url, { method: req.method, headers, body, redirect: 'manual' })

  // Pass redirects through (e.g. Google OAuth flow)
  if (upstream.status >= 300 && upstream.status < 400) {
    return NextResponse.redirect(upstream.headers.get('Location') ?? '/', upstream.status)
  }

  // 204/205/304 must not carry a body — the Response constructor throws if given one (even "")
  const responseBody = [204, 205, 304].includes(upstream.status) ? null : await upstream.text()

  const responseHeaders: Record<string, string> = {
    'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
  }
  // ETag = dashboard version for the next save; Retry-After = how long to wait after a 429
  for (const name of ['ETag', 'Retry-After']) {
    const value = upstream.headers.get(name)
    if (value) responseHeaders[name] = value
  }

  return new NextResponse(responseBody, { status: upstream.status, headers: responseHeaders })
}

export const GET    = handler
export const POST   = handler
export const DELETE = handler
