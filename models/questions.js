import { ok } from "assert";
import { Notes } from "./notes.js";

// save generated SAQ into a specific notes by ID
export async function saveSAQ(id, result) {
  const data = result.map((question) => { question: question.Title });
  const update = { $push: { saq: { $each: data } } }
  const doc = await Notes.findByIdAndUpdate(id, update);
  if (doc == null) {
    console.log("Notes not found for updating question bank.");
    return false;
  }
  return true;
}

// save generated SAQ into a specific notes by ID
export async function saveMCQ(id, result) {
  const data = result.map((question) => {
    const options = [];
    Object.keys(question).forEach((key) => {
      if (key.toLocaleLowerCase().includes("choice")) {
        options.push(question[key]);
      }
    });
    
    return {
      question: question.Title,
      correct: question.Correct,
      options: options,
    };
  });
  const update = { $push: { mcq: { $each: data } } }
  const doc = await Notes.findByIdAndUpdate(id, update);
  if (doc == null) {
    console.log("Notes not found for updating question bank.");
    return false;
  }
  return true;
}

export async function updateSAQ(notesID, questionID, question) {
  const notes = await Notes.findById(notesID);
  const doc = notes.saq.id(questionID);
  doc.question = question;
  const result = await notes.save();
  if (!result) {
    return false; 
  }
  return true;
}

export async function updateMCQ(notesID, questionID, question, correct, options) {
  const notes = await Notes.findById(notesID);
  const doc = notes.mcq.id(questionID);
  doc.question = question;
  doc.correct = correct;
  doc.options = options;
  const result = await notes.save();
  if (!result) {
    return false; 
  }
  return true;
}

export async function deleteSAQ(notesID, questionID) {
  const notes = await Notes.findById(notesID);
  notes.saq.id(questionID).deleteOne();
  const result = await notes.save();
  if (!result) {
    return false;
  }
  return true;
}

export async function deleteMCQ(notesID, questionID) {
  const notes = await Notes.findById(notesID);
  notes.mcq.id(questionID).deleteOne();
  const result = await notes.save();
  if (!result) {
    return false;
  }
  return true;
}

export async function createSAQ(notesID, question) {
  const notes = await Notes.findById(notesID);
  notes.saq.push({ question: question });
  const result = notes.save();
  if (result == null) {
    return false;
  }
  return true;
}

export async function createMCQ(notesID, question, correct, options) {
  const notes = await Notes.findById(notesID);
  notes.mcq.push({ question: question, correct: correct, options: options });
  const result = await notes.save();  
  if (result == null) {
    return false;
  }
  return true;
}