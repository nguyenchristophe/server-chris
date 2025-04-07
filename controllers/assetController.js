import { Asset } from "../models/asset.js";
import { asyncError } from "../middlewares/error.js";


// Création d’un nouvel asset
export const createAsset = asyncError(async (req, res, next) => {
  const { name, type, price, priceType, previewUrl } = req.body;

  // L'owner de l'asset = user authentifié
  const owner = req.user._id;

  if (!name) {
    return next(new ErrorHandler("Le nom de l'asset est requis", 400));
  }

  // Crée l’asset
  const asset = await Asset.create({
    name,
    type,
    owner,
    price,
    priceType,
    previewUrl,
  });

  res.status(201).json({
    success: true,
    message: "Asset créé avec succès",
    asset,
  });
});
export const getAllAssets = asyncError(async (req, res, next) => {
  const assets = await Asset.find({});
  res.status(200).json({ success: true, assets });
});


