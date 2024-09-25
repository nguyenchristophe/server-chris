import { asyncError } from "../middlewares/error.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import {
  cookieOptions,
  getDataUri,
  sendEmail,
  sendToken,
} from "../utils/features.js";
import cloudinary from "cloudinary";

// Login user
export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Email ou mot de passe incorrect", 400));
  }

  if (!password) return next(new ErrorHandler("Veuillez saisir votre mot de passe", 400));

  const isMatched = await user.comparePassword(password);

  if (!isMatched) {
    return next(new ErrorHandler("Email ou mot de passe incorrect", 400));
  }

  sendToken(user, res, `Bienvenue, ${user.name}`, 200);
});

// Sign up user
export const signup = asyncError(async (req, res, next) => {
  const { name, email, password, address, city, country, pinCode } = req.body;

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("Cet utilisateur existe déjà", 400));

  let avatar = undefined;

  if (req.file) {
    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  user = await User.create({
    avatar,
    name,
    email,
    password,
    address,
    city,
    country,
    pinCode,
  });

  sendToken(user, res, `Enregistrement réussi`, 201);
});

// Logout user
export const logOut = asyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      ...cookieOptions,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Déconnexion réussie",
    });
});

// Get user profile
export const getMyProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update profile
export const updateProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { name, email, address, city, country, pinCode } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (city) user.city = city;
  if (country) user.country = country;
  if (pinCode) user.pinCode = pinCode;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Mise à jour du profil réussie",
  });
});

// Change password
export const changePassword = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(
      new ErrorHandler("Veuillez saisir l'ancien et le nouveau mot de passe", 400)
    );

  const isMatched = await user.comparePassword(oldPassword);

  if (!isMatched) return next(new ErrorHandler("Ancien mot de passe incorrect", 400));

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Mot de passe mis à jour avec succès",
  });
});

// Update avatar
export const updatePic = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const file = getDataUri(req.file);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar mis à jour avec succès",
  });
});

// Forgot password
export const forgetpassword = asyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("Email incorrect", 404));

  const randomNumber = Math.random() * (999999 - 100000) + 100000;
  const otp = Math.floor(randomNumber);
  const otp_expire = 2 * 60 * 1000;

  user.otp = otp;
  user.otp_expire = new Date(Date.now() + otp_expire);
  await user.save();

  const message = `Votre code OTP pour réinitialiser le mot de passe est ${otp} (expire dans 2 minutes). Si vous n'avez pas fait cette demande, ignorez ce message.`;
  try {
    await sendEmail("Réinitialisation du mot de passe", user.email, message);
  } catch (error) {
    user.otp = null;
    user.otp_expire = null;
    await user.save();
    return next(error);
  }

  res.status(200).json({
    success: true,
    message: `Code envoyé à ${user.email}`,
  });
});

// Reset password
export const resetpassword = asyncError(async (req, res, next) => {
  const { otp, password } = req.body;

  const user = await User.findOne({
    otp,
    otp_expire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("OTP incorrect ou expiré", 400));

  if (!password)
    return next(new ErrorHandler("Veuillez entrer un nouveau mot de passe", 400));

  user.password = password;
  user.otp = undefined;
  user.otp_expire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Mot de passe réinitialisé avec succès, vous pouvez maintenant vous connecter",
  });
});

// Update user subscription
export const updateSubscription = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { subscription } = req.body;

  console.log('Received subscription type:', subscription);
  const validSubscriptions = [
    "neutral",
    "visionnaire",
    "createur",
    "innovateur",
    "externes_basic",
    "externes_semi_basic",
    "externes_must",
    "must_innovateurs",
  ];

  if (!validSubscriptions.includes(subscription)) {
    return next(new ErrorHandler("Type d'abonnement non valide", 400));
  }

  user.subscription = subscription;

  await user.save();

  res.status(200).json({
    success: true,
    message: `Abonnement mis à jour : ${subscription}`,
  });
});
