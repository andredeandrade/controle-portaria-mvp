import { buildLogoutResponse, clearAuthSession } from './helpers'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  clearAuthSession(cookieStore)

  return NextResponse.json(buildLogoutResponse(), { status: 200 })
}
