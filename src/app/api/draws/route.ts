import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const draws = await prisma.draw.findMany({
      orderBy: {
        drawDate: 'desc',
      },
      take: 20,
    });
    
    // Reverse to match the order expected by the UI (if needed) or keep as is.
    // The C code has them in a fixed list, let's return the latest 20.
    return NextResponse.json(draws.map(d => d.winningNumber));
  } catch (error) {
    console.error('Failed to fetch draws:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
