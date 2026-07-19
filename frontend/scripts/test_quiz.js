const TRIVIA_QUESTIONS = [
  {
    "q": "Who is traditionally believed to have brought Christianity to Kerala?",
    "options": [
      "St. Peter",
      "St. Paul",
      "St. Thomas",
      "St. Andrew"
    ],
    "a": "St. Thomas"
  }
];

const dayIndex = 12345;
const salt = 50;
const start = 0;
let mappedQuestions = [];
for (let i = 0; i < 1; i++) {
  const tq = TRIVIA_QUESTIONS[0];
  const isTrueFalse = tq.options.length === 2 && tq.options.includes("True") && tq.options.includes("False");
  mappedQuestions.push({
    id: `dynamic-q-1-0`,
    type: isTrueFalse ? "truefalse" : "mcq",
    question: tq.q,
    options: [...tq.options],
    answer: isTrueFalse ? tq.a === "True" : tq.a,
    explanation: `The correct answer is: ${tq.a}`,
    verse: undefined
  });
}

mappedQuestions.forEach(mq => {
  if (mq.type === "mcq" && mq.options) {
    const hash = dayIndex + mq.question.length;
    if (hash % 2 === 0) {
      mq.options = [...mq.options].reverse();
    }
    if (hash % 3 === 0 && mq.options.length === 4) {
      mq.options = [mq.options[1], mq.options[0], mq.options[3], mq.options[2]];
    }
  }
});

console.log(JSON.stringify(mappedQuestions, null, 2));
