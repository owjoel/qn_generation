import fs from "fs";
import { Router } from "express";

import { generate } from "../utils/generate.js";
import { fetchFileIDs, saveGeneratedQuestions } from "../models/notes.js";
import { encodeToJSON } from "../utils/encoder.js";
import { createExcelFromJSON } from "../utils/files.js";


const router = Router();
const MAX_ATTEPMTS = 3;

router.put("/questions", async (req, res, next) => {
  const id = req.body.id;
  const course = req.body.course;
  const topic = req.body.topic;
  const keywords = req.body.keywords;
  const questionType = req.body.type;
  const numQuestions = req.body.num;

  console.log("hi", req.body);
  const notes = await fetchFileIDs(id);
  if (notes == null) {
    console.log('Notes not found for id: ' + id);
    return res.status(422).json({ err: 'Files were not found' });
  }
  const files = [notes.pdf.fileID, notes.ref.fileID];

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
      let ok = await saveGeneratedQuestions(id, questionType, result);
      console.log(ok);
      createExcelFromJSON(result, course, topic);
      return res.status(200).json({ msg: 'Excel file created successfully.' });
    }
  }
  res.status(422).json({ err: 'Model failed to output.' });
});

export default router;