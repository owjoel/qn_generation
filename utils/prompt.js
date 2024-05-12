// File specifically for containing long OpenAI queries

export const assistantInstructions =
  "Analyse the uploaded lecture notes PDF, and the reference excel (.xlsx) \
    file which contains sample questions and answers from the vector store in the user message. \
    Based on user input and the lecture note content, generate either similar short-answer \
    questions or multiple choice questions, together with the answers or multiple choices respectively. \
    The output should be an excel file (.xlsx) in the same format as either the SAQ_Template.json or \
    MXQ_Template.json accoridngly in your own assistant vector store.";

export const threadPrompt = (course, topic, keywords, questionType, num) => {
  let specific = "";
  let type = "";
  console.log(questionType, questionType === 'saq');
  if (questionType === "saq") {
    specific = "Provide both questions and answers.";
    type = "short answer questions";
  } else {
    specific =
      "Generate 1 correct answer from the lecture notes and 3 wrong answers using incorrect explanation or technical terms from the notes.";
    type = "multiple choice questions";
  }
  const prompt = 
    `Generate ${num} ${type} relating to ${keywords} in the ${course} ${topic} lecture notes, \
    referencing the sample questions and answers. ${specific}`;
  return prompt;
};