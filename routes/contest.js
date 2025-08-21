// routes/contest.js
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
router.get("/:id([0-9a-fA-F]{24})", isAuthenticated, getContestById);
router.get("/:id([0-9a-fA-F]{24})/submissions", isAuthenticated, listContestSubmissions);

// Création / édition (organisateur)
router.post("/", isAuthenticated, createContest);
router.put("/:id([0-9a-fA-F]{24})", isAuthenticated, updateContest);
router.delete("/:id([0-9a-fA-F]{24})", isAuthenticated, deleteContest);

// Soumissions (participants)
router.post("/:id([0-9a-fA-F]{24})/submit", isAuthenticated, submitToContest);
router.get("/me/submissions", isAuthenticated, listMySubmissions);

// Modération plateforme
router.get("/owner/pending", isAuthenticated, listPendingContests);
router.put("/:id([0-9a-fA-F]{24})/approve", isAuthenticated, approveContest);
router.put("/:id([0-9a-fA-F]{24})/reject", isAuthenticated, rejectContest);

// Modération propriétaire (sur les soumissions reçues)
router.get("/owner/submissions", isAuthenticated, listOwnerSubmissions);
router.put("/submission/:id([0-9a-fA-F]{24})/decision", isAuthenticated, decideSubmission);

// Votes
router.post("/:id([0-9a-fA-F]{24})/vote", isAuthenticated, castVote);
router.delete("/:id([0-9a-fA-F]{24})/vote/:submissionId([0-9a-fA-F]{24})", isAuthenticated, retractVote);
router.get("/:id([0-9a-fA-F]{24})/leaderboard", isAuthenticated, leaderboard);

export default router;
