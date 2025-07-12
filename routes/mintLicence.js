import express from "express";
import { mintLicenceController } from "../controllers/fanLicenceController.js";
import { isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

router.post("/mint-license",isAuthenticated, mintLicenceController);

export default router;
