import { NextResponse } from 'next/server'

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8082/api'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') || '8'
    const res = await fetch(`${BACKEND_URL}/products/best-sellers?limit=${limit}`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch best sellers from backend: ${res.statusText}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
