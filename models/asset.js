import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nom de l'asset requis"],
  },
  type: {
    type: String,
    enum: ["illustration", "music", "voice", "translation", "other"],
    default: "illustration",
  },
  owner: {
    // L'utilisateur (poète, illustrateur...) qui possède cet asset
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  priceType: {
    // 'fix' = montant fixe, 'percent' = pourcentage
    type: String,
    enum: ["fix", "percent"],
    default: "fix",
  },
  // Optionnel: petit aperçu (image, audio, etc.)
  previewUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Asset = mongoose.model("Asset", assetSchema);
