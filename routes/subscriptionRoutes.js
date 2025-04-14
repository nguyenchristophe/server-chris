// subscriptionRoutes.js
import express from "express";
import { config } from "dotenv";
import { asyncError } from "../middlewares/error.js";
import ErrorHandler from "../utils/error.js";
import { isAuthenticated } from "../middlewares/auth.js";
import Stripe from "stripe";

config({ path: "./data/config.env" });

// Initialisation de Stripe avec votre clé API (assurez-vous d'avoir défini STRIPE_API_SECRET correctement)
const stripe = new Stripe(process.env.STRIPE_API_SECRET);

const router = express.Router();

// Middleware pour forcer la présence du header Authorization de type Bearer
const requireBearerAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing or invalid. Must be Bearer token.",
    });
  }
  // Optionnel : vous pouvez extraire le token et le vérifier par exemple avec jwt.verify, si nécessaire.
  next();
};

// Vous pouvez appliquer le middleware requireBearerAuth pour toutes les routes de ce routeur ou seulement pour certaines
router.use(requireBearerAuth);

// Définir les montants pour chaque plan (en centimes)
const validSubscriptions = {
  neutral: 0,
  visionnaire: 500,
  createur: 900,
  innovateur: 1300,
  externes_basic: 15000,
  externes_semi_basic: 25000,
  externes_must: 50000,
  must_innovateurs: 30000,
};

router.post(
  "/create-payment-intent",
  isAuthenticated, // Assure que req.user est défini
  asyncError(async (req, res, next) => {
    console.log("Requête reçue:", req.body);
    console.log("Valeur reçue pour subscription:", req.body.subscription);

    const { subscription } = req.body;

    if (!subscription) {
      return next(new ErrorHandler("Le type d'abonnement est requis", 400));
    }
    if (!validSubscriptions.hasOwnProperty(subscription)) {
      return next(new ErrorHandler("Type d'abonnement non valide", 400));
    }

    const amount = validSubscriptions[subscription];
    if (amount === 0) {
      return res.status(200).json({
        success: true,
        message: "Abonnement gratuit sélectionné.",
        paymentIntent: null,
        ephemeralKey: null,
        customer: null,
      });
    }

    if (!req.user) {
      return next(new ErrorHandler("Utilisateur non authentifié", 401));
    }

    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
      });
      customerId = customer.id;
      // Ici, enregistrez customerId dans la DB pour l'utilisateur
      console.log("Customer Stripe créé:", customerId);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: { subscriptionType: subscription },
    });

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2022-11-15" }
    );

    res.status(200).json({
      success: true,
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerId,
    });
  })
);

export default router;
