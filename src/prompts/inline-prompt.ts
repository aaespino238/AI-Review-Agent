import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import { PRSuggestion } from "../constants";

const INLINE_FIX_FUNCTION = `{
  name: "fix",
  description: "The code fix to address the suggestion and rectify the issue",
  parameters: {
    type: "object",
    properties: {
      comment: {
        type: "string",
        description: "Why this change improves the code",
      },
      code: {
        type: "string",
        description: "Modified Code Snippet",
      },
      lineStart: {
        type: "number",
        description: "Starting Line Number",
      },
      lineEnd: {
        type: "number",
        description: "Ending Line Number",
      },
    },
    required: ["comments", "code", "lineStart", "lineEnd"],
  },
};`

const OUTPUT_FORMAT = `{
  suggestions: [
    {
      "comment": "Your suggestion here",
      "code": "Your code here",
      "lineStart": "Starting line number here",
      "lineEnd": "Ending line number here"
    },
  ]
}`

export const INLINE_FIX_PROMPT = `In this task, you are provided with a code suggestion in XML format, along with the corresponding file content. Your task is to radiate from this suggestion and draft a precise code fix. Here's how your input will look:

\`\`\`xml
  <suggestion>
    <describe> Description of suggestion </describe>
    <type> Type of suggestion </type>
    <comment> Suggestion comments </comment>
    <code> Original Code </code>
    <filename> File Name </filename>
  </suggestion>
\`\`\`

The 'comment' field contains specific code modification instructions. Based on these instructions, you're required to formulate a precise code fix. Bear in mind that the fix must include only the lines between the starting line (linestart) and ending line (lineend) where the changes are applied.

The adjusted code doesn't necessarily need to be standalone valid code, but when incorporated into the corresponding file, it must result in valid, functional code, without errors. Ensure to include only the specific lines affected by the modifications. Avoid including placeholders such as 'rest of code...'

Your task is to help another fixer agent who has access to the following "fix" tool

${INLINE_FIX_FUNCTION}

You need to help this fixer agent by providing it the necessary parameters to execute the "fix" tool. In other words you need to provide the most appropriate values for the parameters to "fix" based on the suggestion above. 

MAKE SURE YOUR OUTPUT IS VALID JSON in the following format

${OUTPUT_FORMAT}

THE OUTPUT SHOULD CONSIST OF THE JSON AND ONLY THE JSON.  MAKE SURE THAT THE OUTPUT CAN BE PARSED INTO A JSON.
`;

const INLINE_USER_MESSAGE_TEMPLATE = `{SUGGESTION}

{FILE}`;

const assignFullLineNumers = (contents: string): string => {
  const lines = contents.split("\n");
  let lineNumber = 1;
  const linesWithNumbers = lines.map((line) => {
    const numberedLine = `${lineNumber}: ${line}`;
    lineNumber++;
    return numberedLine;
  });
  return linesWithNumbers.join("\n");
};

export const getInlineFixPrompt = (
  fileContents: string,
  suggestion: PRSuggestion
): ChatCompletionMessageParam[] => {
  const userMessage = INLINE_USER_MESSAGE_TEMPLATE.replace(
    "{SUGGESTION}",
    suggestion.toString()
  ).replace("{FILE}", assignFullLineNumers(fileContents));
  console.log(INLINE_FIX_PROMPT)
  console.log(userMessage)
  return [
    { role: "system", content: INLINE_FIX_PROMPT },
    { role: "user", content: userMessage },
  ];
};
