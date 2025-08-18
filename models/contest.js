import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // Frais d’inscription (peut être 0)
    fee: { type: Number, default: 0 },
    currency: { type: String, default: "EUR" },

    // public | private (pour être référencé publiquement)
    visibility: { type: String, enum: ["public", "private"], default: "public" },

    // pending (en attente d’approbation par la plateforme), approved, rejected
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },

    // Organisateur (Basic, Semi-basic, Externe Must, etc.)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Fenêtre de participation / votes
    startAt: { type: Date, default: () => new Date() },
    endAt: { type: Date, default: () => new Date(Date.now() + 7 * 86400000) }, // +7 jours par défaut

    // Règles libres (texte)
    rules: { type: String, default: "" },

    // Limite facultative
    maxSubmissions: { type: Number, default: 0 }, // 0 = illimité
  },
  { timestamps: true }
);

// Quelques indexes utiles
contestSchema.index({ visibility: 1, status: 1, startAt: 1, endAt: 1 });

export const Contest = mongoose.model("Contest", contestSchema);
