import { Router } from "express";
import { generate } from "../utils/assistant.js";
import { getNotes } from "../models/notes.js";

const router = Router();

router.post("/questions", async (req, res, next) => {
  const id = req.body.id;
  const course = req.body.course;
  const topic = req.body.topic;
  const keywords = req.body.keywords; // An array of keywords
  const questionType = req.body.type;
  const numQuestions = req.body.num;


  const notes = await getNotes(id);
  if (notes == null) {
    console.log('Notes not found for id: ' + id);
    res.status(422).json({ err: 'Files were not found' });
  }
  const files = [notes.pdfID, notes.refID];

  generate({
    course: course,
    topic: topic,
    keywords: keywords,
    questionType: questionType,
    numQuestions: numQuestions,
    files: files,
  });
  return res.status(200).json('Works so far');
});

export default router;