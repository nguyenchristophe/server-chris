import { asyncError } from "../middlewares/error.js";
import ErrorHandler from "../utils/error.js";
import { Contest } from "../models/contest.js";
import { ContestSubmission } from "../models/contestSubmission.js";
import { ContestVote } from "../models/contestVote.js";
import { Product } from "../models/product.js";
import { Asset } from "../models/asset.js";

/* ---------- Helpers ---------- */
const now = () => new Date();
const between = (t, a, b) => t >= a && t <= b;

const isPaidSubscriber = (user) => {
  // Adapte selon tes plans d’abonnement
  const paid = ["Visionnaire", "Innovateur", "Basic", "Semi-basic", "Externes Must"];
  return !!user?.subscription && paid.includes(String(user.subscription));
};

const weightForSubscription = (user) => {
  // Pondération simple : adapte librement
  const map = {
    Innovateur: 3,
    Visionnaire: 2,
  };
  return map[user?.subscription] || 1;
};

const isStaff = (user) => user?.role === "admin" || user?.role === "staff";

/* ---------- Public / Lists ---------- */
// GET /contest?scope=public|mine|all
export const listContests = asyncError(async (req, res) => {
  const scope = String(req.query.scope || "public");
  let filter = {};

  if (scope === "public") {
    filter = { visibility: "public", status: "approved" };
  } else if (scope === "mine") {
    filter = { owner: req.user._id };
  } else if (scope === "all") {
    // Si pas staff, restreint à public+approved
    if (!isStaff(req.user)) {
      filter = { visibility: "public", status: "approved" };
    }
  }

  const contests = await Contest.find(filter).sort({ createdAt: -1 }).populate("owner", "name email");
  res.json({ success: true, contests });
});

// GET /contest/:id
export const getContestById = asyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id).populate("owner", "name email");
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));
  res.json({ success: true, contest });
});

// GET /contest/:id/submissions?status=submitted|accepted|rejected (default: accepted)
export const listContestSubmissions = asyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));

  const status = String(req.query.status || "accepted");
  const submissions = await ContestSubmission.find({ contest: contest._id, status })
    .sort({ createdAt: -1 })
    .populate("author", "name")
    .lean();

  // enrichir cible minimale
  for (const s of submissions) {
    if (s.contentType === "poem") {
      const p = await Product.findById(s.targetId).select("name images price assetsSelected");
      s.target = p ? { _id: p._id, name: p.name, images: p.images, price: p.price, assetsSelected: p.assetsSelected } : null;
    } else {
      const a = await Asset.findById(s.targetId).select("name type previewUrl price priceType");
      s.target = a ? { _id: a._id, name: a.name, type: a.type, previewUrl: a.previewUrl, price: a.price, priceType: a.priceType } : null;
    }
  }

  res.json({ success: true, submissions });
});

/* ---------- Organizer ---------- */
// POST /contest
export const createContest = asyncError(async (req, res, next) => {
  const {
    name, description, fee, currency, visibility, startAt, endAt,
    votingStartAt, votingEndAt, rules, maxSubmissions, type,
    organizerTier, oneVotePerContest, votingStrategy
  } = req.body;

  if (!name || !String(name).trim()) return next(new ErrorHandler("Nom requis", 400));

  const start = startAt ? new Date(startAt) : now();
  const end   = endAt   ? new Date(endAt)   : new Date(Date.now() + 7 * 86400000);
  if (start >= end) return next(new ErrorHandler("La date de fin doit être après la date de début", 400));

  const contest = await Contest.create({
    name: String(name).trim(),
    description: description || "",
    fee: Number(fee || 0),
    currency: currency || "EUR",
    visibility: visibility === "private" ? "private" : "public",
    status: "pending", // la plateforme approuve
    owner: req.user._id,
    startAt: start,
    endAt: end,
    votingStartAt: votingStartAt ? new Date(votingStartAt) : start,
    votingEndAt:   votingEndAt   ? new Date(votingEndAt)   : end,
    rules: rules || "",
    maxSubmissions: Number(maxSubmissions || 0),
    type: type === "informative" ? "informative" : "competitive",
    organizerTier: organizerTier || "basic",
    oneVotePerContest: oneVotePerContest !== undefined ? !!oneVotePerContest : true,
    votingStrategy: ["simple", "weightedBySubscription"].includes(votingStrategy) ? votingStrategy : "simple",
  });

  res.status(201).json({ success: true, contest });
});

// PUT /contest/:id  (owner)
export const updateContest = asyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));
  if (String(contest.owner) !== String(req.user._id) && !isStaff(req.user)) {
    return next(new ErrorHandler("Accès refusé", 403));
  }

  const fields = [
    "name", "description", "fee", "currency", "visibility", "startAt", "endAt",
    "votingStartAt", "votingEndAt", "rules", "maxSubmissions", "type",
    "organizerTier", "oneVotePerContest", "votingStrategy", "allowSubmissions", "allowVoting"
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) contest[f] = req.body[f];
  });

  await contest.save();
  res.json({ success: true, contest });
});

