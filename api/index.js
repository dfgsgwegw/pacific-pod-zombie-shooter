/**
 * Vercel serverless entry point for the API.
 * Plain JS — avoids TypeScript compilation issues with deep import chains.
 * Imports routes directly from the api-server package.
 */
import express from "express";
import cors from "cors";
import router from "../artifacts/api-server/src/routes/index";

const app = express();

const corsOptions = {
  origin: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
