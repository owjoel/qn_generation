import { Router } from "express";

import { generateSampleAnswers, saveSampleAnswers } from "../models/answers.js";
import { encodeToJSON } from "../utils/answers.js";

const router = Router();

router.put("/answers/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const { questionID } = req.body;
    const output = await generateSampleAnswers(id, questionID);
    console.log(output);
    const result = await encodeToJSON("answer", output); // JSON Object
    console.log(result);

    const ok = saveSampleAnswers(id, questionID, result);
    if (ok) {
      res.status(201).json(result);
    }
  } catch (err) {
    next(err);
  }
});

export default router;
