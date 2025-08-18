// controllers/contestController.js
import { Contest } from "../models/contest.js";
import { ContestSubmission } from "../models/contestSubmission.js";
import { ContestVote } from "../models/contestVote.js";
import { ContestAudit } from "../models/contestAudit.js";
import ErrorHandler from "../utils/error.js";
import { asyncError } from "../middlewares/error.js";

// 1) Organisateur crée un concours (→ pending_approval)
export const createContest = asyncError(async (req, res, next) => {
  const {
    title, description, rules, bannerUrl,
    fee, submissionsStart, submissionsEnd, votingStart, votingEnd,
    visibility,
  } = req.body;

  // tier de l’organisateur : à déduire du profil (user.role / user.organizerTier)
  const organizerTier = req.user.organizerTier || "basic";

  const contest = await Contest.create({
    title, description, rules, bannerUrl,
    fee,
    submissionsStart, submissionsEnd, votingStart, votingEnd,
    organizer: req.user._id,
    organizerTier,
    visibility: visibility || "public",
    status: "pending_approval",
  });

  await ContestAudit.create({ contest: contest._id, actor: req.user._id, action: "create_contest" });

  res.status(201).json({ success: true, contest });
});

// 2) Admin approuve / rejette
export const reviewContest = asyncError(async (req, res, next) => {
  const { id } = req.params;
  const { action, reason } = req.body; // "approve" | "reject"
  const c = await Contest.findById(id);
  if (!c) return next(new ErrorHandler("Concours introuvable", 404));

  if (action === "approve") {
    c.status = "open";
    c.rejectionReason = "";
  } else if (action === "reject") {
    c.status = "rejected";
    c.rejectionReason = reason || "Non spécifié";
  } else {
    return next(new ErrorHandler("Action invalide", 400));
  }
  await c.save();
  await ContestAudit.create({ contest: c._id, actor: req.user._id, action: contest_${action}, meta: { reason } });

  res.json({ success: true, contest: c });
});

// 3) Créateur soumet une œuvre
export const submitToContest = asyncError(async (req, res, next) => {
  const { id } = req.params; // contestId
  const { kind, productRef, assetRefs = [], license } = req.body;
  const c = await Contest.findById(id);
  if (!c) return next(new ErrorHandler("Concours introuvable", 404));
  if (c.status !== "open") return next(new ErrorHandler("Soumissions non ouvertes", 400));

  const now = new Date();
  if (now < c.submissionsStart || now > c.submissionsEnd)
    return next(new ErrorHandler("Hors période de soumission", 400));

  const submission = await ContestSubmission.create({
    contest: c._id,
    creator: req.user._id,
    kind,
    productRef,
    assetRefs,
    license: license || "standard",
  });

  c.stats.submissions += 1;
  await c.save();

  await ContestAudit.create({ contest: c._id, submission: submission._id, actor: req.user._id, action: "submit" });

  res.status(201).json({ success: true, submission });
});

// 4) Démarrer la période de votes (Admin ou auto-cron)
export const openVoting = asyncError(async (req, res, next) => {
  const { id } = req.params;
  const c = await Contest.findById(id);
  if (!c) return next(new ErrorHandler("Concours introuvable", 404));
  c.status = "voting";
  await c.save();
  await ContestAudit.create({ contest: c._id, actor: req.user._id, action: "open_voting" });
  res.json({ success: true, contest: c });
});

// 5) Voter (abonné payant)
export const voteSubmission = asyncError(async (req, res, next) => {
  const { id, submissionId } = req.params; // contestId, submissionId
  const c = await Contest.findById(id);
  if (!c) return next(new ErrorHandler("Concours introuvable", 404));
  if (c.status !== "voting") return next(new ErrorHandler("Votes non ouverts", 400));

  const now = new Date();
  if (now < c.votingStart || now > c.votingEnd)
    return next(new ErrorHandler("Hors période de vote", 400));

  // Poids selon abonnement utilisateur
  const sub = (req.user.subscription || "").toLowerCase(); // "basic" | "premium" | "must"…
  const weight =
    sub === "must" ? c.voteWeights.must :
    sub === "premium" ? c.voteWeights.premium :
    c.voteWeights.basic;

  // crée vote unique (index unique submission+voter)
  await ContestVote.create({
    contest: c._id,
    submission: submissionId,
    voter: req.user._id,
    weight,
  });

  // MAJ compteur
  await ContestSubmission.updateOne(
    { _id: submissionId },
    { $inc: { votes: 1, weightedVotes: weight } }
  );
  c.stats.votes += 1;
  await c.save();

  await ContestAudit.create({ contest: c._id, submission: submissionId, actor: req.user._id, action: "vote", meta: { weight } });

  res.json({ success: true, weight });
});

// 6) Clôture (Admin ou auto-cron)
export const closeContest = asyncError(async (req, res, next) => {
  const { id } = req.params;
  const c = await Contest.findById(id);
  if (!c) return next(new ErrorHandler("Concours introuvable", 404));

  c.status = "closed";
  await c.save();

  // (Option) calcul gagnants : top N par weightedVotes
  const top = await ContestSubmission.find({ contest: c._id })
    .sort({ weightedVotes: -1 })
    .limit(10)
    .populate("creator productRef assetRefs");

  await ContestAudit.create({ contest: c._id, actor: req.user._id, action: "close_contest" });

  res.json({ success: true, contest: c, top });
});

// 7) Listing (public / mine / admin)
export const listContests = asyncError(async (req, res, next) => {
  const { scope } = req.query; // "public" | "mine" | "all" (admin)
  let query = {};
  if (scope === "mine") query = { organizer: req.user._id };
  if (scope === "public") query = { visibility: "public", status: { $in: ["open", "voting", "closed"] } };
  // "all" => admin voit tout

  const list = await Contest.find(query).sort({ createdAt: -1 });
  res.json({ success: true, contests: list });
});

export const getContestDetail = asyncError(async (req, res, next) => {
  const { id } = req.params;
  const contest = await Contest.findById(id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));

  const submissions = await ContestSubmission.find({ contest: id })
    .populate("creator productRef assetRefs");

  res.json({ success: true, contest, submissions });
});
