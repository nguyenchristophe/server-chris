import { app } from "./app.js";
import { connectDB } from "./data/database.js";
import cloudinary from "cloudinary";
import Stripe from "stripe";
require("dotenv/config");
connectDB();

export const stripe = new Stripe(process.env.STRIPE_API_SECRET);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



//production
var server = app.listen(process.env.PORT || 3000,function() {
  var port = server.address().port; 
  console.log("Express is working on:"+port);
  
  })
