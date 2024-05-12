import fs from "fs";
import https from "https"

import { config } from "dotenv";
import OpenAI from "openai";

import { assistantInstructions, threadPrompt } from "./prompt.js";

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
  console.log(`[OpenAI] Uploaded file: ${f.filename}`);
  return f.id;
};

// Updates the specified assistant with the new vector store.
export async function updateAssistantWithStore(assistantID, storeID) {
  await openai.beta.assistants.update(assistantID, {
    tool_resources: { file_search: { vector_store_id: [storeID] } },
  });
}

// TODO: files needs to be a mapped array of objects
async function createThreadAndRun(options) {
  const {course, topic, keywords, questionType, numQuestions, files} = options;
  const assistantID = process.env.OPENAI_ASSISTANT_ID;
  const prompt = threadPrompt(course, topic, keywords, questionType, numQuestions);
  const attachments = files.map(id => {
    return { file_id: id, tools: [{ type: "file_search" }]};
  })

  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content: prompt,
        attachments: attachments,
      },
    ]
  })

  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistantID,
  });

  const messages = await openai.beta.threads.messages.list(thread.id, {
    run_id: run.id
  });

  const message = messages.data.pop();
  if (message.content[0].type == 'text') {
    const { text } = message.content[0];
    console.log(text.value);
  }

  // const run = await openai.beta.threads.createAndRun({
  //   assistant_id: assistantID,
  //   thread: {
  //     messages: [
  //       {
  //         role: "user",
  //         content: prompt,
  //         attachments: attachments,
  //       },
  //     ],
  //   },
  // });

  console.log(`[OpenAI] Thread created: ${run.thread_id}`);
  return run;
};

export const retrieveAssistant = async (id) => {
  const assistant = await openai.beta.assistants.retrieve(id);
  return assistant;
};

// export const createVectorStore = async (course, topic, files) => {
//   const vs = await openai.beta.vectorStores.create({
//     name: `${course}-${topic}`,
//     file_ids: files,
//   });
//   console.log(`[OpenAI] Vector store created: id=${vs.id}, name=${vs.name}`);
//   return vs.id;
// }

export const generate = async (options) => {
  const run = await createThreadAndRun(options);
}

export const showMessages = async (id) => {
  const messages = await openai.beta.threads.messages.list(id);
  return messages;
}