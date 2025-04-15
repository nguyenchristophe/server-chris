// subscriptionRoutes.js
import express from "express";
import { config } from "dotenv";
import { asyncError } from "../middlewares/error.js";
import ErrorHandler from "../utils/error.js";
import { isAuthenticated } from "../middlewares/auth.js";
import Stripe from "stripe";

config({ path: "./data/config.env" });

// Initialisation de Stripe avec la clé secrète (vérifiez que STRIPE_API_SECRET est défini dans votre .env sans guillemets)
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
  // Optionnel : vous pouvez extraire et vérifier le token ici
  next();
};

// Appliquer ce middleware à toutes les routes de ce routeur
router.use(requireBearerAuth);

// Mapping des abonnements vers des montants (en centimes)
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
  isAuthenticated, // Le middleware d'authentification doit définir req.user
  asyncError(async (req, res, next) => {
    // Affichage pour débogage du contenu de la requête
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
      // Création du customer Stripe pour l'utilisateur
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
      });
      customerId = customer.id;
      // Ici, enregistrez customerId dans votre DB pour l'utilisateur (par exemple, via User.findByIdAndUpdate)
      console.log("Customer Stripe créé:", customerId);
    }

    // Création du PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: { subscriptionType: subscription },
    });

    // Création d'une clé éphémère pour le PaymentSheet
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
