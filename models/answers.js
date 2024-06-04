import { generate } from "../utils/answers.js";
import { Notes } from "./notes.js";

export async function generateSampleAnswers(id, questionID) {
  const notes = await Notes.findById(id, "pdf.openaiID saq");
  const openaiID = notes.pdf.openaiID;
  const saq = notes.saq.id(questionID);
  if (!saq) {
    return null;
  }

  const options = { question: saq.question, openaiID: openaiID, maxMark: 5 };
  const output = generate(options);
    if (!output) {
    return null;
  }
  return output;
}

export async function saveSampleAnswers(id, questionID, data) {
  const answers = data.answers;
  const notes = await Notes.findById(id);
  const saq = notes.saq.id(questionID);
  if (!saq) {
    return null;
  }
  saq.category = data.category;
  answers.forEach((answer) => {
    saq.answers.push(answer);
  })
  const result = notes.save()
  if (!result) {
    return false;
  }
  return true;
}
