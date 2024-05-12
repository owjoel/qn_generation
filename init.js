// import { createJSONFromFile } from "./utils/files.js";

import { showMessages } from "./utils/assistant.js";

// const saqTemplate = './public/SAQ_Template.xlsx';
// const mcqTemplate = './public/MCQ_Template.xlsx';

// createJSONFromFile('SAQ_Template', saqTemplate);
// createJSONFromFile('MCQ_Template', mcqTemplate);
// createJSONFromFile('automation', './public/automation.xlsx'); 

const messages = await showMessages('thread_xGjz3stqPB4lMTAfVfdaCcWR')
console.log(messages.body.data[0].content);