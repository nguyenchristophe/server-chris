const express = require("express");
const router = express.Router();
const { mintLicense } = require("../controllers/fanLicenseController");

router.post("/mint-license", mintLicense);

module.exports = router;
