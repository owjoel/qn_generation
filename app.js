import { config } from "dotenv";
import express from "express";
import multer from "multer";
import bodyParser from "body-parser";
import mongoose from "mongoose";

// import questionsRoutes from "./routes/questions.js";
import notesRoutes from "./routes/notes.js";
import Storage from "./utils/storage.js";

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Storage engine with multer
const fileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "public/pdf");
  },
  filename: (_req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

config();
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
    { name: "pdf", maxCount: 1 },
    { name: "xlsx", maxCount: 1 },
  ])
);

// Routes
app.use(notesRoutes);
// app.use(questionsRoutes);

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(app.listen(3000))
  .catch((err) => {
    console.log(err);
  });