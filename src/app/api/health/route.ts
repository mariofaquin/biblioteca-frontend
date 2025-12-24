import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    service: 'BiblioTech Frontend',
    version: '1.0.30',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    api_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003',
    app_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  })
}