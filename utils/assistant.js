import fs from "fs";
import https from "https"

import { config } from "dotenv";
import OpenAI from "openai";

import { assistantInstructions, threadPrompt } from "./prompt.js";
import { Readable } from "stream";
import FormData from "form-data";

config();
const openai = new OpenAI();

// Create a new OpenAI assistant if assistant not found.
export const createAssistant = async (pdf, xlsx) => {
  const assistant = await openai.beta.assistants.create({
    name: "Question Generator",
    instructions: assistantInstructions,
    model: "gpt-3.5-turbo-0125",
    tools: [{ type: "file_search" }],
  });
  console.log(assistant);
  return assistant;
};

// Converts multer file to stream. Adds file to the organisation's directory on OpenAI. Returns the ID.
export const addFile = async (filepath) => {
  const f = await openai.files.create({
    file: fs.createReadStream(filepath),
    purpose: "assistants",
  });
  console.log(f);
  return f.id;
};

// Use existing fileIDs to create a new vector store. Returns the ID.
export async function createVectorStore(fileIDs) {
  const vs = await openai.beta.vectorStores.create({
    name: course,
  });
  console.log(`${course} vectorStore created.`);
  await openai.beta.vectorStores.fileBatches.create(vs.id, {
    file_ids: fileIDs,
  });
  return vs.id;
}

// Updates the specified assistant with the new vector store.
export async function updateAssistantWithStore(assistantID, storeID) {
  await openai.beta.assistants.update(assistantID, {
    tool_resources: { file_search: { vector_store_id: [storeID] } },
  });
}

// TODO: files needs to be a mapped array of objects
const createThread = async (assistant, questionType, numQuestions, files) => {
  const run = await openai.beta.threads.createAndRun({
    assistant_id: assistant.id,
    thread: {
      messages: [
        {
          role: "user",
          content: threadPrompt(questionType, numQuestions),
          attachments: files,
        },
      ],
    },
  });
  console.log(run);
};

export const retrieveAssistant = async (id) => {
  const assistant = await openai.beta.assistants.retrieve(id);
  return assistant;
};



  // const formData = new FormData();
  // formData.append('file', file.buffer, {
  //   filename: file.originalname,
  //   contentType: file.mimetype,
  //   knownLength: file.size,
  // })
  // formData.append('purpose', 'assistants');

  // const options = {
  //   method: 'POST',
  //   hostname: 'api.openai.com',
  //   path: '/v1/files',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  //     ...formData.getHeaders()
  //   }
  // }
  // let f;
  // const req = https.request(options, (res) => {
  //   let data = '';
  //   res.on('data', (chunk) => {
  //     data += chunk;
  //   });
  //   res.on('end', () => {
  //     const parsedData = JSON.parse(data);
  //     console.log('OpenAI response: ');
  //     console.log(parsedData);
  //   })
  //   res.on('error', (error) => {
  //     console.log('Error uploading file to OpenAI: ', error);
  //   })
  // })
  // formData.pipe(req);
