const axios = require("axios");
const getCurrentDateTime = require("./utils/currentDateTime");

// const OLLAMA_MODEL = "gemma3:4b";
const OLLAMA_MODEL = "llama3.2:3b";


const ALLOWED_ACTIONS = new Set([
  "OPEN_URL",
  "SEARCH_GOOGLE",
  "SEARCH_YOUTUBE",
  "PLAY_SONG_YOUTUBE",
  "OPEN_INSTAGRAM",
  "UPDATE_INSTAGRAM_BIO",
  "WRITE_TEXT",
  "ANSWER_QUESTION",
  "ASK_CLARIFICATION",
  "IGNORE",
  "UNKNOWN",
]);

function escapeRegExp(str = "") {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(input = "") {
  return String(input).replace(/\s+/g, " ").trim();
}

function lowerText(input = "") {
  return normalizeText(input).toLowerCase();
}

function stripWakeWord(command, assistantName) {
  const wake = normalizeText(assistantName);
  if (!wake) return normalizeText(command);

  const re = new RegExp(`\\b${escapeRegExp(wake)}\\b`, "gi");
  return normalizeText(String(command).replace(re, " "));
}

function extractSearchQuery(cleaned, triggerWords) {
  let text = cleaned;

  for (const word of triggerWords) {
    const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
    text = text.replace(re, " ");
  }

  text = text
    .replace(/\bon youtube\b/gi, " ")
    .replace(/\bon google\b/gi, " ")
    .replace(/\bsearch\b/gi, " ")
    .replace(/\bfind\b/gi, " ")
    .replace(/\blook up\b/gi, " ")
    .replace(/\bplease\b/gi, " ")
    .replace(/\bfor me\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

function localCommand(command, assistantName, date, day, time) {
  const lower = lowerText(command);
  const wake = lowerText(assistantName);

  if (!wake) {
    return { action: "IGNORE" };
  }

  if (!lower.includes(wake)) {
    return { action: "IGNORE" };
  }

  const cleaned = lowerText(stripWakeWord(command, assistantName));

  if (
    cleaned === "" ||
    cleaned === "hi" ||
    cleaned === "hello" ||
    cleaned === "hey" ||
    cleaned === "ok" ||
    cleaned === "okay"
  ) {
    return {
      action: "ANSWER_QUESTION",
      answer: "Hello! How can I help you today?",
    };
  }

  if (cleaned.includes("open youtube") || cleaned.includes("go to youtube")) {
    return {
      action: "OPEN_URL",
      url: "https://www.youtube.com",
    };
  }

  if (cleaned.includes("open google") || cleaned.includes("go to google")) {
    return {
      action: "OPEN_URL",
      url: "https://www.google.com",
    };
  }

  if (
    cleaned.includes("open chatgpt") ||
    cleaned.includes("open chat gpt")
  ) {
    return {
      action: "OPEN_URL",
      url: "https://chat.openai.com",
    };
  }

  if (cleaned.includes("open gemini")) {
    return {
      action: "OPEN_URL",
      url: "https://gemini.google.com",
    };
  }

  if (cleaned.includes("open linkedin")) {
    return {
      action: "OPEN_URL",
      url: "https://www.linkedin.com",
    };
  }

  if (cleaned.includes("open whatsapp") || cleaned.includes("open whatsapp web")) {
    return {
      action: "OPEN_URL",
      url: "https://web.whatsapp.com",
    };
  }

  if (cleaned.includes("open facebook")) {
    return {
      action: "OPEN_URL",
      url: "https://www.facebook.com",
    };
  }

  if (
    cleaned.includes("open my portfolio") ||
    cleaned.includes("open portfolio")
  ) {
    return {
      action: "OPEN_URL",
      url: "https://portfolio-fawn-one-53.vercel.app/",
    };
  }

  if (cleaned.includes("open instagram")) {
    return { action: "OPEN_INSTAGRAM" };
  }

  if (
    cleaned.includes("what time is it") ||
    cleaned.includes("current time") ||
    cleaned === "time" ||
    cleaned.includes("tell me the time")
  ) {
    return {
      action: "ANSWER_QUESTION",
      answer: `The current time is ${time}.`,
    };
  }

  if (
    cleaned.includes("what is today's date") ||
    cleaned.includes("today date") ||
    cleaned.includes("current date") ||
    cleaned === "date"
  ) {
    return {
      action: "ANSWER_QUESTION",
      answer: `Today's date is ${date}, ${day}.`,
    };
  }

  if (
    cleaned.includes("who made you") ||
    cleaned.includes("who created you") ||
    cleaned.includes("who built you")
  ) {
    return {
      action: "ANSWER_QUESTION",
      answer:
        "I was created by Piyush Singh. He built this assistant with strong MERN stack work and a very impressive project setup.",
    };
  }

  if (
    cleaned.startsWith("search ") ||
    cleaned.startsWith("find ") ||
    cleaned.startsWith("look up ") ||
    cleaned.includes("search on youtube") ||
    cleaned.includes("find on youtube") ||
    cleaned.includes("play song on youtube") ||
    cleaned.includes("play on youtube")
  ) {
    if (cleaned.includes("youtube")) {
      const query = extractSearchQuery(cleaned, [
        "search",
        "find",
        "look up",
        "play",
        "song",
        "on youtube",
        "youtube",
      ]);

      if (query) {
        if (cleaned.includes("play")) {
          return { action: "PLAY_SONG_YOUTUBE", song: query };
        }

        return { action: "SEARCH_YOUTUBE", query };
      }
    }

    const query = extractSearchQuery(cleaned, [
      "search",
      "find",
      "look up",
      "google",
    ]);

    if (query) {
      return { action: "SEARCH_GOOGLE", query };
    }
  }

  return null;
}

function buildSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["action"],
    properties: {
      action: {
        type: "string",
        enum: [
          "OPEN_URL",
          "SEARCH_GOOGLE",
          "SEARCH_YOUTUBE",
          "PLAY_SONG_YOUTUBE",
          "OPEN_INSTAGRAM",
          "UPDATE_INSTAGRAM_BIO",
          "WRITE_TEXT",
          "ANSWER_QUESTION",
          "ASK_CLARIFICATION",
          "IGNORE",
          "UNKNOWN",
        ],
      },
      url: { type: "string" },
      query: { type: "string" },
      song: { type: "string" },
      text: { type: "string" },
      answer: { type: "string" },
      question: { type: "string" },
    },
  };
}

function cleanModelText(text = "") {
  return String(text)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function extractJsonObject(text = "") {
  const cleaned = cleanModelText(text);

  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");

    if (first !== -1 && last !== -1 && last > first) {
      const slice = cleaned.slice(first, last + 1);
      try {
        return JSON.parse(slice);
      } catch {
        return null;
      }
    }

    return null;
  }
}

function validateResponse(obj) {
  if (!obj || typeof obj !== "object") return null;

  const action = obj.action;
  if (!action || !ALLOWED_ACTIONS.has(action)) return null;

  return obj;
}

const ollamaResponse = async (command, assistantName, userName) => {
  try {
    const { date, time, day } = getCurrentDateTime();

    const local = localCommand(command, assistantName, date, day, time);
    if (local) {
      return JSON.stringify(local);
    }

    const prompt = `
You are a smart AI Virtual Assistant created by PIYUSH SINGH.

Return ONLY a single valid JSON object that matches the schema.
Do not output markdown, backticks, explanations, or extra text.

Important rules:
- If the command is a normal question, return "ANSWER_QUESTION".
- Do NOT turn natural questions into SEARCH_GOOGLE.
- Use SEARCH_GOOGLE only when the user explicitly asks to search, google, find, or look up something.
- Use SEARCH_YOUTUBE only when the user explicitly asks to search on YouTube.
- Use PLAY_SONG_YOUTUBE only when the user explicitly asks to play a song on YouTube.
- If the command is unclear, return "ASK_CLARIFICATION".
- If the assistant name is missing, return "IGNORE".

Assistant Name: ${assistantName}
User Name: ${userName}
Current Date: ${date}
Current Day: ${day}
Current Time: ${time}

Examples:
User: "${assistantName} what is web development"
Response: {"action":"ANSWER_QUESTION","answer":"Web development is the process of building websites and web applications..."}

User: "${assistantName} search web development"
Response: {"action":"SEARCH_GOOGLE","query":"web development"}

User: "${assistantName} search song on youtube apna bana le"
Response: {"action":"SEARCH_YOUTUBE","query":"apna bana le"}

User: "${assistantName} open youtube"
Response: {"action":"OPEN_URL","url":"https://www.youtube.com"}

User: "${assistantName} open my portfolio"
Response: {"action":"OPEN_URL","url":"https://portfolio-fawn-one-53.vercel.app/"}

Now process this command:
${command}
`;

    const res = await axios.post("http://localhost:11434/api/chat", {
      model: OLLAMA_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a JSON-only assistant. Never return markdown. Follow the JSON schema exactly.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      format: buildSchema(),
      options: {
        temperature: 0,
        top_p: 0.9,
        num_predict: 220,
      },
    });

    const text = res.data?.message?.content;

    console.log("OLLAMA RAW RESPONSE:", text);

    if (!text) {
      return JSON.stringify({ action: "UNKNOWN" });
    }

    let parsed = extractJsonObject(text);

    if (!parsed) {
      return JSON.stringify({ action: "UNKNOWN" });
    }

    parsed = validateResponse(parsed);

    if (!parsed) {
      return JSON.stringify({ action: "UNKNOWN" });
    }

    return JSON.stringify(parsed);
  } catch (error) {
    console.error("Ollama Error:", error.response?.data || error.message);
    return JSON.stringify({ action: "UNKNOWN" });
  }
};

module.exports = ollamaResponse;