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
export const getMyAssets = asyncError(async (req, res, next) => {
  const assets = await Asset.find({ owner: req.user._id });
  res.status(200).json({ success: true, assets });
});

// controllers/assetController.js
export const updateAsset = asyncError(async (req, res, next) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return next(new ErrorHandler("Asset introuvable", 404));

  // Vérifier ownership
  if (asset.owner.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Accès refusé.", 403));
  }

  const { name, price, priceType, type, previewUrl } = req.body;
  if (name) asset.name = name;
  if (price) asset.price = price;
  if (priceType) asset.priceType = priceType;
  if (type) asset.type = type;
  if (previewUrl) asset.previewUrl = previewUrl;

  await asset.save();

  res.json({ success: true, message: "Asset modifié" });
});

export const deleteAsset = asyncError(async (req, res, next) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return next(new ErrorHandler("Asset introuvable", 404));

  if (asset.owner.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Accès refusé.", 403));
  }
  await asset.remove();

  res.json({ success: true, message: "Asset supprimé" });
});


