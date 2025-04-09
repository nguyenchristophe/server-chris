import { asyncError } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/error.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";
import { Category } from "../models/category.js";

import { Asset } from "../models/asset.js";

export const getAllProducts = asyncError(async (req, res, next) => {
  const { keyword, category } = req.query;

  const products = await Product.find({
    name: {
      $regex: keyword ? keyword : "",
      $options: "i",
    },
    category: category ? category : undefined,
  }).populate("owner");

  res.status(200).json({
    success: true,
    products,
  });
});
export const getAdminProducts = asyncError(async (req, res, next) => {
  const products = await Product.find({}).populate("category");

  const outOfStock = products.filter((i) => i.stock === 0);

  res.status(200).json({
    success: true,
    products,
    outOfStock: outOfStock.length,
    inStock: products.length - outOfStock.length,
  });
});

export const getProductDetails = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) return next(new ErrorHandler("Produit non trouvé", 404));

  res.status(200).json({
    success: true,
    product,
  });
});



export const createProduct = asyncError(async (req, res, next) => {
  const { name, description, category, price, stock } = req.body;

  if (!req.file) return next(new ErrorHandler("Veuillez ajouter une image", 400));

  const file = getDataUri(req.file);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await Product.create({
    owner: req.user._id,    
    name,
    description,
    category,
    price,
    stock,
    images: [image],
  });

  res.status(200).json({
    success: true,
    message: "Votre poème vient d'être creé",
  });
});

export const updateProduct = asyncError(async (req, res, next) => {
  const { name, description, category, price, stock } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Produit non trouvé", 404));

  if (name) product.name = name;
  if (description) product.description = description;
  if (category) product.category = category;
  if (price) product.price = price;
  if (stock) product.stock = stock;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Produit mis à jour avec succès",
  });
});

export const addProductImage = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Produit non trouvé", 404));

  if (!req.file) return next(new ErrorHandler("Veuillez ajouter l'image", 400));

  const file = getDataUri(req.file);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  product.images.push(image);
  await product.save();

  res.status(200).json({
    success: true,
    message: "Image ajoutée avec succès",
  });
});

export const voteProduct = asyncError(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  console.log(`📌 Utilisateur: ${userId} vote pour le produit: ${id}`);

  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Produit non trouvé", 404));

  const hasVoted = product.votes.some(vote => vote.user.toString() === userId.toString());

  if (hasVoted) {
    console.log("⚠️ Déjà voté !");
    return next(new ErrorHandler("Vous avez déjà voté pour ce poème.", 400));
  }

  // Ajout du vote
  product.votes.push({ user: userId });
  product.voteCount += 1;
  await product.save();

  console.log(`✅ Vote ajouté avec succès ! Nouveau nombre de votes: ${product.voteCount}`);

  res.status(200).json({
    success: true,
    message: "Votre vote a été enregistré.",
    voteCount: product.voteCount,
  });
});

export const likeProduct = asyncError(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  console.log(`📌 Utilisateur: ${userId} like le produit: ${id}`);

  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Produit non trouvé", 404));

  const hasLiked = product.likes.some(like => like.user.toString() === userId.toString());

  if (hasLiked) {
    console.log("⚠️ Déjà liké ! Suppression du like...");
    product.likes = product.likes.filter(like => like.user.toString() !== userId.toString());
    product.likeCount -= 1;
  } else {
    console.log("✅ Like ajouté !");
    product.likes.push({ user: userId });
    product.likeCount += 1;
  }

  await product.save();

  console.log(`📊 Nouveau nombre de likes: ${product.likeCount}`);

  res.status(200).json({
    success: true,
    message: "Votre like a été mis à jour.",
    likeCount: product.likeCount,
  });
});




export const deleteProductImage = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Produit pas trouvé", 404));

  const id = req.query.id;

  if (!id) return next(new ErrorHandler("Veuillez indiquer l'identifiant de l'image", 400));

  let isExist = -1;

  product.images.forEach((item, index) => {
    if (item._id.toString() === id.toString()) isExist = index;
  });

  if (isExist < 0) return next(new ErrorHandler("L'image n'existe pas", 400));

  await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);

  product.images.splice(isExist, 1);

  await product.save();

  res.status(200).json({
    success: true,
    message: "Image supprimée avec succès",
  });
});

export const deleteProduct = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Produit pas trouvé", 404));

  for (let index = 0; index < product.images.length; index++) {
    await cloudinary.v2.uploader.destroy(product.images[index].public_id);
  }
  await product.remove();
  res.status(200).json({
    success: true,
    message: "Produit supprimé avec succès",
  });
});

export const addCategory = asyncError(async (req, res, next) => {
  await Category.create(req.body);

  res.status(201).json({
    success: true,
    message: "La catégorie a été ajoutée avec succès",
  });
});

export const getAllCategories = asyncError(async (req, res, next) => {
  const categories = await Category.find({});

  res.status(200).json({
    success: true,
    categories,
  });
});

export const deleteCategory = asyncError(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorHandler("Category Not Found", 404));
  const products = await Product.find({ category: category._id });

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    product.category = undefined;
    await product.save();
  }

  await category.remove();

  

  res.status(200).json({
    success: true,
    message: "Catégorie supprimée avec succès",
  });
});

export const addAssetToProduct = asyncError(async (req, res, next) => {
  const productId = req.params.id;
  const { assetId } = req.body;  // L’asset qu’on veut attacher

  const product = await Product.findById(productId);
  if (!product) return next(new ErrorHandler("Poème/Produit introuvable", 404));

  const asset = await Asset.findById(assetId);
  if (!asset) return next(new ErrorHandler("Asset introuvable", 404));

  // Calcul du surcoût si besoin
  let extraCost = 0;
  if (asset.priceType === "fix") {
    extraCost = asset.price;
  } else if (asset.priceType === "percent") {
    // Ex: +10 % du prix du poème
    extraCost = (product.price * asset.price) / 100;
  }

  // On stocke l'asset avec extraCost
  product.assetsSelected.push({
    asset: asset._id,
    extraCost,
  });

  await product.save();

  res.status(200).json({
    success: true,
    message: "Asset ajouté au poème avec succès",
    assetsSelected: product.assetsSelected,
  });
});

export const rentPoem = asyncError(async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(productId).populate("assetsSelected.asset");

  if (!product) return next(new ErrorHandler("Poème introuvable", 404));

  // Calcule le prix total
  let totalPrice = product.price;
  for (const item of product.assetsSelected) {
    totalPrice += item.extraCost;
  }

  // Ici, tu peux lancer un paiement Stripe, PayPal...
  // Ex: const paymentIntent = await stripe.paymentIntents.create({ ... totalPrice... })
  // ---- Étape de paiement (Stripe, PayPal, etc.) ----
  // Ici vous pouvez lancer un paiement par ex. Stripe:
  // const paymentIntent = await stripe.paymentIntents.create({...})
  // ou tout autre service.

  // Une fois que le paiement est validé, on peut marquer la location comme effectuée,
  // et effectuer le split des revenus entre owners.

  // Exemple: tout transite d’abord via le compte du Poète,
  // puis il reverse un pourcentage à chaque owner d’asset.

  res.status(200).json({
    success: true,
    message: `Poème loué. Prix total : ${totalPrice} €`,
  });
});

// controllers/product.js
export const getMyPoems = asyncError(async (req, res, next) => {
  const products = await Product.find({ owner: req.user._id });
  res.status(200).json({
    success: true,
    products,
  });
});
