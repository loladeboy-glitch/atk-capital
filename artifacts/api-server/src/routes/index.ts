import { Router, type IRouter } from "express";
import healthRouter from "./health";
import binanceTestnetRouter from "./binance-testnet";

const router: IRouter = Router();

router.use(healthRouter);
router.use(binanceTestnetRouter);

export default router;
