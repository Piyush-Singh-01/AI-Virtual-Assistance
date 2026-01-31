const handleAction = (data) => {
  if (!data || !data.action) {
    speak("Sorry, I did not understand that.");
    return;
  }

  switch (data.action) {
    /* ---------- OPEN DIRECT URL ---------- */
    case "OPEN_URL":
      if (data.url) {
        window.open(data.url, "_blank");
        speak("Opening the website");
      } else {
        speak("I need a valid website link.");
      }
      break;

    /* ---------- YOUTUBE ---------- */
    case "OPEN_YOUTUBE":
      window.open("https://www.youtube.com", "_blank");
      speak("Opening YouTube");
      break;

    case "SEARCH_YOUTUBE":
      if (data.query) {
        window.open(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(
            data.query
          )}`,
          "_blank"
        );
        speak(`Searching ${data.query} on YouTube`);
      } else {
        speak("What should I search on YouTube?");
      }
      break;

    case "PLAY_SONG_YOUTUBE":
      if (data.song) {
        window.open(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(
            data.song
          )}`,
          "_blank"
        );
        speak(`Playing ${data.song}`);
      } else {
        speak("Which song should I play?");
      }
      break;

    /* ---------- GOOGLE ---------- */
    case "SEARCH_GOOGLE":
      if (data.query) {
        window.open(
          `https://www.google.com/search?q=${encodeURIComponent(data.query)}`,
          "_blank"
        );
        speak(`Searching ${data.query} on Google`);
      } else {
        speak("What should I search on Google?");
      }
      break;

    /* ---------- SOCIAL MEDIA ---------- */
    case "OPEN_INSTAGRAM":
      window.open("https://www.instagram.com", "_blank");
      speak("Opening Instagram");
      break;

    case "OPEN_FACEBOOK":
      window.open("https://www.facebook.com", "_blank");
      speak("Opening Facebook");
      break;

    case "OPEN_TWITTER":
      window.open("https://twitter.com", "_blank");
      speak("Opening Twitter");
      break;

    case "OPEN_LINKEDIN":
      window.open("https://www.linkedin.com", "_blank");
      speak("Opening LinkedIn");
      break;

    /* ---------- TEXT / ANSWERS ---------- */
    case "ANSWER_QUESTION":
      if (data.answer) {
        setResponseText(data.answer);
        speak(data.answer);
      } else {
        speak("I don't have an answer for that.");
      }
      break;

    case "WRITE_TEXT":
      if (data.text) {
        setResponseText(data.text);
        speak("Here is what I wrote.");
      }
      break;

    case "ASK_CLARIFICATION":
      if (data.question) {
        speak(data.question);
      }
      break;

    /* ---------- IGNORE ---------- */
    case "IGNORE":
      // Do nothing intentionally
      break;

    /* ---------- UNKNOWN ---------- */
    default:
      speak("Sorry, I cannot do that yet.");
  }
};
