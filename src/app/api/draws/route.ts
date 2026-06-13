import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const GIST_URL = "https://gist.github.com/GTZX26/b702b338ff722881acd93e21b1a04d5e/raw";
const GLO_API_URL = "https://www.glo.or.th/api/lottery/getLatestLottery";

export async function GET() {
  try {
    // 1. Fetch History from Gist (the base 20 draws)
    let historicalDraws: string[] = [];
    try {
      const gistRes = await fetch(GIST_URL, { next: { revalidate: 3600 } }); // Cache for 1 hour
      const gistData = await gistRes.json();
      if (Array.isArray(gistData)) {
        historicalDraws = gistData;
      }
    } catch (err) {
      console.error('Gist fetch failed, falling back to database:', err);
      const dbDraws = await prisma.draw.findMany({
        orderBy: { drawDate: 'desc' },
        take: 20,
      });
      historicalDraws = dbDraws.map(d => d.winningNumber);
    }

    // 2. Fetch Latest from Official GLO API (Instant update)
    try {
      const gloRes = await fetch(GLO_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 } // Cache for 1 minute
      });
      const gloData = await gloRes.json();
      
      if (gloData.status && gloData.response?.data?.first?.number?.[0]?.value) {
        const fullFirstPrize = gloData.response.data.first.number[0].value;
        const top3 = fullFirstPrize.substring(3, 6); // Extract "3 ตัวบน"
        
        // 3. Merge: If the GLO result is not at the top of our history, add it.
        if (historicalDraws[0] !== top3) {
          historicalDraws.unshift(top3);
          // Keep only 20
          historicalDraws = historicalDraws.slice(0, 20);
        }
      }
    } catch (err) {
      console.warn('GLO API failed, using history only:', err);
    }

    return NextResponse.json(historicalDraws);
  } catch (error) {
    console.error('Final fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
