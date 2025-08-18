import express from "express";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";
import {
  listContests,
  getContestDetail,
  submitWork,
  listPendingContests,
  approveContest,
  rejectContest,
  listAllSubmissions,
  listSubmissionsForContest,
  reviewSubmission,
  voteInContest,
  listMySubmissions,
} from "../controllers/contestController.js";

const router = express.Router();

// Public / filtré
router.get("/list", listContests);          // ?scope=public|mine|all
router.get("/:id", getContestDetail);

// Actions authentifiées
router.post("/:id/submit", isAuthenticated, submitWork);
router.put("/:id/vote", isAuthenticated, voteInContest);
router.get("/mine/submissions", isAuthenticated, listMySubmissions);

// Admin / Organisateur (selon ton auth)
router.get("/pending", isAuthenticated, /* isAdmin, */ listPendingContests);
router.put("/:id/approve", isAuthenticated, /* isAdmin, */ approveContest);
router.put("/:id/reject", isAuthenticated, /* isAdmin, */ rejectContest);

// Modération (admin / organisateur)
router.get("/submissions", isAuthenticated, /* isAdmin, */ listAllSubmissions);
router.get("/:id/submissions", isAuthenticated, /* checkOwnerOrAdmin, */ listSubmissionsForContest);
router.put("/submission/:submissionId/review", isAuthenticated, /* checkOwnerOrAdmin, */ reviewSubmission);

export default router;
