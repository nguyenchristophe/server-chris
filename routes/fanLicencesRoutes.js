import express from "express";
import { mintLicense } from "../controllers/fanLicenseController.js";

const router = express.Router();

router.post("/mint-license", mintLicense);

export default router;
