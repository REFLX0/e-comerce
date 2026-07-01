import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 'shell',
      name: 'SHELL',
      slug: 'shell',
    },
    {
      id: 'yacco',
      name: 'YACCO',
      slug: 'yacco',
    },
    {
      id: 'accor',
      name: 'ACCOR',
      slug: 'accor',
    },
    {
      id: 'kennol',
      name: 'KENNOL',
      slug: 'kennol',
    },
  ])
}
