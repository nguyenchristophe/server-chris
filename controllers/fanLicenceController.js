import { ethers } from "ethers";

import fs from "fs";
const FanLicenseABI = JSON.parse(fs.readFileSync("./abis/FanLicense.json", "utf8"));


const provider = new ethers.JsonRpcProvider("https://spicy-rpc.chiliz.com");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, FanLicenseABI, wallet);

export const mintLicense = async (req, res) => {
  const { wallet: userWallet, plan } = req.body;

  if (!userWallet || !plan) {
    return res.status(400).json({ error: "Missing wallet or plan" });
  }

  try {
    const tx = await contract.mintLicense(userWallet, plan);
    await tx.wait();
    return res.status(200).json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error("Mint failed", error);
    return res.status(500).json({ error: "Mint failed", details: error.message });
  }
};
