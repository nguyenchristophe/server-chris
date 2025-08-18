import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    // Métadonnées
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // Typologie : "competitive" (soumissions + votes) ou "informative" (pas de votes)
    type: { type: String, enum: ["competitive", "informative"], default: "competitive", index: true },

    // Visibilité publique (listable) ou privée
    visibility: { type: String, enum: ["public", "private"], default: "public", index: true },

    // Workflow plateforme
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },

    // Organisateur (Basic, Semi-basic, Externes Must… si tu veux l’afficher)
    organizerTier: { type: String, default: "basic" },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Fenêtres
    startAt: { type: Date, default: () => new Date() },                                  // ouverture soumissions
    endAt: { type: Date, default: () => new Date(Date.now() + 7 * 86400000) },           // fin soumissions
    votingStartAt: { type: Date },                                                       // optionnel (sinon = startAt)
    votingEndAt: { type: Date },                                                         // optionnel (sinon = endAt)

    // Frais d’inscription (si non-nul et paiement à implémenter côté front/Stripe)
    fee: { type: Number, default: 0 },
    currency: { type: String, default: "EUR" },

    // Règles (texte libre)
    rules: { type: String, default: "" },

    // Limites
    maxSubmissions: { type: Number, default: 0 },  // 0 = illimité
    oneVotePerContest: { type: Boolean, default: true }, // 1 vote total par votant (sinon multi-submissions)

    // Stratégie de vote
    votingStrategy: { type: String, enum: ["simple", "weightedBySubscription"], default: "simple" },

    // Drapeaux dérivés (pratique pour l’UI)
    allowSubmissions: { type: Boolean, default: true },
    allowVoting: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Cohérence automatique avec type
contestSchema.pre("validate", function (next) {
  if (this.type === "informative") {
    this.allowSubmissions = false;
    this.allowVoting = false;
  } else {
    if (this.allowSubmissions === undefined) this.allowSubmissions = true;
    if (this.allowVoting === undefined) this.allowVoting = true;
  }
  if (!this.votingStartAt) this.votingStartAt = this.startAt;
  if (!this.votingEndAt) this.votingEndAt = this.endAt;
  next();
});

contestSchema.index({ type: 1, visibility: 1, status: 1, startAt: 1, endAt: 1 });

export const Contest = mongoose.model("Contest", contestSchema);
