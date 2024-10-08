import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Veuillez saisir votre nom"],
  },
  email: {
    type: String,
    required: [true, "Veuillez saisir votre email"],
    unique: [true, "L'email existe déjà"],
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Veuillez saisir votre mot de passe"],
    minLength: [6, "Le mot de passe doit comporter au moins 6 caractères"],
    select: false,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  pinCode: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user", "neutral", "visionnaire", "createur", "innovateur", "externes_basic", "externes_semi_basic", "externes_must", "must_innovateurs"],
    default: "neutral",
  },
  avatar: {
    public_id: String,
    url: String,
  },
  subscription: {
    type: String,
    enum: ["neutral", "visionnaire", "createur", "innovateur", "externes_basic", "externes_semi_basic", "externes_must", "must_innovateurs"],
    default: "neutral",
  },
  otp: Number,
  otp_expire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

schema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

schema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

export const User = mongoose.model("User", schema);
