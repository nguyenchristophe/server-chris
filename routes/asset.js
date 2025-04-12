// routes/asset.js
import express from "express";
import { getAllAssets } from "../controllers/assetController.js";
import { createAsset } from "../controllers/assetController.js";
import {getMyAssets } from "../controllers/assetController.js";
import { updateAsset } from "../controllers/assetController.js";
import { deleteAsset } from "../controllers/assetController.js";

import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/all", isAuthenticated, getAllAssets);
// Création d’un asset
router.post("/new", isAuthenticated, createAsset);
// routes/asset.js
router.get("/my-assets", isAuthenticated, getMyAssets); 

// routes/asset.js
router.put("/:id", isAuthenticated, updateAsset);
router.delete("/:id", isAuthenticated, deleteAsset);



export default router;
