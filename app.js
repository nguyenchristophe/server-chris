import express from "express";
import { config } from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";

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
import chatRoutes from "./routes/chatRoutes.js";

app.use("/api/v1/user", user);
app.use("/api/v1/product", product);
app.use("/api/v1/order", order);
app.use("/api/v1/chat", chatRoutes);

// Using Error Middleware
app.use(errorMiddleware);
