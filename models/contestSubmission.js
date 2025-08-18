import mongoose from "mongoose";

const contestSubmissionSchema = new mongoose.Schema(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true, index: true },
    author:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // "poem" = Product ; "asset" = Asset
    contentType: { type: String, enum: ["poem", "asset"], required: true },
    targetId:    { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    // Flux de modération du propriétaire du concours (et/ou staff)
    status: { type: String, enum: ["submitted", "accepted", "rejected"], default: "submitted", index: true },
    moderatorNote: { type: String, default: "" },

    // caches légers (facultatifs) pour l’UI si tu veux
    title: { type: String, default: "" },
    previewUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

// Empêche qu’un auteur soumette la même cible 2x au même concours
contestSubmissionSchema.index(
  { contest: 1, author: 1, contentType: 1, targetId: 1 },
  { unique: true }
);

export const ContestSubmission = mongoose.model("ContestSubmission", contestSubmissionSchema);
