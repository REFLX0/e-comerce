import { NextResponse } from 'next/server'
import { GET as getTree } from './tree/route'

export async function GET() {
  const treeResponse = await getTree()
  const treeData = await treeResponse.json()
  return NextResponse.json(treeData)
}
