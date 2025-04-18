// routes/asset.js
import express from "express";
import { getAllAssets } from "../controllers/assetController.js";
import { createAsset } from "../controllers/assetController.js";
import {getMyAssets } from "../controllers/assetController.js";
import { updateAsset } from "../controllers/assetController.js";
import { deleteAsset } from "../controllers/assetController.js";

import { isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/all", isAuthenticated, getAllAssets);
// Création d’un asset
//router.post("/new", isAuthenticated, createAsset);
router.post("/new", isAuthenticated, singleUpload, createAsset);

// routes/asset.js
router.get("/my-assets", isAuthenticated, getMyAssets); 

// routes/asset.js
router.put("/:id", isAuthenticated, singleUpload , updateAsset);
router.delete("/:id", isAuthenticated, deleteAsset);



export default router;
