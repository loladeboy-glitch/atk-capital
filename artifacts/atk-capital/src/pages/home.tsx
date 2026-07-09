import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Activity, Clock, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const INITIAL_BALANCE = 10250.0;
const INITIAL_PNL = 1130.5;
const TRADE_GAIN = 50.0;

const BTC_MIN = 67000;
const BTC_MAX = 69000;
const BTC_OPEN_24H = 67850;

function formatUsd(value: number) {
  const [whole, cents] = Math.abs(value).toFixed(2).split('.');
  const wholeFormatted = Number(whole).toLocaleString('en-US');
  return { whole: wholeFormatted, cents };
}

function useBtcTicker() {
  const [price, setPrice] = useState(
    () => BTC_MIN + Math.random() * (BTC_MAX - BTC_MIN),
  );
  const priceRef = useRef(price);
  priceRef.current = price;

  useEffect(() => {
    const id = setInterval(() => {
      setPrice((prev) => {
        const move = (Math.random() - 0.5) * 400;
        const next = prev + move;
        return Math.min(BTC_MAX, Math.max(BTC_MIN, next));
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const change = price - BTC_OPEN_24H;
  const changePct = (change / BTC_OPEN_24H) * 100;

  return { price, change, changePct };
}

export default function Home() {
  const [tradeStatus, setTradeStatus] = useState<'pending' | 'settling' | 'accepted' | 'declined'>('pending');
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [pnl, setPnl] = useState(INITIAL_PNL);
  const { price: btcPrice, change: btcChange, changePct: btcChangePct } = useBtcTicker();
  const btcUp = btcChange >= 0;

  const handleTrade = () => {
    if (tradeStatus !== 'pending') return;
    setTradeStatus('settling');
    const t = toast({
      title: 'Placing Order...',
      description: 'Routing SpaceX Series G Secondary to execution desk.',
      className: 'bg-[#0B1F3A] border border-[#FFD700]/30 text-white',
    });
    setTimeout(() => {
      setTradeStatus('accepted');
      setBalance((prev) => prev + TRADE_GAIN);
      setPnl((prev) => prev + TRADE_GAIN);
      t.update({
        id: t.id,
        open: true,
        title: 'Order Filled: +$50.00',
        description: 'Trade executed and settled.',
        className: 'bg-[#0B1F3A] border border-emerald-500/40 text-white',
      });
    }, 1200);
  };

  const handleDecline = () => {
    if (tradeStatus !== 'pending') return;
    setTradeStatus('declined');
    toast({
      title: 'Trade Declined',
      description: 'The proposed order was rejected.',
      className: 'bg-[#0B1F3A] border border-[#FFD700]/30 text-white',
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[#0B1F3A] text-slate-50 font-sans flex flex-col selection:bg-[#FFD700]/30 selection:text-[#FFD700]">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 bg-[#0B1F3A]/80 backdrop-blur-md z-10">
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#FFD700] flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.2)]">
              <span className="text-[#0B1F3A] font-bold font-mono text-sm tracking-tighter">ATK</span>
            </div>
            <span className="font-semibold tracking-wide text-lg text-white">ATK Capital</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              SYS.ONLINE
            </div>
            <div className="w-9 h-9 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center overflow-hidden">
              <span className="text-[#FFD700] font-mono text-sm font-bold">JW</span>
            </div>
          </div>
        </div>

        {/* BTC/USDT Live Ticker */}
        <div className="px-6 pb-3 flex items-center gap-3 text-xs sm:text-sm font-mono">
          <span className="flex items-center gap-1.5 text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse"></span>
            BTC/USDT
          </span>
          <span className="text-white font-semibold" data-testid="text-btc-price">
            ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span
            className={`flex items-center gap-1 font-medium ${btcUp ? 'text-emerald-400' : 'text-red-400'}`}
            data-testid="text-btc-change"
          >
            {btcUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {btcUp ? '+' : ''}
            {btcChange.toFixed(2)} ({btcUp ? '+' : ''}
            {btcChangePct.toFixed(2)}%)
          </span>
          <span className="hidden sm:inline text-slate-500 text-[10px] uppercase tracking-wider">24h</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        
        {/* Top Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Balance Card */}
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent">
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col justify-between border border-white/5 shadow-xl">
              <div className="flex items-center gap-2 text-slate-400 mb-4">
                <Activity className="w-4 h-4 text-[#FFD700]" />
                <span className="text-sm font-medium uppercase tracking-wider">Total Balance</span>
              </div>
              <div className="text-4xl sm:text-5xl font-mono font-light tracking-tight text-white" data-testid="text-total-balance">
                ${formatUsd(balance).whole}<span className="text-slate-500">.{formatUsd(balance).cents}</span>
              </div>
            </div>
          </div>

          {/* P&L Card */}
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-emerald-500/20 to-transparent">
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col justify-between border border-white/5 shadow-xl">
              <div className="flex items-center gap-2 text-slate-400 mb-4">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium uppercase tracking-wider">Today's P&L</span>
              </div>
              <div className="text-4xl sm:text-5xl font-mono font-medium text-emerald-400 tracking-tight drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]" data-testid="text-pnl">
                +${formatUsd(pnl).whole}<span className="text-emerald-400/60">.{formatUsd(pnl).cents}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Required / Proposed Trade */}
        <section className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2 text-white">
              <Clock className="w-5 h-5 text-[#FFD700]" />
              Pending Settlement
            </h2>
          </div>
          
          <div className="bg-slate-900/60 border border-[#FFD700]/20 rounded-2xl p-1 shadow-[0_0_20px_rgba(255,215,0,0.05)] relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.1)]">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="bg-slate-900/80 rounded-xl p-5 sm:p-6 relative z-10 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20">Private Block</span>
                    <span className="text-xs font-mono text-slate-400">ID: TRD-8829-X</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">SpaceX Series G Secondary</h3>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="uppercase text-[10px] tracking-wider opacity-70">Volume</span>
                      <span className="text-white">150 Shares</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="uppercase text-[10px] tracking-wider opacity-70">Price</span>
                      <span className="text-white">$82.00 / sh</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="uppercase text-[10px] tracking-wider opacity-70">Notional</span>
                      <span className="text-white">$12,300.00</span>
                    </div>
                  </div>
                </div>

                {tradeStatus === 'pending' ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={handleDecline}
                      className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300 hover:text-white"
                      data-testid="button-decline"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={handleTrade}
                      className="px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 bg-[#FFD700] text-[#0B1F3A] hover:bg-[#FFE55C] hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] shadow-[0_0_10px_rgba(255,215,0,0.2)] flex items-center justify-center gap-2"
                      data-testid="button-trade"
                    >
                      Trade <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : tradeStatus === 'settling' ? (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-[#FFD700] font-medium px-6 py-3 bg-[#FFD700]/10 rounded-lg border border-[#FFD700]/20 w-full sm:w-auto">
                    <Clock className="w-5 h-5 animate-pulse" />
                    Placing Order...
                  </div>
                ) : tradeStatus === 'accepted' ? (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 font-medium px-6 py-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 w-full sm:w-auto">
                    <CheckCircle2 className="w-5 h-5" />
                    Trade Executed
                  </div>
                ) : (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 font-medium px-6 py-3 bg-white/5 rounded-lg border border-white/10 w-full sm:w-auto">
                    <XCircle className="w-5 h-5" />
                    Trade Declined
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Table */}
        <section className="mt-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 text-slate-400" />
              Active Positions
            </h2>
          </div>
          
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-wider text-slate-400 bg-black/20">
                    <th className="px-6 py-4 font-medium">Asset</th>
                    <th className="px-6 py-4 font-medium text-right">Qty</th>
                    <th className="px-6 py-4 font-medium text-right">Avg Price</th>
                    <th className="px-6 py-4 font-medium text-right">Market Value</th>
                    <th className="px-6 py-4 font-medium text-right">Return</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-mono divide-y divide-white/5">
                  <tr className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-sans font-bold text-xs text-white group-hover:bg-white/20 transition-colors">AI</div>
                        <div>
                          <div className="font-medium text-white font-sans tracking-wide">OpenAI Structured Note</div>
                          <div className="text-xs text-slate-500">Series B-1</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300">250</td>
                    <td className="px-6 py-4 text-right text-slate-300">$45.00</td>
                    <td className="px-6 py-4 text-right text-white font-medium">$11,250.00</td>
                    <td className="px-6 py-4 text-right text-emerald-400 flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3" /> +12.5%
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-sans font-bold text-xs text-white group-hover:bg-white/20 transition-colors">DOD</div>
                        <div>
                          <div className="font-medium text-white font-sans tracking-wide">Anduril Industries</div>
                          <div className="text-xs text-slate-500">Common</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300">100</td>
                    <td className="px-6 py-4 text-right text-slate-300">$22.50</td>
                    <td className="px-6 py-4 text-right text-white font-medium">$2,250.00</td>
                    <td className="px-6 py-4 text-right text-emerald-400 flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3" /> +4.2%
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-sans font-bold text-xs text-white group-hover:bg-white/20 transition-colors">STR</div>
                        <div>
                          <div className="font-medium text-white font-sans tracking-wide">Stripe Secondary</div>
                          <div className="text-xs text-slate-500">Preferred</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300">50</td>
                    <td className="px-6 py-4 text-right text-slate-300">$65.00</td>
                    <td className="px-6 py-4 text-right text-white font-medium">$3,250.00</td>
                    <td className="px-6 py-4 text-right text-red-400 flex items-center justify-end gap-1">
                      <TrendingDown className="w-3 h-3" /> -2.1%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}