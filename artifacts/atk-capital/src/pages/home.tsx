import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Activity, ShieldCheck, Wallet, Bitcoin, BarChart3, FlaskConical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const INITIAL_BALANCE = 10250.0;
const INITIAL_PNL = 1130.5;

const POLL_MS = 5000;

// Live BTC/USDT market data is proxied server-side through our own API
// (artifacts/api-server) to Binance Testnet's public endpoints, avoiding
// browser CORS restrictions. No API key is used and no order-placement
// endpoints are called — only public ticker/kline reads — so no real
// trading or real funds are ever involved.
const API_BASE = `${import.meta.env.BASE_URL}api`;

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  range: [number, number];
}

function formatUsd(value: number) {
  const [whole, cents] = Math.abs(value).toFixed(2).split('.');
  const wholeFormatted = Number(whole).toLocaleString('en-US');
  return { whole: wholeFormatted, cents };
}

function candleFromKline(k: any[]): Candle {
  const time = k[0];
  const open = Number(k[1]);
  const high = Number(k[2]);
  const low = Number(k[3]);
  const close = Number(k[4]);
  return { time, open, high, low, close, range: [low, high] };
}

type ConnectionStatus = 'connecting' | 'live' | 'error';

function useBtcTicker() {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState(0);
  const [changePct, setChangePct] = useState(0);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const [tickerRes, klinesRes] = await Promise.all([
          fetch(`${API_BASE}/binance-testnet/ticker`),
          fetch(`${API_BASE}/binance-testnet/klines`),
        ]);
        if (!tickerRes.ok || !klinesRes.ok) throw new Error('Testnet request failed');
        const ticker = await tickerRes.json();
        const klines = await klinesRes.json();
        if (cancelled) return;

        setPrice(Number(ticker.lastPrice));
        setChange(Number(ticker.priceChange));
        setChangePct(Number(ticker.priceChangePercent));
        setCandles(klines.map(candleFromKline));
        setStatus('live');
      } catch (err) {
        if (!cancelled) setStatus('error');
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { price, change, changePct, candles, status };
}

function CandleShape(props: any) {
  // x/y/height come from Recharts scaling the "range" dataKey ([low, high]),
  // so y = pixel for `high` and y+height = pixel for `low`. Derive open/close
  // pixel positions by interpolating within that known, always-valid range.
  const { x, y, width, height, payload } = props;
  const { open, close, high, low } = payload as Candle;
  const valueRange = high - low || 0.01;
  const scale = height / valueRange;
  const openY = y + (high - open) * scale;
  const closeY = y + (high - close) * scale;
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);
  const isUp = close >= open;
  const color = isUp ? '#34d399' : '#f87171';
  const cx = x + width / 2;

  return (
    <g>
      <line x1={cx} x2={cx} y1={y} y2={y + height} stroke={color} strokeWidth={1} />
      <rect x={x} y={bodyTop} width={width} height={bodyHeight} fill={color} rx={1} />
    </g>
  );
}

