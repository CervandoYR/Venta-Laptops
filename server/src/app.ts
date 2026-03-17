import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { routes } from "./routes";
import { tenantResolver } from "./middlewares/tenant.middleware";
import { errorHandler } from "./middlewares/error.middleware";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      credentials: true
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(limiter);

  app.use(tenantResolver);

  app.use("/api", routes);

  app.use(errorHandler);

  return app;
};

