// routes/contest.js
import express from "express";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";
import {
  createContest, reviewContest, submitToContest,
  openVoting, voteSubmission, closeContest,
  listContests, getContestDetail
} from "../controllers/contestController.js";

const router = express.Router();

// Organisateur
router.post("/", isAuthenticated, createContest); // status=pending_approval
router.get("/", isAuthenticated, listContests);   // ?scope=public|mine|all

// Admin
router.put("/:id/review", isAuthenticated, isAdmin, reviewContest); // approve/reject
router.put("/:id/open-voting", isAuthenticated, isAdmin, openVoting);
router.put("/:id/close", isAuthenticated, isAdmin, closeContest);

// Créateur
router.post("/:id/submit", isAuthenticated, submitToContest);

// Votes
router.post("/:id/submission/:submissionId/vote", isAuthenticated, voteSubmission);

// Détail
router.get("/:id", isAuthenticated, getContestDetail);

export default router;
