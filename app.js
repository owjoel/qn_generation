import { config } from "dotenv";
import express from "express";
import multer from "multer";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

import questionsRoutes from "./routes/questions.js";
import notesRoutes from "./routes/notes.js";
import { fileFilter, fileStorage } from "./utils/files.js";
import { corsOptions } from "./utils/cors.js";

config();
const app = express();

// Middleware
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
    { name: "pdf", maxCount: 1 },
    { name: "ref", maxCount: 1 },
  ])
);

// Routes
app.use(notesRoutes);
app.use(questionsRoutes);

// Initialise DB and server
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(app.listen(8000))
  .catch((err) => {
    console.error(err);
  });
