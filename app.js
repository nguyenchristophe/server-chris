import express from "express";
import { config } from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import playlistRoutes from "./routes/playlist.js";
import fanLicensesRoutes from "./routes/fanLicensesRoutes.js";



config({
  path: "./data/config.env",
});

export const app = express();

// Using Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: [process.env.FRONTEND_URI_1, process.env.FRONTEND_URI_2],
  })
);

app.get("/", (req, res, next) => {
  res.send("Working");
});

// Importing Routers here
import user from "./routes/user.js";
import product from "./routes/product.js";
import order from "./routes/order.js";
import asset from "./routes/asset.js"; 
app.use((req, res, next) => {
  console.log("Requête URL:", req.url);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});



app.use("/api/v1/user", user);
app.use("/api/v1/product", product);
app.use("/api/v1/order", order);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/asset", asset);  // <- Montage du routeur asset

app.use("/api/v1/fanLicensesRoutes", fanLicensesRoutes);


// Using Error Middleware
app.use(errorMiddleware);
//app.use("/subscription", subscriptionRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);

app.use("/api/v1/playlist", playlistRoutes);
