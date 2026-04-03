import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  return NextResponse.json({
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL || 'missing',
    DATABASE_URL: process.env.DATABASE_URL || 'missing',
    typeofTurso: typeof process.env.TURSO_DATABASE_URL,
    typeofDb: typeof process.env.DATABASE_URL
  });
}
