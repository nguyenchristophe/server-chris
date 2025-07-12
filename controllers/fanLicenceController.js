const { ethers } = require("ethers");
require("dotenv").config();

const FAN_LICENSE_ABI = require("../abis/FanLicense.json");
const FAN_LICENSE_ADDRESS = process.env.FAN_LICENSE_ADDRESS;

const provider = new ethers.JsonRpcProvider("https://spicy-rpc.chiliz.com");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(FAN_LICENSE_ADDRESS, FAN_LICENSE_ABI, wallet);

const LICENSE_URIS = { /* ... */ };
const LICENSE_ROLES = { /* ... */ };

exports.mintLicense = async (req, res) => {
  const { wallet: userAddress, plan } = req.body;
  const uri = LICENSE_URIS[plan];
  const role = LICENSE_ROLES[plan];

  if (!uri || role === undefined)
    return res.status(400).json({ message: "Plan invalide ou manquant" });

  try {
    const tx = await contract.mintLicense(userAddress, uri, role);
    await tx.wait();
    res.json({ message: "FanLicense mintée", txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ message: "Erreur de mint", error: err.message });
  }
};
