// File specifically for containing long OpenAI queries

export const genAssistantInstructions =
  "Analyse the uploaded lecture notes PDF, and the reference excel (.xlsx) \
  file which contains sample questions and answers from the vector store in the user message. \
  Based on user input and the lecture note content, generate either similar short-answer \
  questions or multiple choice questions, together with the answers or multiple choices respectively. \
  The output should be an excel file (.xlsx) in the same format as either the SAQ_Template.json or \
  MXQ_Template.json accoridngly in your own assistant vector store.";

export const encoderAssistantinstructions = 
  "You are a JSON file creator. A message containing questions and answers will be provided. \
  Use the provided function to return a JSON file."

export const encoderMessage = (type, output) => {
  let format;
  if (type === 'saq') {
    format = JSON.stringify(saqFormat);
  } else if (type === 'mcq') {
    format = JSON.stringify(mcqFormat);
  }
  const prompt = output + '\n format: ' + format;
  return prompt;
}

export const threadPrompt = (course, topic, keywords, questionType, num) => {
  let specific = "";
  let type = "";
  if (questionType === "saq") {
    specific = "Provide both questions and answers.";
    type = "short answer questions";
  } else {
    specific =
      "Generate 1 correct answer from the lecture notes and 3 wrong answers using incorrect explanation or technical terms from the notes.";
    type = "multiple choice questions";
  }
  const prompt = 
    `Generate ${num} ${type} relating to ${keywords} in the ${course} ${topic} lecture notes, ${specific}`;
  return prompt;
};

export const mcqFormat = [{
  "Type": "MCQ",
  "Title": "",
  "Correct": "<Correct Option Number>",
  "Choice_1": "",
  "Choice_2": "",
  "Choice_3": "",
  "Choice_4": ""
},
{
  "Type": "MCQ",
  "Title": "",
  "Correct": "<Correct Option Number>",
  "Choice_1": "",
  "Choice_2": "",
  "Choice_3": "",
  "Choice_4": ""
}]

export const saqFormat = [
  {
    "Type": "OpenQuestion",
    "Title": ""
  },
  {
    "Type": "OpenQuestion",
    "Title": ""
  }
]

/*
  Analyse the input text and extract the questions and answers. Then create a JSON object containing the questions and answers \
    in the following key-value naming: \n ${format} \nDo not change the question type field or the keys. Fill in the values. 
*/