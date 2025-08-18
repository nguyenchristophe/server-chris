import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  listContests,
  getContestById,
  listContestSubmissions,

  createContest,
  updateContest,
  deleteContest,
  submitToContest,
  listMySubmissions,

  listPendingContests,
  approveContest,
  rejectContest,
  listOwnerSubmissions,
  decideSubmission,

  castVote,
  retractVote,
  leaderboard,
} from "../controllers/contestController.js";

const router = express.Router();

// Listing & détails
router.get("/", isAuthenticated, listContests);
router.get("/:id", isAuthenticated, getContestById);
router.get("/:id/submissions", isAuthenticated, listContestSubmissions);

// Création / édition (organisateur)
router.post("/", isAuthenticated, createContest);
router.put("/:id", isAuthenticated, updateContest);
router.delete("/:id", isAuthenticated, deleteContest);

// Soumissions (participants)
router.post("/:id/submit", isAuthenticated, submitToContest);
router.get("/me/submissions", isAuthenticated, listMySubmissions);

// Modération plateforme
router.get("/owner/pending", isAuthenticated, listPendingContests);
router.put("/:id/approve", isAuthenticated, approveContest);
router.put("/:id/reject", isAuthenticated, rejectContest);

// Modération propriétaire (sur les soumissions reçues)
router.get("/owner/submissions", isAuthenticated, listOwnerSubmissions);
router.put("/submission/:id/decision", isAuthenticated, decideSubmission);

// Votes
router.post("/:id/vote", isAuthenticated, castVote);
router.delete("/:id/vote/:submissionId", isAuthenticated, retractVote);
router.get("/:id/leaderboard", isAuthenticated, leaderboard);

export default router;
