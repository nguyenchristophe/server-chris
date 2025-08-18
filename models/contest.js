// models/contest.js
import mongoose from "mongoose";

const organizerTierEnum = ["basic", "semi_basic", "external_must"] as const;
const contestStatusEnum = ["draft", "pending_approval", "approved", "open", "voting", "closed", "rejected", "suspended"] as const;
const visibilityEnum = ["public", "private"] as const;

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    rules: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },

    // Organisateur qui propose (user._id) + son “tier”
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organizerTier: { type: String, enum: organizerTierEnum, required: true },

    // Tarification fixée par l’organisateur (frais d’inscription, par ex.)
    fee: { type: Number, default: 0 },

    // Périodes
    submissionsStart: { type: Date, required: true },
    submissionsEnd: { type: Date, required: true },
    votingStart: { type: Date, required: true },
    votingEnd: { type: Date, required: true },

    // Workflow
    status: { type: String, enum: contestStatusEnum, default: "pending_approval" },
    visibility: { type: String, enum: visibilityEnum, default: "public" },

    // Motifs d’admin
    rejectionReason: { type: String, default: "" },
    suspensionReason: { type: String, default: "" },

    // Options de pondération (par type d’abonnement)
    voteWeights: {
      basic: { type: Number, default: 1 },
      premium: { type: Number, default: 1.5 },
      must: { type: Number, default: 2 },
    },

    // Compteurs
    stats: {
      submissions: { type: Number, default: 0 },
      votes: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Contest = mongoose.model("Contest", contestSchema);
