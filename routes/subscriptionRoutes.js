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
  isAuthenticated, // Assure que req.user est défini
  asyncError(async (req, res, next) => {
    // Afficher la valeur reçue pour le débogage
    console.log("Valeur reçue pour subscription:", req.body.subscription);
    
    const { subscription } = req.body;
    if (!subscription) {
      return next(new ErrorHandler("Le type d'abonnement est requis", 400));
    }
    
    // Vérifier que la valeur reçue appartient bien aux abonnements valides
    if (!validSubscriptions.hasOwnProperty(subscription)) {
      return next(new ErrorHandler("Type d'abonnement non valide", 400));
    }
    
    const amount = validSubscriptions[subscription];
    
    // Si l'abonnement est gratuit, renvoyer une réponse sans PaymentIntent
    if (amount === 0) {
      return res.status(200).json({
        success: true,
        message: "Abonnement gratuit sélectionné.",
        paymentIntent: null,
        ephemeralKey: null,
        customer: null,
      });
    }
    
    // Vérifier que req.user existe grâce au middleware isAuthenticated
    if (!req.user) {
      return next(new ErrorHandler("Utilisateur non authentifié", 401));
    }
    
    // Récupérer ou créer un customer Stripe pour l'utilisateur connecté
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
      });
      customerId = customer.id;
      // Mettez ici le code pour enregistrer customerId dans la base pour l'utilisateur
      console.log("Customer Stripe créé :", customerId);
    }
    
    // Création du PaymentIntent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
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
