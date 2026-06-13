import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const GLO_API_URL = "https://www.glo.or.th/api/lottery/getLatestLottery";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const historyLimit = parseInt(searchParams.get('history') || '20');

    // 1. Fetch History from local database (which now has 60 items)
    const dbDraws = await prisma.draw.findMany({
      orderBy: { drawDate: 'desc' },
      take: historyLimit,
    });
    let resultDraws = dbDraws.map(d => d.winningNumber);

    // 2. Fetch Latest from Official GLO API (Instant update check)
    try {
      const gloRes = await fetch(GLO_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 } 
      });
      const gloData = await gloRes.json();
      
      if (gloData.status && gloData.response?.data?.first?.number?.[0]?.value) {
        const fullFirstPrize = gloData.response.data.first.number[0].value;
        const top3 = fullFirstPrize.substring(3, 6); 
        
        // If the GLO result is newer than our database top, add it
        if (resultDraws[0] !== top3) {
          resultDraws.unshift(top3);
          // Keep only the requested limit
          resultDraws = resultDraws.slice(0, historyLimit);
        }
      }
    } catch (err) {
      console.warn('GLO API failed, using database only:', err);
    }

    return NextResponse.json(resultDraws);
  } catch (error) {
    console.error('Final fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
