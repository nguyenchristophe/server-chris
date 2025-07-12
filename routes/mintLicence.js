// backend/routes/mintLicense.js
const express = require("express");
const router = express.Router();
const { mintLicense } = require("../controllers/fanLicenseController");

router.post("/", mintLicense);

module.exports = router;
