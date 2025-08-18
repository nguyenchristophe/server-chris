import express from "express";
import {
  listContests,
  getContestById,
  createContest,
  submitToContest,
  listMySubmissions,
  listPendingContests,
  listOwnerSubmissions,
  approveContest,
  rejectContest,
  decideSubmission,
} from "../controllers/contestController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Public (liste public) + scopes protégés
router.get("/", isAuthenticated, listContests);
router.get("/:id", isAuthenticated, getContestById);
router.post("/", isAuthenticated, createContest);

router.post("/:id/submit", isAuthenticated, submitToContest);
router.get("/me/submissions", isAuthenticated, listMySubmissions);

router.get("/owner/pending", isAuthenticated, listPendingContests);
router.get("/owner/submissions", isAuthenticated, listOwnerSubmissions);
router.put("/:id/approve", isAuthenticated, approveContest);
router.put("/:id/reject", isAuthenticated, rejectContest);
router.put("/submission/:id/decision", isAuthenticated, decideSubmission);

export default router;
