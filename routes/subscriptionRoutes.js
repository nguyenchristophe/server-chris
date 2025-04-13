// subscriptionRoutes.js
import express from "express";
import { asyncError } from "../middlewares/error.js";
import ErrorHandler from "../utils/error.js";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Définition des montants pour chaque plan (en centimes)
const validSubscriptions = {
  neutral: 0, // Gratuit
  visionnaire: 500,         // 5€ par mois
  createur: 900,            // 9€ par mois
  innovateur: 1300,         // 13€ par mois
  externes_basic: 15000,    // 150€ par mois
  externes_semi_basic: 25000, // 250€ par mois
  externes_must: 50000,     // 500€ par mois
  must_innovateurs: 30000,  // 300€ par mois
};

router.post(
  "/create-payment-intent",
  asyncError(async (req, res, next) => {
    const { subscription } = req.body;
    if (!subscription) {
      return next(new ErrorHandler("Le type d'abonnement est requis", 400));
    }
    if (!validSubscriptions.hasOwnProperty(subscription)) {
      return next(new ErrorHandler("Type d'abonnement non valide", 400));
    }

    const amount = validSubscriptions[subscription];

    // Si l'abonnement est gratuit, pas besoin de PaymentIntent
    if (amount === 0) {
      return res.status(200).json({
        success: true,
        message: "Abonnement gratuit sélectionné.",
        paymentIntent: null,
        ephemeralKey: null,
        customer: null,
      });
    }

    // Récupérer ou créer un customer Stripe pour l'utilisateur connecté
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
      });
      customerId = customer.id;
      // Vous pouvez enregistrer customerId dans votre base de données pour l'utilisateur
    }

    // Création du PaymentIntent
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

    // Création d'une clé éphémère pour le PaymentSheet
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2022-11-15" } // Utilisez la version requise par Stripe
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
