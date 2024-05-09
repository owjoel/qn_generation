import { Router } from "express";

//import { readPDF } from "../utils/generate";

const router = Router();

router.post("/questions/saq", (req, res, next) => {
  const course = req.body.course;
  const title = req.body.title;
  const files = req.files;
  const type = req.body.type;

  if (!files) {
    return res.status(422).json({err: "No files attached.",});
  } else if (files.length == 1) {
    return res.status(422).json({err: "Attach all files."});
  }

  // const file = req.file;
  const pdf = files['pdf'][0];
  const xlsx = files['xlsx'][0];

  return res.status(201).json({msg: 'Files uploaded successfully.'});
});

router.post("/questions/mcq");

router.post("/questions");

export default router;