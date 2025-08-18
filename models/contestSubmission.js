// models/contestSubmission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Type d’œuvre + rattachement à vos modèles existants
    kind: { type: String, enum: ["poem", "image", "audio"], required: true },
    productRef: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // poème existant
    assetRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],  // illustration/audio liés

    // Métadonnées PI / licence
    license: {
      type: String,
      default: "standard", // vous pourrez étendre
    },

    // Stats
    votes: { type: Number, default: 0 },          // bruts
    weightedVotes: { type: Number, default: 0 },  // pondérés

    // Modération affichage
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ContestSubmission = mongoose.model("ContestSubmission", submissionSchema);
