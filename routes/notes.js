// Routes to upload files, saved to organisation directory on OpenAI. FileIDs stored in local MongoDB
import path from "path";

import { Router } from "express";
import { addFile } from "../utils/generate.js";
import { deleteLocalFiles, getAllCourseTopics, getNotes, saveNotesID } from "../models/notes.js";
import { createJSONFromFile } from "../utils/files.js";

const router = Router();

// POST: Create a topic's notes
router.post("/notes", async (req, res, next) => {
  const course = req.body.course.toLowerCase();
  const topic = req.body.topic.toLowerCase();
  const files = req.files;
  if (!files['pdf'] || !files['ref']) {
    return res.status(422).json({ err: "No files uploaded." });
  }
  const pdf = files['pdf'][0];
  const ref = files['ref'][0];
  if (!pdf || !ref) {
    return res.status(422).json({ err: "Upload both files." });
  }

  let refPath;
  // Upload files to OpenAI
  try {
    const refName = path.parse(ref.originalname).name;
    const refPath = createJSONFromFile(refName, ref.path);

    const pdfID = await addFile(pdf.path);
    const refID = await addFile(refPath);
    console.log(pdfID, refID);

    saveNotesID(course, topic, pdf.originalname, pdfID, ref.originalname, refID);
    res.status(201).json({ msg: "Files uploaded successfully." });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: "The files could not be uploaded. Please try again." });

  } finally {
    console.log(pdf.path, ref.path, refPath);
    deleteLocalFiles([pdf.path, ref.path, refPath]);
  }
});

// GET: Search for a single topic's notes and information
router.get('/notes/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    const notes = await getNotes(id);
    if (notes == null) {
      return res.status(404).json({ err: 'No course notes found'});
    }
    res.status(200).json({ notes: notes});
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "There was an error servicing your request." });
  }
});


// GET: Search for all course notes
router.get('/notes', async (req, res) => {
  const course = req.query.course;
  try {
    const notes = await getAllCourseTopics(course);
    if (notes == null) {
      return res.status(404).json({ err: 'No course notes found' });
    }
    res.status(200).json({ notes: notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "There was an error servicing your request." });
  }
})

export default router;
// const vsID = await createVectorStore(course, topic, [pdfID, refID])