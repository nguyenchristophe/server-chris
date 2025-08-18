import mongoose from "mongoose";

const contestSubmissionSchema = new mongoose.Schema(
  {
    // rattachement
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Œuvre soumise
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    assetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],

    // Typage informatif
    kind: { type: String, default: "poem" }, // "poem"|"illustration"|"audio"|"mixed"
    note: { type: String, default: "" },

    // Modération
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    moderationReason: { type: String, default: "" },

    // Votes (par abonnés payants)
    votes: { type: Number, default: 0 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // anti-double vote
  },
  { timestamps: true }
);

export const ContestSubmission = mongoose.model("ContestSubmission", contestSubmissionSchema);