// DELETE /contest/:id  (owner ou staff)
export const deleteContest = asyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));
  if (String(contest.owner) !== String(req.user._id) && !isStaff(req.user)) {
    return next(new ErrorHandler("Accès refusé", 403));
  }

  await ContestSubmission.deleteMany({ contest: contest._id });
  await ContestVote.deleteMany({ contest: contest._id });
  await contest.deleteOne();

  res.json({ success: true, message: "Concours supprimé" });
});

// GET /contest/owner/submissions
export const listOwnerSubmissions = asyncError(async (req, res) => {
  const myContests = await Contest.find({ owner: req.user._id }).select("_id");
  const ids = myContests.map((c) => c._id);

  const submissions = await ContestSubmission.find({ contest: { $in: ids } })
    .sort({ createdAt: -1 })
    .populate("contest", "name")
    .populate("author", "name email")
    .lean();

  for (const s of submissions) {
    if (s.contentType === "poem") {
      const p = await Product.findById(s.targetId).select("name images");
      s.target = p ? { _id: p._id, name: p.name, images: p.images } : null;
    } else {
      const a = await Asset.findById(s.targetId).select("name type previewUrl");
      s.target = a ? { _id: a._id, name: a.name, type: a.type, previewUrl: a.previewUrl } : null;
    }
  }

  res.json({ success: true, submissions });
});

// PUT /contest/submission/:id/decision   body: { decision: "accept"|"reject", note?: string }
export const decideSubmission = asyncError(async (req, res, next) => {
  const sub = await ContestSubmission.findById(req.params.id).populate("contest", "owner");
  if (!sub) return next(new ErrorHandler("Soumission introuvable", 404));

  if (String(sub.contest.owner) !== String(req.user._id) && !isStaff(req.user)) {
    return next(new ErrorHandler("Accès refusé", 403));
  }

  const decision = String(req.body.decision || "").toLowerCase();
  if (!["accept", "reject"].includes(decision)) {
    return next(new ErrorHandler("Décision invalide", 400));
  }

  sub.status = decision === "accept" ? "accepted" : "rejected";
  sub.moderatorNote = req.body.note || "";
  await sub.save();

  res.json({ success: true, message: "Décision enregistrée", submission: sub });
});

/* ---------- Submissions (participants) ---------- */
// POST /contest/:id/submit  body: { contentType: "poem"|"asset", targetId }
export const submitToContest = asyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));
  if (contest.type === "informative" || !contest.allowSubmissions) {
    return next(new ErrorHandler("Ce concours n'accepte pas de soumissions", 400));
  }
  if (contest.status !== "approved") return next(new ErrorHandler("Concours non approuvé", 400));

  // période soumissions
  if (!between(now(), contest.startAt, contest.endAt)) {
    return next(new ErrorHandler("Hors période de soumission", 400));
  }

  const { contentType, targetId } = req.body;
  if (!contentType || !targetId) return next(new ErrorHandler("contentType et targetId requis", 400));
  if (!["poem", "asset"].includes(contentType)) return next(new ErrorHandler("contentType invalide", 400));

  // Vérifier ownership
  let targetDoc = null;
  if (contentType === "poem") targetDoc = await Product.findById(targetId);
  else targetDoc = await Asset.findById(targetId);

  if (!targetDoc) return next(new ErrorHandler("Contenu introuvable", 404));
  if (String(targetDoc.owner) !== String(req.user._id)) {
    return next(new ErrorHandler("Vous ne pouvez soumettre qu’un contenu dont vous êtes propriétaire", 403));
  }

  // Limite globale (facultatif)
  if (contest.maxSubmissions > 0) {
    const total = await ContestSubmission.countDocuments({ contest: contest._id });
    if (total >= contest.maxSubmissions) {
      return next(new ErrorHandler("Limite de soumissions atteinte", 400));
    }
  }

  // Création (index unique empêchera les doublons)
  const sub = await ContestSubmission.create({
    contest: contest._id,
    author: req.user._id,
    contentType,
    targetId,
    status: "submitted",
  });

  res.json({ success: true, submission: sub });
});

// GET /contest/me/submissions
export const listMySubmissions = asyncError(async (req, res) => {
  const subs = await ContestSubmission.find({ author: req.user._id })
    .sort({ createdAt: -1 })
    .populate("contest", "name status startAt endAt")
    .lean();

  for (const s of subs) {
    if (s.contentType === "poem") {
      const p = await Product.findById(s.targetId).select("name images price");
      s.target = p ? { _id: p._id, name: p.name, images: p.images, price: p.price } : null;
    } else {
      const a = await Asset.findById(s.targetId).select("name type previewUrl price priceType");
      s.target = a ? { _id: a._id, name: a.name, type: a.type, previewUrl: a.previewUrl, price: a.price, priceType: a.priceType } : null;
    }
  }

  res.json({ success: true, submissions: subs });
});

