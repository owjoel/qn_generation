import { config } from "dotenv";

import { addFile, createAssistant, retrieveAssistant } from "../utils/assistant";
import mongoose from "mongoose";
import { Binary } from "mongodb";

const questionsSchema = mongoose.Schema(
    {
        course: { type: String, required: true},
        topic: { type: String, required: true},
        questions: {type: Binary, required: true},
    }
)


export const generateQuestions = (query) => {
    const {course, title, type, pdf, xlsx} = query;

    const files = [];
    files.append(addFile(pdf.path));
    files.append(addFile(xlsx.path));

    const assistant = retrieveAssistant(process.env.OPENAI_ASSISTANT_ID);
    if (assistant === undefined) {
        assistant = createAssistant(pdf.path, xlsx.path);
    }

    
}