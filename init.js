// import { createJSONFromFile } from "./utils/files.js";

import { showMessages } from "./utils/generate.js";
import { createEncoderAssistant } from "./utils/encoder.js";

// const saqTemplate = './public/SAQ_Template.xlsx';
// const mcqTemplate = './public/MCQ_Template.xlsx';

// createJSONFromFile('SAQ_Template', saqTemplate);
// createJSONFromFile('MCQ_Template', mcqTemplate);
// createJSONFromFile('automation', './public/automation.xlsx'); 

const messages = await showMessages('thread_6EEUsJhhzLae6kZaphrUQV21')
console.log(messages.body.data);

// await createEncoderAssistant();
// console.log('Assistant created');
// messages.body.data[0].content