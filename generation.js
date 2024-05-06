import fs from "fs";
import readline from "readline";

import { config } from "dotenv";

// Langchain Dependencies
import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { loadQAChain } from "langchain/chains";

// Utilities
import { readFile, utils } from "xlsx";

config();
const openai_key = process.env.OPENAI_API_KEY;

// Function to read and process PDF
const readPDF = async (filename) => {
  const loader = new PDFLoader(filename);
  const splitter = new CharacterTextSplitter({
    separator: "\n",
    chunkSize: 1200,
    chunkOverlap: 200,
  });
  
  const docs = await loader.load();
  const output = await splitter.splitDocuments(docs);
  const embeddings = new OpenAIEmbeddings();
  const vectorstore = await FaissStore.fromDocuments(output, embeddings);
  await vectorstore.save("./data");
  
  const model = new ChatOpenAI({
    apiKey: openai_key,
    model: "gpt-3.5-turbo-0125",
  });
  
  const chain = loadQAChain(model, { type: "stuff" });
}

// Sample CORRECT q&a, with score
const excelFile = "";
const gen = utils.sheet_to_json(readFile(excelFile).Sheets['generate']);
const genQuestions = gen.map(ref => ref['question']);
const genAnswers = gen.map(ref => ref['answer']);
const genScores = gen.map(ref => ref['score']);

let refQuestion = ""
let refAns = ""
for (let i = 0; i < questions.length; i++) {
  refQuestion += `${i+1}. ${genQuestions[i]}`;
  refAns `${i+1}. ${genAnswers[i]}`;
}

// Sample STUDENT answer and score
const scoring = utils.sheet_to_json(readFile(excelFile).Sheets['scoring']);
const scQuestions = scoring.map(ref => ref['question']);
const scAnswers = scoring.map(ref => ref['question']);
const scScores = scoring.map(ref => ref['question']);

let sampleQuestion = ""
let sampleAnswer = ""
let sampleScore = ""
for (let i = 0; i < questions.length; i++) {
  sampleQuestion += `${i+1}. ${scQuestions[i]}`;
  sampleAnswer `${i+1}. ${scAnswers[i]}`;
  sampleScore `${i+1}. ${scScores[i]}`;
}




















// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });
// rl.question("Enter a pdf filename: ", (filename) => {
//   console.log(`filename: ${filename}`);
//   // const buffer = fs.readFileSync(filename);
//   // pdf(buffer).then((data) => console.log(data));
//   // rl.close();
//   process.exit();
// });
