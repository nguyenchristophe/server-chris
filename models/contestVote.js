import mongoose from "mongoose";

const contestVoteSchema = new mongoose.Schema(
  {
    contest:    { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true, index: true },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "ContestSubmission", required: true, index: true },
    voter:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // pondération (1 = vote simple ; >1 si pondéré)
    weight: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// 1 vote par utilisateur et par submission
contestVoteSchema.index({ contest: 1, submission: 1, voter: 1 }, { unique: true });

export const ContestVote = mongoose.model("ContestVote", contestVoteSchema);
