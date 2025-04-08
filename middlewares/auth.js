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
