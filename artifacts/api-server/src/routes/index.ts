import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tournamentRouter from "./tournament";
import scoresRouter from "./scores";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tournamentRouter);
router.use(scoresRouter);
router.use(adminRouter);

export default router;
