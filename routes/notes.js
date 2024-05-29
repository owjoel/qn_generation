// Routes to upload files, saved to organisation directory on OpenAI. FileIDs stored in local MongoDB
import path from "path";

import { Router } from "express";
import { addFile } from "../utils/generate.js";
import {
  createNotes,
  deleteLocalFiles,
  getAllCourseTopics,
  getNotesFile,
  getTopic,
  updateNotesFiles,
} from "../models/notes.js";
import { createJSONFromFile } from "../utils/files.js";

const router = Router();

const PDF = "pdf";
const REF = "ref";

// POST: Create a topic's notes
router.post("/notes/create", async (req, res, next) => {
  const course = req.body.course;
  const topic = req.body.topic;
  const files = req.files;
  if (!files || !files["pdf"] || !files["ref"]) {
    return res.status(422).json({ err: "No files uploaded." });
  }
  const pdf = files["pdf"][0];
  const ref = files["ref"][0];
  if (!pdf || !ref) {
    return res.status(422).json({ err: "Upload both files." });
  }

  let refPath;
  // Upload files to OpenAI
  try {
    const refName = path.parse(ref.originalname).name;
    refPath = createJSONFromFile(refName, ref.path);

    const pdfID = await addFile(pdf.path);
    const refID = await addFile(refPath);

    createNotes(course, topic, pdf, pdfID, ref, refID);
    res.status(201).json({ msg: "Files uploaded successfully." });
  } catch (err) {
    res.status(500).json({ err: "File upload unsuccessful." });
    next(err);
  } finally {
    //console.log(pdf.path, ref.path, refPath);
    deleteLocalFiles([pdf.path, ref.path, refPath]);
  }
});



// PUT: Update a single file of a topic
router.put("/notes/update", async (req, res, next) => {
  const id = req.body.id;
  const opt = req.body.opt;
  const pdf = req.files["pdf"];
  const ref = req.files["ref"];

  if (pdf == undefined && ref == undefined) {
    return res.status(422).json({ err: "No files uploaded." });
  } else if (
    (opt !== PDF && opt !== REF) ||
    (pdf == undefined && opt === PDF) ||
    (ref == undefined && opt === REF)
  ) {
    return res.status(422).send("Invalid request");
  }

  let file;
  if (opt === PDF) {
    file = pdf[0];
  } else {
    file = ref[0];
  }

  try {
    const ok = await updateNotesFiles(id, file, opt);
    if (!ok) {
      return res.status(422).json({ err: "Notes could not be updated." });
    }
    res.status(200).json({ msg: "Notes updated successfully." });
  } catch (err) {
    next(err);
    res.status(500).send("Server error");
  }
});



// GET: Search for a single topic's notes and information
router.get("/notes/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const notes = await getTopic(id);
    if (notes == null) {
      return res.status(404).json({ err: "No course notes found" });
    }
    res.status(200).json({ notes: notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "There was an error servicing your request." });
  }
});



// GET: Search for all course topics
router.get("/notes", async (req, res) => {
  const course = req.query.course;
  try {
    const topics = await getAllCourseTopics(course);
    if (topics == null) {
      return res.status(404).json({ err: "No course notes found" });
    }
    res.status(200).json({ topics: topics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "There was an error servicing your request." });
  }
});


// GET: File by ID
router.get("/notes/files/:id", async (req, res) => {
  const id = req.params.id;
  const type = req.query.type;
  const result = await getNotesFile(id, type);
  if (!result) {
    return res.status(404).json({ err: "File not found." });
  }
  const { file, notes } = result;
  if (type === "pdf") {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${notes.pdf.filename}"`
    );
    res.setHeader("Content-Type", notes.pdf.contentType);
    res.send(file.data);
  } else {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${notes.ref.filename}"`
    );
    res.setHeader("Content-Type", notes.ref.contentType);
    res.send(notes.ref.data);
  }
});

export default router;