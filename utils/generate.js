import fs from "fs";
import { config } from "dotenv";
import OpenAI from "openai";

import { threadPrompt } from "./prompt.js";

config();
const openai = new OpenAI();

// Upload file to OpenAI
export const addFile = async (filepath) => {
  const f = await openai.files.create({
    file: fs.createReadStream(filepath),
    purpose: "assistants",
  });
  console.log(`[OpenAI] Uploaded file: ${f.filename}`);
  return f.id;
};

export const deleteFile = async (fileID) => {
  const f = await openai.files.del(fileID);
  if (f.deleted) {
    console.log("[OpenAI] Deleted file " + fileID);
    return true;
  }
  return false;
}

// 
export async function generate(options) {
  const {course, topic, keywords, questionType, numQuestions, files} = options;
  const assistantID = process.env.OPENAI_ASSISTANT_GENERATOR;
  const prompt = threadPrompt(course, topic, keywords, questionType, numQuestions);
  const attachments = files.map(id => {
    return { file_id: id, tools: [{ type: "file_search" }]};
  })

  const thread = await openai.beta.threads.create({
    messages: [{
        role: "user",
        content: prompt,
        attachments: attachments,
    }]
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
    console.log(`[OpenAI] Thread created: ${run.thread_id}`);
    return text.value;
  }
  return null;
};