import mongoose from "mongoose";

const notesSchema = new mongoose.Schema({
  course: { type: String, required: true },
  topic: { type: String, required: true },
  pdfID: { type: String, required: true },
  xlsxID: { type: String, required: true },
});

const Notes = mongoose.model('Notes', notesSchema);
export default Notes;
