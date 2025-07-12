// backend/routes/licenses.js
const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
require("dotenv").config();

const FAN_LICENSE_ABI = require("../abis/FanLicense.json");
const FAN_LICENSE_ADDRESS = process.env.FAN_LICENSE_ADDRESS;
const provider = new ethers.JsonRpcProvider("https://spicy-rpc.chiliz.com");
const contract = new ethers.Contract(FAN_LICENSE_ADDRESS, FAN_LICENSE_ABI, provider);

router.get("/:wallet", async (req, res) => {
  const wallet = req.params.wallet;
  try {
    const balance = await contract.balanceOf(wallet);
    const results = [];

    for (let i = 0; i < balance; i++) {
      const tokenId = await contract.tokenOfOwnerByIndex(wallet, i);
      const uri = await contract.tokenURI(tokenId);
      results.push({ tokenId: tokenId.toString(), uri });
    }

    res.json({ licenses: results });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la récupération des licences", error: e.message });
  }
});

module.exports = router;
