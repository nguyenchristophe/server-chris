// subscriptionRoutes.js
import express from "express";
import { asyncError } from "../middlewares/error.js";
import ErrorHandler from "../utils/error.js";
import { isAuthenticated } from "../middlewares/auth.js";
import Stripe from "stripe";

// Initialisation de Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_API_SECRET || process.env.STRIPE_API_KEY, {
  apiVersion: "2022-11-15",
});

const router = express.Router();

// Mapping des abonnements vers des montants en centimes
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
  isAuthenticated, // assure que req.user est défini
  asyncError(async (req, res, next) => {
    const { subscription } = req.body;

    if (!subscription) {
      return next(new ErrorHandler("Le type d'abonnement est requis", 400));
    }
    if (!validSubscriptions.hasOwnProperty(subscription)) {
      return next(new ErrorHandler("Type d'abonnement non valide", 400));
    }

    // Déterminer le montant en centimes
    const amount = validSubscriptions[subscription];

    // Si l'abonnement est gratuit, vous pouvez renvoyer directement un message
    if (amount === 0) {
      return res.status(200).json({
        success: true,
        message: "Abonnement gratuit sélectionné.",
        paymentIntent: null,
        ephemeralKey: null,
        customer: null,
      });
    }

    // Assurez-vous que req.user existe (grâce à isAuthenticated)
    if (!req.user) {
      return next(new ErrorHandler("Utilisateur non authentifié", 401));
    }

    // Récupérer ou créer un client Stripe
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
      });
      customerId = customer.id;
      // Mettez à jour votre base de données avec le stripeCustomerId pour cet utilisateur
      // Par exemple : await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
      console.log("Customer créé :", customerId);
    }

    // Créer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // montant en centimes
      currency: "eur",
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        subscriptionType: subscription,
      },
    });

    // Créer une clé éphémère pour utiliser avec le PaymentSheet
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
