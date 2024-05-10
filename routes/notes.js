// Routes to upload files, saved to organisation directory on OpenAI. FileIDs stored in local MongoDB
import fs from "fs";

import { Router } from "express";
import { addFile } from "../utils/assistant.js";
import Notes from "../models/notes.js";

const router = Router();

router.post("/notes", async (req, res, next) => {
  const course = req.body.course;
  const topic = req.body.topic;
  const files = req.files;

  // Check if both PDF and XLSX files attached
  if (!files) {
    return res.status(422).json({ err: "No files attached." });
  } else if (files.length == 1) {
    return res.status(422).json({ err: "Attach all files." });
  }
  // Create file IDs
  const pdf = files['pdf'][0].path;
  const xlsx = files['xlsx'][0].path;
  let pdfID = '';
  let xlsxID = '';
  try {
    pdfID = await addFile(pdf.path);
    xlsxID = await addFile(xlsx.path);
    fs.unlink(pdf, (err) => console.log('Could not delete pdf file'));
    fs.unlink(xlsx, (err) => console.log('Could not delete .xlsx file.'))
  } catch (err) {
    console.log(err);
    return res.status(500).json({err: "The files could not be uploaded. Try again."});
  }

  // Save file IDs to MongoDB
  const notes = new Notes({
    course: course,
    topic: topic,
    pdfID: pdfID,
    xlsxID: xlsxID
  });
  notes.save().then(result => {
    console.log("Notes saved.");
  })
  return res.status(201).json({ msg: "Files uploaded successfully." });
});

export default router;