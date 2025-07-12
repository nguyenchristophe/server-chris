import express from "express";
import { mintLicenseController } from "../controllers/fanLicenseController.js";
import { isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

router.post("/mint-license",isAuthenticated, mintLicenseController);

export default router;
