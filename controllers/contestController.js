import { asyncError } from "../middlewares/error.js";
import ErrorHandler from "../utils/error.js";
import { Contest } from "../models/contest.js";
import { ContestSubmission } from "../models/contestSubmission.js";

/** GET /contest/list?scope=public|mine|all */
export const listContests = asyncError(async (req, res) => {
  const scope = (req.query.scope || "public").toString();

  let filter = {};
  if (scope === "public") {
    filter = { status: "approved", visibility: "public" };
  } else if (scope === "mine") {
    if (!req.user) throw new ErrorHandler("Non authentifié", 401);
    filter = { organizer: req.user._id };
  } else if (scope === "all") {
    // pour un admin
    // tu peux restreindre ici: if(!req.user?.role==="admin") ...
    filter = {};
  }

  const contests = await Contest.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, contests });
});

/** GET /contest/:id */
export const getContestDetail = asyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));

  // Option: si non approuvé et pas owner/admin -> 403
  if (contest.status !== "approved" && (!req.user || String(contest.organizer) !== String(req.user._id))) {
    // autorise admin si besoin
    // if (req.user?.role !== "admin") ...
  }

  res.json({ success: true, contest });
});

/** POST /contest/:id/submit */
export const submitWork = asyncError(async (req, res, next) => {
  const { id } = req.params; // contestId
  const { productId, assetIds = [], kind = "poem", note = "" } = req.body;

  const contest = await Contest.findById(id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));
  if (contest.status !== "approved") return next(new ErrorHandler("Concours non approuvé", 400));

  // Option: période valide ?
  if (contest.startAt && new Date() < contest.startAt)
    return next(new ErrorHandler("Le concours n'a pas commencé", 400));
  if (contest.endAt && new Date() > contest.endAt)
    return next(new ErrorHandler("Le concours est terminé", 400));

  // TODO: vérifier l’abonnement payant du user si nécessaire (tiers, etc.)

  const submission = await ContestSubmission.create({
    contest: contest._id,
    author: req.user._id,
    productId,
    assetIds,
    kind,
    note,
  });

  // incrémente le compteur sur le concours
  contest.submissionsCount += 1;
  await contest.save();

  res.status(201).json({ success: true, submission });
});

/** GET /contest/pending  (admin/approbateur) */
export const listPendingContests = asyncError(async (req, res) => {
  const contests = await Contest.find({ status: "pending" }).sort({ createdAt: -1 });
  res.json({ success: true, contests });
});

/** PUT /contest/:id/approve  (admin/approbateur) */
export const approveContest = asyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));
  contest.status = "approved";
  contest.rejectionReason = "";
  contest.createdBy = req.user?._id;
  await contest.save();
  res.json({ success: true, message: "Concours approuvé" });
});

/** PUT /contest/:id/reject  (admin/approbateur) */
export const rejectContest = asyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));
  contest.status = "rejected";
  contest.rejectionReason = req.body?.reason || "";
  contest.createdBy = req.user?._id;
  await contest.save();
  res.json({ success: true, message: "Concours rejeté" });
});

/** GET /contest/submissions  (admin/modérateurs) — toutes */
export const listAllSubmissions = asyncError(async (req, res) => {
  const submissions = await ContestSubmission.find({})
    .populate("contest")
    .populate("author", "name")
    .populate("productId", "name images")
    .populate("assetIds", "name type");
  res.json({ success: true, submissions });
});

/** GET /contest/:id/submissions  (organisateur/admin) — pour un concours */
export const listSubmissionsForContest = asyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));

  // restreindre à l’organisateur de ce concours ou admin si besoin
  // if (String(contest.organizer) !== String(req.user._id) && req.user.role!=="admin") ...

  const submissions = await ContestSubmission.find({ contest: contest._id })
    .populate("author", "name")
    .populate("productId", "name images")
    .populate("assetIds", "name type");
  res.json({ success: true, submissions });
});

/** PUT /contest/submission/:submissionId/review (approve|reject) */
export const reviewSubmission = asyncError(async (req, res, next) => {
  const { submissionId } = req.params;
  const { decision, reason = "" } = req.body;

  const sub = await ContestSubmission.findById(submissionId).populate("contest");
  if (!sub) return next(new ErrorHandler("Soumission introuvable", 404));

  // droits (organisateur du concours ou admin)
  // if (String(sub.contest.organizer) !== String(req.user._id) && req.user.role!=="admin") ...

  if (!["approve", "reject"].includes(decision))
    return next(new ErrorHandler("Décision invalide", 400));

  sub.status = decision === "approve" ? "approved" : "rejected";
  sub.moderationReason = decision === "reject" ? reason : "";
  await sub.save();

  res.json({ success: true, message: "Décision appliquée", submission: sub });
});

/** PUT /contest/:id/vote  { submissionId } (abonnés payants) */
export const voteInContest = asyncError(async (req, res, next) => {
  const { id } = req.params; // contestId
  const { submissionId } = req.body;

  const contest = await Contest.findById(id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));
  if (contest.status !== "approved") return next(new ErrorHandler("Concours non approuvé", 400));

  // TODO: vérifier abonnement payant du req.user

  const sub = await ContestSubmission.findById(submissionId);
  if (!sub) return next(new ErrorHandler("Soumission introuvable", 404));
  if (String(sub.contest) !== String(contest._id))
    return next(new ErrorHandler("Soumission hors de ce concours", 400));

  // anti double vote
  if (sub.voters.some((u) => String(u) === String(req.user._id))) {
    return next(new ErrorHandler("Vous avez déjà voté pour cette soumission", 400));
  }

  sub.votes += 1;
  sub.voters.push(req.user._id);
  await sub.save();

  res.json({ success: true, votes: sub.votes });
});

/** GET /contest/mine/submissions — mes soumissions tous concours */
export const listMySubmissions = asyncError(async (req, res) => {
  const submissions = await ContestSubmission.find({ author: req.user._id })
    .populate("contest")
    .populate("productId", "name images")
    .populate("assetIds", "name type");
  res.json({ success: true, submissions });
});
