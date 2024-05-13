import fs from "fs";
import { Router } from "express";

import { generate } from "../utils/generate.js";
import { getNotes } from "../models/notes.js";
import { encodeToJSON } from "../utils/encoder.js";
import { createExcelFromJSON, createJSONFromFile } from "../utils/files.js";


const router = Router();
const MAX_ATTEPMTS = 3;

router.post("/questions", async (req, res, next) => {
  const id = req.body.id;
  const course = req.body.course;
  const topic = req.body.topic;
  const keywords = req.body.keywords;
  const questionType = req.body.type;
  const numQuestions = req.body.num;


  const notes = await getNotes(id);
  if (notes == null) {
    console.log('Notes not found for id: ' + id);
    res.status(422).json({ err: 'Files were not found' });
  }
  const files = [notes.pdfID, notes.refID];

  for (let i = 0; i < MAX_ATTEPMTS; i++) {
    const output = await generate({
      course: course,
      topic: topic,
      keywords: keywords,
      questionType: questionType,
      numQuestions: numQuestions,
      files: files,
    });

    if (output) {
      fs.writeFile('./public/questions.txt', output, (err) => {
        if (err) console.log(err);
        else console.log('[fs] Write: Raw questions written to file');
      })
      const result = await encodeToJSON(questionType, output); // JSON object of questions
      createExcelFromJSON(result, course, topic);
      return res.status(200).json({ msg: 'Excel file created successfully.' });
    }
  }
  res.status(422).json({ err: 'Model failed to output.' });
});

export default router;