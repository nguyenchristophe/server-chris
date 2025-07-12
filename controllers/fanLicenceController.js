// backend/controllers/fanLicenseController.js
const { ethers } = require("ethers");
require("dotenv").config();

const FAN_LICENSE_ABI = require("../abis/FanLicense.json");
const FAN_LICENSE_ADDRESS = process.env.FAN_LICENSE_ADDRESS;

const provider = new ethers.JsonRpcProvider("https://spicy-rpc.chiliz.com");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(FAN_LICENSE_ADDRESS, FAN_LICENSE_ABI, wallet);

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

exports.mintLicense = async (req, res) => {
  const { wallet: userAddress, plan } = req.body;

  const uri = LICENSE_URIS[plan];
  const role = LICENSE_ROLES[plan];

  if (!uri || role === undefined)
    return res.status(400).json({ message: "Plan invalide ou manquant" });

  try {
    const tx = await contract.mintLicense(userAddress, uri, role);
    await tx.wait();
    res.json({ message: FanLicense '${plan}' mintée avec succès !, txHash: tx.hash });
  } catch (err) {
    console.error("Erreur de mint:", err);
    res.status(500).json({ message: "Erreur lors du mint", error: err.message });
  }
};