export default function Home() {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const pnl = INITIAL_PNL;
  const [btcHoldings, setBtcHoldings] = useState(0);
  const [amountInput, setAmountInput] = useState('');
  const { price: livePrice, change: btcChange, changePct: btcChangePct, candles, status } = useBtcTicker();
  const btcPrice = livePrice ?? 0;
  // Require both a price and a currently-healthy connection: if polling
  // starts failing after an initial success, stale data must not be
  // tradeable against.
  const priceReady = livePrice !== null && status === 'live';
  const btcUp = btcChange >= 0;
  const totalBalance = balance + btcHoldings * btcPrice;

  const parsedAmount = Number(amountInput);
  const isValidAmount = amountInput.trim() !== '' && Number.isFinite(parsedAmount) && parsedAmount > 0;

  const handleBuy = () => {
    if (!priceReady) {
      toast({
        title: 'Waiting for live testnet price',
        className: 'bg-[#0B1F3A] border border-red-500/40 text-white',
      });
      return;
    }
    if (!isValidAmount) {
      toast({
        title: 'Enter a valid USDT amount',
        className: 'bg-[#0B1F3A] border border-red-500/40 text-white',
      });
      return;
    }
    if (parsedAmount > balance) {
      toast({
        title: 'Insufficient USDT balance',
        description: `Available: ${formatUsd(balance).whole}.${formatUsd(balance).cents}`,
        className: 'bg-[#0B1F3A] border border-red-500/40 text-white',
      });
      return;
    }
    const btcBought = parsedAmount / btcPrice;
    setBalance((prev) => prev - parsedAmount);
    setBtcHoldings((prev) => prev + btcBought);
    toast({
      title: 'Buy Order Filled',
      description: `Bought ${btcBought.toFixed(6)} BTC for ${parsedAmount.toFixed(2)}.`,
      className: 'bg-[#0B1F3A] border border-emerald-500/40 text-white',
    });
    setAmountInput('');
  };

  const handleSell = () => {
    if (!priceReady) {
      toast({
        title: 'Waiting for live testnet price',
        className: 'bg-[#0B1F3A] border border-red-500/40 text-white',
      });
      return;
    }
    if (!isValidAmount) {
      toast({
        title: 'Enter a valid USDT amount',
        className: 'bg-[#0B1F3A] border border-red-500/40 text-white',
      });
      return;
    }
    const btcNeeded = parsedAmount / btcPrice;
    if (btcNeeded > btcHoldings) {
      toast({
        title: 'Insufficient BTC holdings',
        description: `Available: ${btcHoldings.toFixed(6)} BTC`,
        className: 'bg-[#0B1F3A] border border-red-500/40 text-white',
      });
      return;
    }
    setBalance((prev) => prev + parsedAmount);
    setBtcHoldings((prev) => {
      const next = prev - btcNeeded;
      return Math.abs(next) < 1e-9 ? 0 : next;
    });
    toast({
      title: 'Sell Order Filled',
      description: `Sold ${btcNeeded.toFixed(6)} BTC for ${parsedAmount.toFixed(2)}.`,
      className: 'bg-[#0B1F3A] border border-emerald-500/40 text-white',
    });
    setAmountInput('');
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
            <span
              className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              data-testid="badge-testnet-mode"
              title="Connected to Binance Testnet — market data is real, funds are simulated. No real money is used."
            >
              <FlaskConical className="w-3 h-3" />
              Testnet Mode
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400" data-testid="text-connection-status">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'live'
                    ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : status === 'error'
                    ? 'bg-red-500'
                    : 'bg-amber-500 animate-pulse'
                }`}
              ></span>
              {status === 'live' ? 'BINANCE TESTNET.LIVE' : status === 'error' ? 'TESTNET.OFFLINE' : 'CONNECTING...'}
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
          {priceReady ? (
            <>
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
            </>
          ) : (
            <span className="text-slate-500" data-testid="text-btc-price">
              {status === 'error' ? 'Unable to reach Binance Testnet' : 'Connecting to Binance Testnet…'}
            </span>
          )}
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
                ${formatUsd(totalBalance).whole}<span className="text-slate-500">.{formatUsd(totalBalance).cents}</span>
              </div>
              <div className="text-xs font-mono text-slate-500 mt-2">
                USDT + BTC × price
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

        {/* Holdings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-5 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center shrink-0">
              <Bitcoin className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-0.5">Holdings: BTC</div>
              <div className="text-lg font-mono text-white" data-testid="text-btc-holdings">
                {btcHoldings.toFixed(6)} BTC
              </div>
            </div>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-5 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-0.5">Holdings: USDT</div>
              <div className="text-lg font-mono text-white" data-testid="text-usdt-holdings">
                ${formatUsd(balance).whole}.{formatUsd(balance).cents}
              </div>
            </div>
          </div>
        </div>

        {/* Candlestick Chart */}
        <section className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5 text-[#FFD700]" />
              BTC/USDT Chart
            </h2>
            {priceReady && (
              <span
                className={`flex items-center gap-1 text-sm font-mono font-medium ${btcUp ? 'text-emerald-400' : 'text-red-400'}`}
                data-testid="text-chart-price"
              >
                {btcUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="h-56 sm:h-64" data-testid="chart-btc-candlestick">
              {status === 'live' && candles.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={candles} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                    <XAxis dataKey="time" hide />
                    <YAxis
                      domain={[
                        (dataMin: number) => Math.floor(dataMin - 50),
                        (dataMax: number) => Math.ceil(dataMax + 50),
                      ]}
                      hide
                    />
                    <Bar dataKey="range" shape={CandleShape} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-slate-500 font-mono">
                  {status === 'error' ? 'Unable to load testnet chart data' : 'Loading testnet chart data…'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Buy / Sell BTC */}
        <section className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2 text-white">
              <Bitcoin className="w-5 h-5 text-[#FFD700]" />
              Trade BTC/USDT
            </h2>
          </div>

          <div className="bg-slate-900/60 border border-[#FFD700]/20 rounded-2xl p-1 shadow-[0_0_20px_rgba(255,215,0,0.05)] relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.1)]">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="bg-slate-900/80 rounded-xl p-5 sm:p-6 relative z-10 backdrop-blur-sm flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-mono text-slate-400">
                <span>Market Price</span>
                <span className="text-white font-semibold">
                  {priceReady
                    ? `${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '—'}
                </span>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 -mt-2">
                Simulated funds only — orders execute against Binance Testnet price data, no real assets move.
              </div>

              <div>
                <label htmlFor="usdt-amount" className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                  USDT Amount
                </label>
                <div className="relative">
                  <input
                    id="usdt-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    data-testid="input-usdt-amount"
                    className="w-full bg-black/30 border border-white/10 focus:border-[#FFD700]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 rounded-lg px-4 py-3 font-mono text-lg text-white placeholder:text-slate-600 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 uppercase tracking-wider">
                    USDT
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <button
                  onClick={handleSell}
                  disabled={!priceReady}
                  className="flex-1 px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  data-testid="button-sell"
                >
                  SELL BTC
                </button>
                <button
                  onClick={handleBuy}
                  disabled={!priceReady}
                  className="flex-1 px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 bg-[#FFD700] text-[#0B1F3A] hover:bg-[#FFE55C] hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] shadow-[0_0_10px_rgba(255,215,0,0.2)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  data-testid="button-buy"
                >
                  BUY BTC
                </button>
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