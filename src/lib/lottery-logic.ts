/**
 * Lottery Analysis Logic ported from C to TypeScript.
 */

export interface DigitFreq {
  digit: number;
  count: number;
}

/**
 * Calculates the frequency of each digit (0-9) in the historical draws.
 * Returns the digits sorted by frequency (ascending).
 */
export function getLeastFrequentDigits(historicalDraws: string[], count: number): string {
  const frequencies: DigitFreq[] = Array.from({ length: 10 }, (_, i) => ({
    digit: i,
    count: 0,
  }));

  historicalDraws.forEach((draw) => {
    draw.split('').forEach((char) => {
      const digit = parseInt(char, 10);
      if (!isNaN(digit)) {
        frequencies[digit].count++;
      }
    });
  });

  // Sort by frequency ascending (least frequent first)
  const sorted = [...frequencies].sort((a, b) => a.count - b.count);

  return sorted
    .slice(0, count)
    .map((f) => f.digit.toString())
    .join('');
}

/**
 * Generates all 3-digit permutations of the input digits without repetition.
 */
export function generateCombinations(digits: string): string[] {
  const result: string[] = [];
  const n = digits.length;

  if (n < 3) return [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        if (i !== j && i !== k && j !== k) {
          result.push(`${digits[i]}${digits[j]}${digits[k]}`);
        }
      }
    }
  }

  return result;
}

/**
 * Removes duplicate characters from a string of digits.
 */
export function getUniqueDigits(input: string): string {
  const seen = new Set<string>();
  let output = '';
  for (const char of input) {
    if (/\d/.test(char) && !seen.has(char)) {
      seen.add(char);
      output += char;
    }
  }
  return output;
}

/**
 * Investment Summary Interface
 */
export interface InvestmentSummary {
  totalCombinations: number;
  cost: number;
  payout: number;
  profit: number;
}

export function calculateInvestment(totalCombinations: number): InvestmentSummary {
  const cost = totalCombinations; // 1 THB per combination
  const payout = 900;
  return {
    totalCombinations,
    cost,
    payout,
    profit: payout - cost,
  };
}
