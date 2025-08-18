import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // Organisateur = user qui a proposé le concours
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Tarif (ex: droit d’inscription côté organisateur)
    fee: { type: Number, default: 0 },

    // "pending" => en attente d’approbation par l’app
    // "approved" => visible (si public) / utilisable
    // "rejected" => refusé, stocke une raison optionnelle
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },

    // Visibilité publique de la fiche concours
    visibility: { type: String, enum: ["public", "private"], default: "public" },

    // Fenêtre temporelle
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },

    // Règles d’éligibilité (texte libre +/ou codes abonnement)
    eligibility: { type: String, default: "" },
    allowedTiers: [{ type: String }], // p.ex. ["Visionnaire","Innovateur"]

    // Comptage agrégé (facultatif)
    submissionsCount: { type: Number, default: 0 },

    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin qui a approuvé, si besoin
  },
  { timestamps: true }
);

export const Contest = mongoose.model("Contest", contestSchema);
