import fs from "fs";

import mongoose from "mongoose";

const notesSchema = new mongoose.Schema(
  {
    course: { type: String, required: true },
    topic: { type: String, required: true },
    pdf: { type: String, required: true },
    pdfID: { type: String, required: true },
    ref: { type: String, required: true },
    refID: { type: String, required: true },
  },
  { timestamps: true }
);

export const saveNotesID = (course, topic, pdf, pdfID, ref, refID) => {
  const notes = new Notes({
    course: course,
    topic: topic,
    pdf: pdf,
    pdfID: pdfID,
    ref: ref,
    refID: refID,
  });
  notes.save().then((result) => {
    console.log(`${topic} notes saved.`);
  });
};

export const getAllCourseTopics = async (course) => {
  try {
    const notes = await Notes.find({ course: course }, "_id topic").exec();
    return notes;
  } catch (err) {
    console.error(`No notes found for course: ${course}`);
    return null;
  }
};

export const getNotes = async (id) => {
  try {
    const notes = await Notes.findById(id);
    return notes;
  } catch (err) {
    console.error(`Could not find notes with id: ${id}`);
    return null;
  }
};

export const deleteLocalFiles = (paths) => {
  paths.forEach(path => {
    fs.unlink(path, (err) => {
      if (err) {
        console.error(`Could not delete ${path}`);
      }
    });
  })
};

export const Notes = mongoose.model("Notes", notesSchema);