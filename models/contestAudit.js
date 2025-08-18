// models/contestAudit.js (tracking PI / usage / journal)
import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "ContestSubmission" },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin / voter / organizer / creator
    action: { type: String, required: true }, // "submit" | "view" | "vote" | "approve" | "reject" | "suspend" | ...
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const ContestAudit = mongoose.model("ContestAudit", auditSchema);
