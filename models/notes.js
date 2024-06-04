import fs from "fs";

import mongoose from "mongoose";
import { addFile, deleteFile } from "../utils/generate.js";
import { createJSONFromFile } from "../utils/files.js";
import path from "path";

const SAQ = "saq";
const MCQ = "mcq";
const PDF = "pdf";
const REF = "ref";

// Schema definitions
const fileSchema = new mongoose.Schema(
  { data: { type: Buffer, required: true } },
  { timestamps: true }
);

const notesSchema = new mongoose.Schema(
  {
    index: { type: String, required: true },
    course: { type: String, required: true },
    topic: { type: String, required: true },
    pdf: {
      filename: { type: String, required: true },
      contentType: String,
      size: Number,
      fileID: { type: String, required: true },
      openaiID: { type: String, required: true },
      created: Date,
    },
    ref: {
      filename: { type: String, required: true },
      contentType: String,
      size: Number,
      fileID: { type: String, required: true },
      openaiID: { type: String, required: true },
      created: Date,
    },
    saq: [
      new mongoose.Schema({
        question: String,
        category: String,
        manualCategory: Number,
        maxMarks: Number,
        answers: [{answer: String, feedback: String, score: Number}],
      }),
    ],
    mcq: [
      new mongoose.Schema({
        question: String,
        correct: String,
        options: [String],
      }),
    ],
  },
  { timestamps: true }
);

// Create schemas
export const Notes = mongoose.model("Notes", notesSchema);
export const Files = mongoose.model("Files", fileSchema);

// METHODS
// Create new topic notes and save files ✅
export async function createNotes (course, topic, pdf, pdfID, ref, refID) {
  const pdfBuffer = fs.readFileSync(pdf.path);
  const refBuffer = fs.readFileSync(ref.path);

  const pdfFile = new Files({ data: pdfBuffer });
  const refFile = new Files({ data: refBuffer });
  await pdfFile.save();
  await refFile.save();

  const notes = new Notes({
    index: course.toLowerCase(),
    course: course,
    topic: topic,
    pdf: {
      filename: pdf.originalname,
      contentType: pdf.mimetype,
      size: pdf.size,
      fileID: pdfFile._id,
      openaiID: pdfID,
      created: new Date(),
    },
    ref: {
      filename: ref.originalname,
      contentType: ref.mimetype,
      size: ref.size,
      fileID: refFile._id,
      openaiID: refID,
      created: new Date(),
    },
  });

  notes.save().then((result) => {
    console.log(`${topic} notes saved.`);
  });
};

// Update the file of a specific topic notes.
export const updateNotesFiles = async (id, file, opt) => {
  try {
    let update;
    const buffer = fs.readFileSync(file.path);
    const newFile = new Files({ data: buffer });
    if (opt === PDF) {
      const openaiID = await addFile(file.path);
      update = {
        pdf: {
          filename: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          data: buffer,
          fileID: newFile._id,
          openaiID: openaiID,
          created: new Date(),
        },
      };
    } else {
      const refName = path.parse(file.originalname).name;
      const refPath = createJSONFromFile(refName, file.path);
      const openaiID = await addFile(refPath);
      update = {
        ref: {
          filename: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          data: buffer,
          fileID: newFile._id,
          openaiID: openaiID,
          created: new Date(),
        },
      };
    }
    const doc = await Notes.findByIdAndUpdate(id, update);
    if (doc === null) {
      console.warn("[Mongo]\tUnable to update notes")
      return false;
    }
    console.info("[Mongo]\tNotes updated");
    newFile.save()
      .then(() => {console.info("[Mongo]\tNew file saved")})
      .catch(() => {console.error("[Mongo]\tUnable to saved file to DB")});
    if (opt === PDF) {
      deleteFile(doc.pdf.openaiID);
      const q = await Files.deleteOne({ _id: doc.pdf.fileID });
      console.info("[Mongo]\t" + JSON.stringify(q));
    } else {
      deleteFile(doc.ref.openaiID);
      const q = await Files.deleteOne({ _id: doc.ref.fileID });
      console.info("[Mongo]\t" + JSON.stringify(q));
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  } finally {
    deleteLocalFiles([file.path]);
  }
};

export const getAllCourseTopics = async (course) => {
  try {
    const notes =
      course == null
        ? await Notes.find({}, "_id course topic updatedAt")
            .sort({ updatedAt: -1 })
            .exec()
        : await Notes.find({ index: course }, "_id course topic updatedAt")
            .sort({ updatedAt: -1 })
            .exec();
    // const notes = await Notes.find({ index: course }, "_id course topic updatedAt").sort({ updatedAt: -1 }).exec();
    return notes;
  } catch (err) {
    console.error(`No notes found for course: ${course}`);
    return null;
  }
};

// Retrieve notes by ID to return to CLIENT
export const getTopic = async (id) => {
  try {
    const notes = await Notes.findById(id);
    return notes;
  } catch (err) {
    console.error(`Could not find notes with id: ${id}`);
    return null;
  }
};

// Retrieve fileIDs of a particular notes(id) to pass to OpenAI
export const fetchFileIDs = async (id) => {
  try {
    const notes = await Notes.findById(id, "_id pdf.openaiID ref.openaiID");
    console.log(notes);
    return notes;
  } catch (e) {
    console.error(e);
  }
};

export const deleteLocalFiles = (paths) => {
  paths.forEach((path) => {
    //console.log(path);
    fs.unlink(path, (err) => {
      if (err) {
        console.error(`Could not delete ${path}`);
      }
    });
  });
};

export const getNotesFile = async (id, type) => {
  try {
    let notes;
    let file;
    if (type === "pdf") {
      notes = await Notes.findById(id, " pdf.filename pdf.contentType pdf.fileID ");
      file = await Files.findById(notes.pdf.fileID);
    } else if (type === "ref") {
      notes = await Notes.findById(id, " ref.filename ref.contentType ref.fileID ");
      file = await Files.findById(notes.ref.fileID);
    } else {
      return null;
    }
    console.info(`[Notes]\tRetrieved ${type} for id: ${id}`);
    return { file, notes };
  } catch (err) {
    console.error(err);
    return null;
  }
}