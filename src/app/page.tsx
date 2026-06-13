'use client';

import React, { useState, useEffect } from 'react';
import { 
  getLeastFrequentDigits, 
  generateCombinations, 
  getUniqueDigits, 
  calculateInvestment,
  InvestmentSummary 
} from '@/lib/lottery-logic';

export default function Home() {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [inputDigits, setInputDigits] = useState('');
  const [autoCount, setAutoCount] = useState(6);
  const [historyRange, setHistoryRange] = useState(20);
  const [results, setResults] = useState<string[]>([]);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);
  const [historicalDraws, setHistoricalDraws] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDraws() {
      setLoading(true);
      try {
        const res = await fetch(`/api/draws?history=${historyRange}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setHistoricalDraws(data);
        }
      } catch (err) {
        console.error('Failed to load draws:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDraws();
  }, [historyRange]);

  const handleCalculate = () => {
    let digits = '';
    if (mode === 'auto') {
      if (historicalDraws.length === 0) {
        alert('❌ ไม่พบข้อมูลสถิติหวยในระบบ!');
        return;
      }
      digits = getLeastFrequentDigits(historicalDraws, autoCount);
      setInputDigits(digits);
    } else {
      digits = getUniqueDigits(inputDigits);
      setInputDigits(digits);
    }

    if (digits.length < 3) {
      alert('❌ กรุณาระบุตัวเลขที่ไม่ซ้ำกันอย่างน้อย 3 ตัวขึ้นไปนะคะ!');
      return;
    }

    const combs = generateCombinations(digits);
    setResults(combs);
    
    // Update summary based on either the limit or total available
    const finalSetCount = Math.min(combs.length, displayLimit);
    setSummary(calculateInvestment(finalSetCount));
  };

  // Recalculate summary if display limit changes
  useEffect(() => {
    if (results.length > 0) {
      const finalSetCount = Math.min(results.length, displayLimit);
      setSummary(calculateInvestment(finalSetCount));
    }
  }, [displayLimit, results.length]);

  const handleExport = () => {
    if (results.length === 0) {
      alert('⚠️ ไม่พบข้อมูลผลลัพธ์! กรุณากดปุ่มวิเคราะห์เลขก่อนนะคะ');
      return;
    }

    const exportedResults = results.slice(0, displayLimit);

    let report = "==================================================\n";
    report += "      รายงานผลการวิเคราะห์ระบบ Kitt-Lotto Web\n";
    report += "==================================================\n\n";
    
    if (summary) {
      report += `✨ นำเลข [${inputDigits}] จำนวน ${inputDigits.length} ตัวมาจัดเรียง\n`;
      report += `📊 เลือกใช้งานเลข 3 ตัวบนทั้งหมด: ${summary.totalCombinations} ชุด (จากทั้งหมดที่คำนวณได้ ${results.length} ชุด)\n`;
      report += `💰 ลงทุนชุดละ 1 บาท รวมเป็นเงิน: ${summary.cost} บาท\n`;
      report += `🏆 เงินรางวัลที่จะได้รับ (บาทละ 900): ${summary.payout} บาท\n`;
      report += `📈 ผลกำไรสุทธิที่จะได้รับ: ${summary.profit} บาท!\n\n`;
    }

    report += "--------------------------------------------------\n";
    report += `รายชื่อชุดตัวเลขย้อนหลัง ${historicalDraws.length} งวดจริงที่ระบบใช้คำนวณ:\n`;
    report += "--------------------------------------------------\n";
    historicalDraws.forEach((draw, i) => {
      report += `งวดที่ ${i + 1}: ${draw}\n`;
    });

    report += "\n--------------------------------------------------\n";
    report += `รายชื่อชุดตัวเลขที่เลือกแสดงผล (${exportedResults.length} ชุด):\n`;
    report += "--------------------------------------------------\n";
    
    for (let i = 0; i < exportedResults.length; i++) {
      report += exportedResults[i] + ( (i + 1) % 10 === 0 ? '\n' : '   ');
    }

    report += "\n\n==================================================\n";
    report += "💖 หากท่านชอบโปรแกรมนี้และอยากช่วยอุดหนุน สามารถโอนบริจาคได้ที่:\n";
    report += "   ธ.กสิกรณ์ไทย (K-bank)\n";
    report += "   เลขที่บัญชี : 029-3-27017-1\n";
    report += "   ชื่อบัญชี : Kittidet Lakthong\n";
    report += "🙏 ขอบพระคุณทุกการสนับสนุนและทุกน้ำใจมากๆ ค่ะ\n";
    report += "==================================================\n";

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kitt_lotto_report_web.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 text-gray-900">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Kitt-Lotto Analyzer Web</h1>
          <p className={`mt-2 text-sm font-medium ${historicalDraws.length > 0 ? 'text-green-600' : 'text-orange-500'}`}>
            {loading ? '⏳ กำลังโหลดข้อมูล...' : historicalDraws.length > 0 ? `🟢 Online: เชื่อมต่อฐานข้อมูลสำเร็จ (${historicalDraws.length} งวด)` : '🟡 Offline: ไม่พบสถิติหวย'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🔮 เลือกวิธีการทำงาน
          </h2>
          
          <div className="space-y-4">
            {/* Manual Mode */}
            <div className="flex items-center gap-3">
              <input 
                type="radio" 
                id="manual" 
                name="mode" 
                checked={mode === 'manual'} 
                onChange={() => setMode('manual')}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="manual" className="text-sm font-medium text-gray-700">ป้อนตัวเลขที่ชอบด้วยตนเอง:</label>
              <div className="flex-1">
                <input 
                  type="text" 
                  disabled={mode !== 'manual'}
                  value={inputDigits}
                  onChange={(e) => setInputDigits(e.target.value)}
                  placeholder="เช่น 024578"
                  className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                />
                {mode === 'manual' && inputDigits.length > 0 && inputDigits.length < 4 && (
                  <p className="text-[10px] text-orange-500 mt-1">💡 ใส่เลข 4 ตัวขึ้นไปเพื่อให้ได้ชุดเลขมากกว่า 20 ชุดนะคะ</p>
                )}
              </div>
            </div>

            {/* Auto Mode */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  id="auto" 
                  name="mode" 
                  checked={mode === 'auto'} 
                  onChange={() => setMode('auto')}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="auto" className="text-sm font-medium text-gray-700">ดึงเลขจากสถิติที่มาน้อยที่สุด:</label>
              </div>
              
              <div className="grid grid-cols-2 gap-4 ml-7">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">จำนวนตัวเลขที่ดึง</span>
                  <select 
                    disabled={mode !== 'auto'}
                    value={autoCount}
                    onChange={(e) => setAutoCount(parseInt(e.target.value))}
                    className="block w-full px-3 py-2 rounded-md border border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                  >
                    {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <option key={n} value={n}>{n} ตัว</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">วิเคราะห์ย้อนหลัง</span>
                  <select 
                    disabled={mode !== 'auto'}
                    value={historyRange}
                    onChange={(e) => setHistoryRange(parseInt(e.target.value))}
                    className="block w-full px-3 py-2 rounded-md border border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                  >
                    {[20, 40, 60].map(n => (
                      <option key={n} value={n}>{n} งวด</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button 
              onClick={handleCalculate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm"
            >
              🚀 เริ่มวิเคราะห์แปรผลเลข 3 ตัวบน
            </button>
            <button 
              onClick={handleExport}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-lg border border-gray-300 transition-colors shadow-sm"
            >
              📋 ออกรายงาน (Text)
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              📋 รายการชุดตัวเลขที่ระบบวิเคราะห์ได้
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">จำกัดการซื้อ:</span>
              <select 
                value={displayLimit}
                onChange={(e) => setDisplayLimit(parseInt(e.target.value))}
                className="block px-2 py-1 rounded-md border border-gray-300 bg-white text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {[5, 10, 20, 40, 60, 80, 100, 200, 500, 1000].map(n => (
                  <option key={n} value={n}>{n} ชุด</option>
                ))}
              </select>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 h-48 overflow-y-auto border border-gray-100 font-mono text-sm">
            {results.length > 0 ? (
              <>
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 text-center mb-4">
                  {results.slice(0, displayLimit).map((res, i) => (
                    <span key={i} className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{res}</span>
                  ))}
                </div>
                {results.length > displayLimit ? (
                  <p className="text-center text-xs text-orange-600 font-medium pb-2">
                    💡 ระบบตัดเหลือ {displayLimit} ชุดตามที่คุณเลือก (มีเลขทั้งหมด {results.length} ชุด)
                  </p>
                ) : results.length < displayLimit ? (
                  <p className="text-center text-xs text-blue-500 italic pb-2">
                    💡 แสดงครบทั้งหมด {results.length} ชุด (ยังไม่ถึงขีดจำกัด {displayLimit} ชุดที่คุณเลือก)
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-gray-400 text-center mt-16 italic">ไม่มีข้อมูลการวิเคราะห์</p>
            )}
          </div>
        </div>

        {/* Investment Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100">
          <h2 className="text-lg font-semibold mb-4 text-blue-900 flex items-center gap-2">
            💡 แผงวิเคราะห์สัดส่วนการลงทุนและการทำกำไร
          </h2>
          {summary ? (
            <div className="space-y-2 text-blue-800">
              <p>✨ นำเลข <span className="font-bold underline">[{inputDigits}]</span> จำนวน {inputDigits.length} ตัวมาจัดเรียง</p>
              <p>📊 จำนวนชุดที่เลือกซื้อ: <span className="font-bold text-lg">{summary.totalCombinations}</span> ชุด</p>
              <p>💰 ลงทุนชุดละ 1 บาท รวมเป็นเงิน: <span className="font-bold text-red-600">{summary.cost} บาท</span></p>
              <p>🏆 เงินรางวัลที่จะได้รับ (บาทละ 900): <span className="font-bold text-green-600">{summary.payout} บาท</span></p>
              <p className="text-lg mt-4 font-bold border-t border-blue-200 pt-2">📈 ผลกำไรสุทธิที่จะได้รับ: <span className="text-green-700">{summary.profit} บาท!</span></p>
            </div>
          ) : (
            <p className="text-blue-400 italic">รอการประมวลผลคำนวณสูตรหวย...</p>
          )}
        </div>

        {/* Donation */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-100">
          <h2 className="text-lg font-semibold mb-4 text-pink-700 flex items-center gap-2">
            💖 สนับสนุนค่าน้ำชานักพัฒนา (Donation)
          </h2>
          <div className="text-center space-y-2 text-gray-700">
            <p className="font-medium">หากท่านชอบโปรแกรมนี้และอยากช่วยอุดหนุนสามารถโอนบริจาคได้ที่</p>
            <div className="bg-pink-50 py-3 rounded-lg border border-pink-100">
              <p className="font-bold text-gray-900">🏦 ธ.กสิกรณ์ไทย (K-bank)</p>
              <p className="text-lg font-mono font-bold text-pink-600">029-3-27017-1</p>
              <p className="font-medium">👤 ชื่อบัญชี : Kittidet Lakthong</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
