import express from "express";
import { getOverallStat } from "../controllers/sales.js";

const router = express.Router();

router.get("/sales", getOverallStat);

export default router;
