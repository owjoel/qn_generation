// Uses an OpenAI assistant for converting text content to a JSON format for xlsx to parse

import { config } from "dotenv";
import OpenAI from "openai";
import { encoderAssistantinstructions, encoderMessage, mcqFormat, saqFormat } from "./prompt.js";

config();
const openai = new OpenAI();

export async function createEncoderAssistant() {
  const assistant = openai.beta.assistants.create({
    name: "JSON Encoder",
    instructions: encoderAssistantinstructions,
    model: "gpt-3.5-turbo-0125",
    tools: [
      {
        type: "function",
        function: {
          name: "createJSON",
          description: "Analyse question and answer text and generate serialisable JSON",
          parameters: {
            type: "object",
            properties: {
              input: {
                type: "string",
                description: "The input containing questions and answers to format to JSON"
              }
            }
          },
          required: ["input"]
        }
      }
    ],
    response_format: { type: "json_object" }
  });
  if (assistant) {
    console.log('Assistant created');
    return assistant;
  }
  return null;
}

async function handleRequiresAction(run, output, type) {
  const threadID = run.thread_id;
  if (
    run.required_action &&
    run.required_action.submit_tool_outputs &&
    run.required_action.submit_tool_outputs.tool_calls
  ) {
    const toolOutputs = run.required_action.submit_tool_outputs.tool_calls.map(
      tool => {
        console.log(tool.function.name);
        if (tool.function.name === "getOutputFormat") {
          return {
            tool_call_id: tool.id,
            output: (type === 'saq') ? JSON.stringify(saqFormat) : JSON.stringify(mcqFormat),
          }
        } else if (tool.function.name === 'createJSON') {
          return {
            tool_call_id: tool.id,
            output: encoderMessage(output, type),
          }
        }
      }
    );

    if (toolOutputs.length > 0) {
      run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
        threadID,
        run.id,
        { tool_outputs: toolOutputs },
      );
      console.log("Tool outputs submitted successfully");
    } else {
      console.log("No tool outputs to submit");
    }
    return handleRunStatus(run, output, type);
  }
}

async function handleRunStatus(run, output, type) {
  if (run.status === 'completed') {
    console.log(run.status);
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    // console.log(messages.data[0].content[0].text.value);
    return messages.data[0].content[0].text.value;
  } else if (run.status === 'requires_action') {
    console.log(run.status);
    return await handleRequiresAction(run, output, type);
  } else {
    console.error('Run did not complete: ', run);
  }
}

export async function encodeToJSON(type, output) {
  const assistantID = process.env.OPENAI_ASSISTANT_ENCODER;
  const thread = await openai.beta.threads.create();
  const message = openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: encoderMessage(type, output),
  });
  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistantID,
  });
  const jsonString = await handleRunStatus(run, output, type);
  if (!jsonString) {
    return null;
  }
  const result = JSON.parse(jsonString).output;
  return result;
}
