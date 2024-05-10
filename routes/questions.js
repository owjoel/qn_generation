import { Router } from "express";

//import { readPDF } from "../utils/generate";

const router = Router();

router.post("/questions/saq", (req, res, next) => {
  const type = req.body.type; // Question type (SAQ / MCQ)
  const files = req.body.files; // Array of fileIDs

  // const file = req.file;
  generateQuestions({type: type, files: files});
  return res.status(200).json();
});

router.post("/questions/mcq");

router.post("/questions");

export default router;