import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.API_URL ?? 'http://localhost:9000'
const SECRET  = process.env.INTERNAL_API_SECRET ?? 'dev-secret-change-in-prod'

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
  const noUserIdPaths   = ['calendar/apple']
  const pathStr = path.join('/')
  if (
    routesWithUserId.includes(path[0]) &&
    !noUserIdPaths.some(p => pathStr.startsWith(p)) &&
    userIdSegment !== session.user.id
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = `${BACKEND}/${path.join('/')}${req.nextUrl.search}`

  const headers: Record<string, string> = {
    'X-Internal-Secret': SECRET,
    'Content-Type': 'application/json',
  }

  const body =
    req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined

  const upstream = await fetch(url, { method: req.method, headers, body })
  const text = await upstream.text()

  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
  })
}

export const GET    = handler
export const POST   = handler
export const DELETE = handler
