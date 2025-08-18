// models/contestVote.js
import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "ContestSubmission", required: true },
    voter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    weight: { type: Number, default: 1 }, // selon l’abonnement
  },
  { timestamps: true }
);

// Empêche double vote du même user sur la même submission
voteSchema.index({ submission: 1, voter: 1 }, { unique: true });

export const ContestVote = mongoose.model("ContestVote", voteSchema);
