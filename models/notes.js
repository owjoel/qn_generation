import fs from "fs";

import mongoose from "mongoose";
import { addFile, deleteFile } from "../utils/generate.js";
import { Binary } from "mongodb";
import { createJSONFromFile } from "../utils/files.js";
import path from "path";

const notesSchema = new mongoose.Schema(
  {
    index: {type: String, required: true},
    course: { type: String, required: true },
    topic: { type: String, required: true },
    pdf: {
      filename: {type: String, required: true},
      contentType: String,
      size: Number,
      data: { type: Buffer, required: true },
      fileID: {type: String, required: true},
      created: Date
    },
    ref: {
      filename: {type: String, required: true},
      contentType: String,
      size: Number,
      data: { type: Buffer, required: true },
      fileID: {type: String, required: true},
      created: Date
    },
    saq: [{ question: String }],
    mcq: [{ question: String }]
  },
  { timestamps: true }
);

export const saveNotesID = (course, topic, pdf, pdfID, ref, refID) => {
  const pdfBuffer = fs.readFileSync(pdf.path);
  const refBuffer = fs.readFileSync(ref.path);

  const notes = new Notes({
    index: course.toLowerCase(),
    course: course,
    topic: topic,
    pdf: {
      filename: pdf.originalname,
      contentType: pdf.mimetype,
      size: pdf.size,
      data: pdfBuffer,
      fileID: pdfID,
      created: new Date()
    },
    ref: {
      filename: ref.originalname,
      contentType: ref.mimetype,
      size: ref.size,
      data: refBuffer,
      fileID: refID,
      created: new Date()
    },
  });
  notes.save().then((result) => {
    console.log(`${topic} notes saved.`);
  });
};

export async function saveGeneratedQuestions(id, type, output) {
  const data = output.map((question) => {
    return {
      question: question.Title,
    }
  })
  console.log(data);
  try {
    let update;
    if (type === "saq") {
      update = { $push: { saq: { $each: data } } }
    } else if (type === "mcq") {
      update = { $push: { mcq: { $each: data } } }
    } else {
      console.error('Invalid question type');
      return false;
    }

    const doc = await Notes.findByIdAndUpdate(id, update)
    if (doc == null) {
      console.error('Notes not found for updating question bank.');
      return false;
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// Update the file of a specific topic notes.
export const updateNotesFiles = async (id, file, opt) => {
  try {
    let update;
    const buffer = fs.readFileSync(file.path);
    if (opt === "pdf") {
      const fileID = await addFile(file.path);
      update = { pdf: {
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        data: buffer,
        fileID: fileID,
        created: new Date(),
      }};
    } else {
      const refName = path.parse(file.originalname).name;
      const refPath = createJSONFromFile(refName, file.path);
      const fileID = await addFile(refPath);
      update = { ref: {
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        data: buffer,
        fileID: fileID,
        created: new Date(),
    } };
    }
    const doc = await Notes.findByIdAndUpdate(id, update);
    if (opt === "pdf") {
      return await deleteFile(doc.pdf.fileID);
    } else {
      return await deleteFile(doc.ref.fileID);
    }
  } catch (e) {
    console.error(e);
    return false;
  } finally {
    deleteLocalFiles([file.path]);
  }
}

export const getAllCourseTopics = async (course) => {
  try {
    const notes = await Notes.find({ index: course }, "_id course topic updatedAt").sort({ updatedAt: -1 }).exec();
    return notes;
  } catch (err) {
    console.error(`No notes found for course: ${course}`);
    return null;
  }
};

// Retrieve notes by ID to return to CLIENT
export const getTopic = async (id) => {
  try {
    const notes = await Notes.findById(
      id, 
      "_id course topic pdf.filename pdf.size pdf.fileID ref.filename ref.size ref.fileID pdf.created ref.created saq mcq"
    );
    return notes;
  } catch (err) {
    console.error(`Could not find notes with id: ${id}`);
    return null;
  }
};

// Retrieve fileIDs of a particular notes(id) to pass to OpenAI
export const fetchFileIDs = async (id) => {
  try {
    const notes = await Notes.findById(id, "_id pdf.fileID ref.fileID");
    console.log(notes);
    return notes;
  } catch (e) {
    console.error(e);
  }
}

export const deleteLocalFiles = (paths) => {
  paths.forEach(path => {
    //console.log(path);
    fs.unlink(path, (err) => {
      if (err) {
        console.error(`Could not delete ${path}`);
      }
    });
  })
};

export const getNotesFile = async (id, type) => {
  try {
    let notes;
    if (type === "pdf") {
      notes = await Notes.findOne({ "pdf.fileID": id }, "pdf.filename pdf.data pdf.contentType");
    } else if (type === "ref") {
      notes = await Notes.findOne({ "ref.fileID": id }, "ref.filename ref.data ref.contentType");
    } else {
      return null;
    }
    return notes;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export const Notes = mongoose.model("Notes", notesSchema);