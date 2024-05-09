import fs from "fs";

import {config} from "dotenv";
import OpenAI from "openai";

import { assistantInstructions, threadPrompt } from "./prompt.js";

config();
const openai = new OpenAI();

const createAssistant = async (pdf, xlsx) {
    const assistant = await openai.beta.assistants.create({
        name: "Question Generator",
        instructions: assistantInstructions,
        model: "gpt-3.5-turbo-0125",
        tools: [{type: "file_search"}],
    });

    // TODO: Change to get fileStream from Mongo GridFS
    const fileStreams = [pdf, xlsx].map((path) => {
        fs.createReadStream(path);
    })

    let vectorStore = await(openai.beta.vectorStores.create({
        name: "Lecture Notes References",
    }));

    await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, fileStreams);
    await openai.beta.assistants.update(assistant.id, {
        tool_resources: { file_search: { vector_store_id: [vectorStore.id] } }
    })
}

const addFile = async (filepath) => {
    // TODO: Change to get filestream from Mongo GridFS
    const file = await openai.files.create({
        file: fs.createReadStream(filepath),
        purpose: "assistants",
    });
    return file;
}

// TODO: files needs to be a mapped array of objects
const createThread(questionType, numQuestions, files) {
    const thread = await openai.beta.threads.create({
        messages: [
            {
                role: "user",
                content: threadPrompt(questionType, numQuestions),
                attachments: files
            }
        ]
    });
}






console.log("assistant created");
