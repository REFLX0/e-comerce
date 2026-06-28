import { NextResponse } from 'next/server'
import { GET as getFeatured } from './featured/route'

export async function GET() {
  const featuredResponse = await getFeatured()
  const featuredData = await featuredResponse.json()
  return NextResponse.json(featuredData)
}
