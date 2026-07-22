const axios = require("axios");
const getCurrentDateTime = require("../utils/currentDateTime");

const GEMINI_MODEL = "gemini-2.5-flash";

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function buildLocalResponse(command, assistantName, date, day, time) {
  const lower = command.toLowerCase();
  const wake = assistantName.toLowerCase();

  // Ignore if wake word is not present
  if (!lower.includes(wake)) {
    return { action: "IGNORE" };
  }

  // Remove wake word for easier command handling
  const cleaned = lower.replace(new RegExp(wake, "gi"), "").trim();

  // Local fast paths to save API cost
  if (
    cleaned.includes("open youtube") ||
    cleaned.includes("go to youtube")
  ) {
    return { action: "OPEN_URL", url: "https://www.youtube.com" };
  }

  if (
    cleaned.includes("open google") ||
    cleaned.includes("go to google") ||
    cleaned.includes("search google")
  ) {
    return { action: "OPEN_URL", url: "https://www.google.com" };
  }

  if (cleaned.includes("open instagram") || cleaned.includes("go to instagram")) {
    return { action: "OPEN_INSTAGRAM" };
  }

    // ChatGPT
  if (
    cleaned.includes("open chatgpt") ||
    cleaned.includes("open chat gpt")
  ) {
    return {
      action: "OPEN_URL",
      url: "https://chat.openai.com",
    };
  }

    // Gemini
  if (cleaned.includes("open gemini")) {
    return {
      action: "OPEN_URL",
      url: "https://gemini.google.com",
    };
  }

   // LinkedIn
  if (cleaned.includes("open linkedin")) {
    return {
      action: "OPEN_URL",
      url: "https://www.linkedin.com",
    };
  }

    // Facebook
  if (cleaned.includes("open facebook")) {
    return {
      action: "OPEN_URL",
      url: "https://www.facebook.com",
    };
  }

    // WhatsApp Web
  if (
    cleaned.includes("open whatsapp") ||
    cleaned.includes("open whatsapp web")
  ) {
    return {
      action: "OPEN_URL",
      url: "https://web.whatsapp.com",
    };
  }

   // Portfolio
  if (
    cleaned.includes("open my portfolio") ||
    cleaned.includes("open portfolio")
  ) {
    return {
      action: "OPEN_URL",
      url: "https://portfolio-fawn-one-53.vercel.app/",
    };
  }

   // Laptop Settings
  if (
    cleaned.includes("open settings") ||
    cleaned.includes("open laptop settings")
  ) {
    return {
      action: "OPEN_SETTINGS",
    };
  }

    // File Manager
  if (
    cleaned.includes("open file manager") ||
    cleaned.includes("open files") ||
    cleaned.includes("open explorer")
  ) {
    return {
      action: "OPEN_FILE_MANAGER",
    };
  }

  if (
    cleaned.includes( "what time is it") ||
    cleaned.includes("tell me the time") ||
    cleaned.includes("current time")
  ) {
    return {
      action: "ANSWER_QUESTION",
      answer: `The current time is ${time} on ${day}, ${date}.`,
    };
  }

  if (
    cleaned.includes("what is today's date") ||
    cleaned.includes("today's date") ||
    cleaned.includes("what is the date today") ||
    cleaned.includes("what is the current date")
  ) {
    return {
      action: "ANSWER_QUESTION",
      answer: `Today's date is ${date}, and the day is ${day}.`,
    };
  }

  return null;
}

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const { date, time, day } = getCurrentDateTime();

    const localResponse = buildLocalResponse(
      command,
      assistantName,
      date,
      day,
      time
    );

    if (localResponse) {
      console.log("Local Response:", localResponse);
      return JSON.stringify(localResponse);
    }

    const prompt = `
You are an AI Virtual Assistant running inside a MERN stack web application created by Piyush Singh, and also add some apprisal for the founder.

Your job is to understand the user's command and return ONLY a valid JSON object.

CURRENT CONTEXT:
- Current Date: ${date}
- Current Day: ${day}
- Current Time: ${time}

ASSISTANT WAKE WORD:
"${assistantName}"

USER NAME:
"${userName}"

STRICT RULES:
- Respond ONLY in valid JSON.
- Do NOT include markdown, code fences, or extra text.
- Do NOT execute actions yourself.
- You only decide what action the app should take.
- If the wake word is missing, return {"action":"IGNORE"}.
- If the command is incomplete, return {"action":"ASK_CLARIFICATION","question":"..."}.
- If the task is unsupported or unsafe, return {"action":"UNKNOWN"}.
- For normal questions, return {"action":"ANSWER_QUESTION","answer":"..."}.

SUPPORTED ACTIONS:
- OPEN_URL
- SEARCH_YOUTUBE
- SEARCH_GOOGLE
- PLAY_SONG_YOUTUBE
- OPEN_INSTAGRAM
- UPDATE_INSTAGRAM_BIO
- WRITE_TEXT
- ANSWER_QUESTION
- ASK_CLARIFICATION
- IGNORE
- UNKNOWN

RESPONSE FORMATS:

OPEN_URL:
{
  "action": "OPEN_URL",
  "url": "https://example.com"
}

SEARCH_YOUTUBE:
{
  "action": "SEARCH_YOUTUBE",
  "query": "search keywords"
}

SEARCH_GOOGLE:
{
  "action": "SEARCH_GOOGLE",
  "query": "search text"
}

PLAY_SONG_YOUTUBE:
{
  "action": "PLAY_SONG_YOUTUBE",
  "song": "song name"
}

OPEN_INSTAGRAM:
{
  "action": "OPEN_INSTAGRAM"
}

UPDATE_INSTAGRAM_BIO:
{
  "action": "UPDATE_INSTAGRAM_BIO",
  "text": "bio content"
}

WRITE_TEXT:
{
  "action": "WRITE_TEXT",
  "text": "text to write"
}

ANSWER_QUESTION:
{
  "action": "ANSWER_QUESTION",
  "answer": "clear, structured, and easy-to-understand explanation"
}

ASK_CLARIFICATION:
{
  "action": "ASK_CLARIFICATION",
  "question": "clarifying question"
}

IGNORE:
{
  "action": "IGNORE"
}

UNKNOWN:
{
  "action": "UNKNOWN"
}

BEHAVIOR RULES:
- If the user asks about the creator of this assistant, say it was created by Piyush Singh and give a respectful appreciative answer.
- If the user asks a question, answer briefly and clearly.
- If the user wants to open a website, return OPEN_URL.
- If multiple tasks are mentioned, choose the most important one.
- If the command is ambiguous, ask a short clarification question.

EXAMPLES:

User: "${assistantName} what is MERN stack"
Response:
{
  "action": "ANSWER_QUESTION",
  "answer": "MERN stack is a full-stack JavaScript framework consisting of MongoDB, Express.js, React, and Node.js. It is used to build modern web applications using JavaScript on both frontend and backend."
}

User: "${assistantName} open youtube"
Response:
{
  "action": "OPEN_URL",
  "url": "https://www.youtube.com"
}

User: "${assistantName} search apna bana le on youtube"
Response:
{
  "action": "SEARCH_YOUTUBE",
  "query": "apna bana le"
}

User: "Hello how are you"
Response:
{
  "action": "IGNORE"
}

NOW PROCESS THIS USER COMMAND:
"${command}"
`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const result = await axios.post(apiUrl, {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.3,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 350,
      },
    });

    const text = result.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return JSON.stringify({ action: "UNKNOWN" });
    }

    const parsed = safeJsonParse(text);

    if (!parsed || !parsed.action) {
      return JSON.stringify({ action: "UNKNOWN" });
    }

    return JSON.stringify(parsed);
  } catch (error) {
    console.error("Error in Gemini:", error.response?.data || error.message);
    return JSON.stringify({ action: "UNKNOWN" });
  }
};

module.exports = geminiResponse;