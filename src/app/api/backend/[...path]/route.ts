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
