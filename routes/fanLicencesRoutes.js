import express from "express";
import { mintLicenseController } from "../controllers/fanLicenseController.js";

const router = express.Router();

router.post("/mint-license", mintLicenseController);

export default router;
