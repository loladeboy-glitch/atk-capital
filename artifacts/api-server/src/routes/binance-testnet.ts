import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Server-side proxy for Binance Testnet public market-data endpoints.
// We use the Binance Futures Testnet (testnet.binancefuture.com) because
// the Spot Testnet (testnet.binance.vision) returns HTTP 451 from this
// environment's network region. Both are Binance-operated sandbox
// environments with no real funds. Only public ticker/kline reads are
// used — no API key, and no order-placement endpoints are ever called —
// so no real trading or real money is involved.
const BINANCE_TESTNET_BASE = "https://testnet.binancefuture.com/fapi/v1";
const SYMBOL = "BTCUSDT";
const KLINE_INTERVAL = "1m";
const MAX_CANDLES = 24;

router.get("/binance-testnet/ticker", async (_req, res) => {
  try {
    const response = await fetch(
      `${BINANCE_TESTNET_BASE}/ticker/24hr?symbol=${SYMBOL}`,
    );
    if (!response.ok) {
      res.status(502).json({ error: "Binance Testnet ticker request failed" });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Unable to reach Binance Testnet" });
  }
});

router.get("/binance-testnet/klines", async (_req, res) => {
  try {
    const response = await fetch(
      `${BINANCE_TESTNET_BASE}/klines?symbol=${SYMBOL}&interval=${KLINE_INTERVAL}&limit=${MAX_CANDLES}`,
    );
    if (!response.ok) {
      res.status(502).json({ error: "Binance Testnet klines request failed" });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Unable to reach Binance Testnet" });
  }
});

export default router;