/* ---------- Plateforme (staff/admin) ---------- */
// GET /contest/owner/pending  (file d’approbation)
export const listPendingContests = asyncError(async (req, res, next) => {
  if (!isStaff(req.user)) return next(new ErrorHandler("Accès refusé", 403));
  const contests = await Contest.find({ status: "pending" }).sort({ createdAt: -1 }).populate("owner", "name email");
  res.json({ success: true, contests });
});

// PUT /contest/:id/approve
export const approveContest = asyncError(async (req, res, next) => {
  if (!isStaff(req.user)) return next(new ErrorHandler("Accès refusé", 403));
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));
  contest.status = "approved";
  await contest.save();
  res.json({ success: true, message: "Concours approuvé" });
});

// PUT /contest/:id/reject
export const rejectContest = asyncError(async (req, res, next) => {
  if (!isStaff(req.user)) return next(new ErrorHandler("Accès refusé", 403));
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));
  contest.status = "rejected";
  await contest.save();
  res.json({ success: true, message: "Concours rejeté" });
});

/* ---------- Votes ---------- */
// POST /contest/:id/vote   body: { submissionId }
export const castVote = asyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));
  if (!contest.allowVoting || contest.type === "informative") {
    return next(new ErrorHandler("Ce concours n'accepte pas de votes", 400));
  }
  if (contest.status !== "approved") return next(new ErrorHandler("Concours non approuvé", 400));

  const t = now();
  if (!between(t, contest.votingStartAt, contest.votingEndAt)) {
    return next(new ErrorHandler("Hors période de vote", 400));
  }

  if (!isPaidSubscriber(req.user)) {
    return next(new ErrorHandler("Seuls les abonnés payants peuvent voter", 403));
  }

  const { submissionId } = req.body;
  const sub = await ContestSubmission.findById(submissionId);
  if (!sub || String(sub.contest) !== String(contest._id) || sub.status !== "accepted") {
    return next(new ErrorHandler("Soumission invalide pour le vote", 400));
  }

  // Si un seul vote pour l’ensemble du concours
  if (contest.oneVotePerContest) {
    const existingOther = await ContestVote.findOne({ contest: contest._id, voter: req.user._id });
    if (existingOther && String(existingOther.submission) !== String(sub._id)) {
      return next(new ErrorHandler("Vous avez déjà voté pour ce concours", 400));
    }
  }

  const weight = contest.votingStrategy === "weightedBySubscription"
    ? weightForSubscription(req.user)
    : 1;

  // upsert sur la même submission
  const vote = await ContestVote.findOneAndUpdate(
    { contest: contest._id, submission: sub._id, voter: req.user._id },
    { $set: { weight } },
    { new: true, upsert: true }
  );

  res.json({ success: true, vote });
});

// DELETE /contest/:id/vote/:submissionId
export const retractVote = asyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));

  await ContestVote.deleteOne({
    contest: contest._id,
    submission: req.params.submissionId,
    voter: req.user._id,
  });

  res.json({ success: true, message: "Vote retiré" });
});

// GET /contest/:id/leaderboard
export const leaderboard = asyncError(async (req, res, next) => {
  const contestId = req.params.id;
  const contest = await Contest.findById(contestId);
  if (!contest) return next(new ErrorHandler("Concours introuvable", 404));

  const agg = await ContestVote.aggregate([
    { $match: { contest: contest._id } },
    { $group: { _id: "$submission", votes: { $sum: 1 }, weight: { $sum: "$weight" } } },
    { $sort: { weight: -1, votes: -1 } },
  ]);

  // enrichir avec infos submission/target (pour l’UI)
  const withInfos = [];
  for (const row of agg) {
    const sub = await ContestSubmission.findById(row._id).lean();
    if (!sub) continue;
    let title = "", img = "";

    if (sub.contentType === "poem") {
      const p = await Product.findById(sub.targetId).select("name images");
      title = p?.name || "Poème";
      img = p?.images?.[0]?.url || "";
    } else {
      const a = await Asset.findById(sub.targetId).select("name previewUrl");
      title = a?.name || "Asset";
      img = a?.previewUrl || "";
    }

    withInfos.push({
      submissionId: String(sub._id),
      contentType: sub.contentType,
      targetId: String(sub.targetId),
      title,
      previewUrl: img,
      votes: row.votes,
      weight: row.weight,
    });
  }

  res.json({ success: true, leaderboard: withInfos });
});
