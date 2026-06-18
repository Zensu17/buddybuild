import express from "express";
import { requestLogger } from "./middleware/logger";
import { errorHandler } from "./middleware/error";
import apiRoutes from "./routes";

const app = express();

// 1. CORS Headers Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// 2. Request Body Parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// 3. Request Logger
app.use(requestLogger);

// 4. Feature-Based Endpoints under /buddybuild
app.use("/buddybuild", apiRoutes);

// 5. Centralized Error Handler
app.use(errorHandler);

export default app;
