// backend/routes/mintLicense.js

const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
require("dotenv").config();

const FAN_LICENSE_ABI = require("../abis/FanLicense.json"); // Chemin vers l'ABI du contrat FanLicense
const FAN_LICENSE_ADDRESS = process.env.FAN_LICENSE_ADDRESS;

// Configuration RPC Chiliz SPICY Testnet (mise à jour)
const provider = new ethers.JsonRpcProvider("https://spicy-rpc.chiliz.com");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(FAN_LICENSE_ADDRESS, FAN_LICENSE_ABI, wallet);

// URI des métadonnées NFT (exemples à adapter)
const LICENSE_URIS = {
  neutral: "ipfs://Qm.../neutral.json",
  visionnaire: "ipfs://Qm.../visionnaire.json",
  createur: "ipfs://Qm.../createur.json",
  innovateur: "ipfs://Qm.../innovateur.json",
  externes_basic: "ipfs://Qm.../externes_basic.json",
  externes_semi_basic: "ipfs://Qm.../externes_semi_basic.json",
  externes_must: "ipfs://Qm.../externes_must.json",
  must_innovateurs: "ipfs://Qm.../must_innovateurs.json",
};

// Mappage des rôles numériques si requis
const LICENSE_ROLES = {
  neutral: 0,
  visionnaire: 1,
  createur: 2,
  innovateur: 3,
  externes_basic: 4,
  externes_semi_basic: 5,
  externes_must: 6,
  must_innovateurs: 7,
};

router.post("/", async (req, res) => {
  const { wallet: userAddress, plan } = req.body;

  const uri = LICENSE_URIS[plan];
  const role = LICENSE_ROLES[plan];

  if (!uri || role === undefined)
    return res.status(400).json({ message: "Plan invalide" });

  try {
    const tx = await contract.mintLicense(userAddress, uri, role);
    await tx.wait();
    return res.json({ message: "FanLicense NFT minted successfully!" });
  } catch (err) {
    console.error("Mint error:", err);
    return res.status(500).json({ message: "Minting failed", error: err.message });
  }
});

module.exports = router;
