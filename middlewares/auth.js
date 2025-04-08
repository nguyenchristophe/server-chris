import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import jwt from "jsonwebtoken";
import { asyncError } from "./error.js";

export const isAuthenticated = asyncError(async (req, res, next) => {
  // const token = req.cookies.token;

  const { token } = req.cookies;

  if (!token) return next(new ErrorHandler("Vous n'êtes pas encore connecté", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData._id);

  next();
});
export const isOwnerOrAdmin = async (req, res, next) => {
  const user = req.user; // l'utilisateur connecté
  const productId = req.params.id;

  // on retrouve le product
  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Poème introuvable" });
  }

  // Si admin -> OK
  if (user.role === "admin") return next();

  // Sinon, si l'utilisateur est owner du product -> OK
  if (product.owner.toString() === user._id.toString()) {
    return next();
  }

  // Sinon -> 403
  return res.status(403).json({
    success: false,
    message: "Accès refusé : vous n'êtes ni administrateur, ni propriétaire.",
  });
};

export const isAdmin = asyncError(async (req, res, next) => {
  if (req.user.role !== "admin")
    return next(new ErrorHandler("Seul l'administrateur est autorisé", 401));
  next();
});

export const isPoetOrAdmin = (req, res, next) => {
  // Soit l'utilisateur est admin
  if (req.user.role === "admin") return next();

  // Soit l'utilisateur a un subscription "createur" (ou visionnaire, etc.)
  // => Adaptez la logique selon votre besoin
  if (req.user.subscription === "createur") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Accès refusé : vous n'êtes ni administrateur ni poète.",
  });
};
