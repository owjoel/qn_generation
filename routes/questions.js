import fs from "fs";
import { Router } from "express";

import { generate } from "../utils/generate.js";
import { fetchFileIDs } from "../models/notes.js";
import { saveSAQ, saveMCQ, createMCQ, createSAQ, updateSAQ, updateMCQ, deleteSAQ, deleteMCQ } from "../models/questions.js";
import { encodeToJSON } from "../utils/encoder.js";
import { createExcelFromJSON } from "../utils/files.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(__dirname);
const router = Router();

const MAX_ATTEPMTS = 3;
const SAQ = "saq";
const MCQ = "mcq";

router.put("/questions", async (req, res, next) => {
  const { id, course, topic, keywords, type, num } = req.body;

  const notes = await fetchFileIDs(id);
  if (notes == null) {
    console.log('Notes not found for id: ' + id);
    return res.status(422).json({ err: 'Files were not found' });
  }
  const files = [notes.pdf.openaiID, notes.ref.openaiID];

  for (let i = 0; i < MAX_ATTEPMTS; i++) {
    const output = await generate({
      course: course,
      topic: topic,
      keywords: keywords,
      questionType: type,
      numQuestions: num,
      files: files,
    });

    if (output) {
      // console.log(output);
      fs.writeFile('./public/questions.txt', output, (err) => {
        if (err) next(err);
        else console.log("Raw output written to file");
      })
      const result = await encodeToJSON(type, output); // JSON object of questions
      let ok;
      if (type === SAQ) {
        ok = saveSAQ(id, result);
      } else if (type === MCQ) {
        ok = saveMCQ(id, result);
      }
      if (!ok) {
        return res.status(422).send('Could not save questions.');
      }
      return res.status(200).json(result);
      // const filename = createExcelFromJSON(result, course, topic);
    }
  }
  res.status(422).json({ err: 'Model failed to output.' });
});

// Create SAQ
router.post('/questions/saq/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const question = req.body.question;
    const ok = await createSAQ(id, question);
    if (!ok) {
      return res.status(422).send('Could not save questions.');
    }
    return res.status(201).send('Question created.');

  } catch (err) {
    next(err);
  }
})

// Create MCQ
router.post('/questions/mcq/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { question, correct, opt1, opt2, opt3, opt4 } = req.body;
    const options = [opt1, opt2, opt3, opt4];
    const ok = await createMCQ(id, question, correct, options);
    if (!ok) {
      return res.status(422).send('Could not save questions.');
    }
    return res.status(201).send('Question created.');
    
  } catch (err) {
    next(err);
  };
});


// Update SAQ
router.put('/questions/saq/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { _id, question } = req.body;
    const ok = await updateSAQ(id, _id, question);
    if (!ok) {
      return res.status(422).send('Could not update question.');
    }
    return res.status(200).send('Question updated.');

  } catch (err) {
    next(err);
  };
});

router.put('/questions/mcq/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { _id, question, correct, options } = req.body;
    const ok = await updateMCQ(id, _id, question, correct, options);
    if (!ok) {
      return res.status(422).send('Could not update question.');
    }
    return res.status(200).send('Question updated.');

  } catch (err) {
    next(err);
  };
});

router.delete('/questions/saq/:id/:questionID', async (req, res, next) => {
  try {
    const { id, questionID } = req.params;
    const ok = await deleteSAQ(id, questionID);
    if (!ok) {
      return res.status(422).send('Could not update question.');
    }
    return res.status(200).send('Question deleted.');
  } catch (err) {
    next(err);
  };
});

router.delete('/questions/mcq/:id/:questionID', async (req, res, next) => {
  try {
    const { id, questionID } = req.params;
    const ok = await deleteMCQ(id, questionID);
    if (!ok) {
      return res.status(422).send('Could not update question.');
    }
    return res.status(200).send('Question deleted.');
  } catch (err) {
    next(err);
  };
});

export default router;