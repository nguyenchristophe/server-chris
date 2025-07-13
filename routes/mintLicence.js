import express from "express";
import { mintLicense } from "../controllers/fanLicenceController.js";
import { isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

router.post("/mintlicense",isAuthenticated,mintLicense);

export default router;
