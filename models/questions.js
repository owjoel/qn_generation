import { config } from "dotenv";

import { addFile, createAssistant, retrieveAssistant } from "../utils/assistant";

config();
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