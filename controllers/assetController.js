import { Asset } from "../models/asset.js";
import { asyncError } from "../middlewares/error.js";

export const getAllAssets = asyncError(async (req, res, next) => {
  const assets = await Asset.find({});
  res.status(200).json({ success: true, assets });
});
