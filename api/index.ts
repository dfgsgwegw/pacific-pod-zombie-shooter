/**
 * Vercel serverless entry point for the API.
 * Does NOT use pino (worker threads break in serverless) — uses console.log instead.
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
