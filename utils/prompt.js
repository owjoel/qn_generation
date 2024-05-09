// File specifically for containing long OpenAI queries
export const topicQuery =
  'Identify the file\'s main theme. It should be written on the first page of the notes. \
    Then identify the file\'s sub-topic: "Automation", "Software Design", \
    "Versioning", "XP", "Software Process", "Security", "Support" or "Testing". It should also \
    be on the first page.\n\n Generate your response as follows: \n\n Main Theme: [Output] \n Sub-Topic: \
    [Output]. \n\n Skip the pleasantries of acknowledging the user and start generating the topic \
    immediately (Meaning, do not start with "Sure, here\'s the topic for..." or "Here\'s the topic for...").';

export const assistantInstructions =
  "Analyse the uploaded lecture notes PDF, and the excel (.xlsx) \
    file with sample questions and answers. Based on user input, \
    generate either similar short-answer questions or multiple choice \
    questions, together with the answers or multiple choices respectively.";

export const threadPrompt = (questionType, num) => {
  let specific = "";
  let type = "";

  if (questionType === "saq") {
    specific = "Provide both question and answer based on the lecture notes.";
    type = "short answer questions";
  } else {
    specific =
      "Generate 1 correct answer from the lecture notes and three wrong answers using incorrect explanation or technical terms from the notes.";
    type = "multiple choice questions";
  }
  return `Generate ${num} ${type} relating to the content in the lecture notes. ${specific}`;
};
