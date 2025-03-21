// routes/asset.js
import express from "express";
import { getAllAssets } from "../controllers/assetController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/all", isAuthenticated, getAllAssets);

export default router;
