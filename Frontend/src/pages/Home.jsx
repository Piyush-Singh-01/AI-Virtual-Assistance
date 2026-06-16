import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../redux/imageSlice";
import { toast } from "react-toastify";
import userGif from "../assets/user.gif";
import aiGif from "../assets/ai.gif";
import { useEffect, useRef, useState } from "react";
import { IoMdMenu } from "react-icons/io";
import { RxCross2, RxCross1 } from "react-icons/rx";

function Home() {
  const [responseText, setResponseText] = useState("");
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [gif, setGif] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [desktopHistory, setDesktopHistory] = useState(false);
  const [trunk, setTrunk] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((store) => store.image.userData);

  const recognitionRef = useRef(null);

  /* ---------------- LOGOUT ---------------- */
  const logoutUser = async () => {
    try {
      await axios.post(
        "https://backend-ai-virtual-assistance.onrender.com/api/auth/logout",
        {},
        { withCredentials: true }
      );
      dispatch(setUserData(null));
      toast.success("Logout Successfully");
      navigate("/login");
    } catch {
      toast.error("Logout error");
    }
  };

  /* ---------------- ACTION HANDLER ---------------- */
const handleAction = (data) => {
  if (!data || !data.action) {
    speak("Sorry, I did not understand that.");
    return;
  }

  switch (data.action) {
    case "OPEN_URL":
      if (data.url) {
        speak("Opening the website");
        setTimeout(() => window.open(data.url, "_blank"), 500);
      }
      break;

    case "SEARCH_GOOGLE":
      if (data.query) {
        speak(`Searching ${data.query}`);
        setTimeout(() => {
          window.open(
            `https://www.google.com/search?q=${encodeURIComponent(data.query)}`,
            "_blank"
          );
        }, 500);
      }
      break;

    case "SEARCH_YOUTUBE":
      if (data.query) {
        speak(`Searching YouTube for ${data.query}`);
        setTimeout(() => {
          window.open(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(data.query)}`,
            "_blank"
          );
        }, 500);
      }
      break;

    case "PLAY_SONG_YOUTUBE":
      if (data.song) {
        speak(`Playing ${data.song} on YouTube`);
        setTimeout(() => {
          window.open(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(data.song)}`,
            "_blank"
          );
        }, 500);
      }
      break;

    case "OPEN_INSTAGRAM":
      speak("Opening Instagram");
      setTimeout(() => window.open("https://www.instagram.com", "_blank"), 500);
      break;

    case "WRITE_TEXT":
      if (data.text) {
        setResponseText(data.text);
        speak(data.text);
      }
      break;

    case "ANSWER_QUESTION":
      if (data.answer) {
        setResponseText(data.answer);
        speak(data.answer);
      }
      break;

    case "ASK_CLARIFICATION":
      if (data.question) {
        setResponseText(data.question);
        speak(data.question);
      }
      break;

    case "IGNORE":
      break;

    default:
      speak("Sorry, I cannot do that yet.");
  }
};

  /* ---------------- API CALL ---------------- */
  const handleGeminiCall = async (command) => {
    try {
      const res = await axios.post(
        "https://backend-ai-virtual-assistance.onrender.com/api/user/getData",
        { command },
        { withCredentials: true }
      );

      await handleAction(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- SPEAK ---------------- */
  const speak = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";

    utterance.onstart = () => {
      setGif(true);
      recognitionRef.current?.stop();
    };

    utterance.onend = () => {
      setGif(false);
      recognitionRef.current?.start();
    };

    window.speechSynthesis.speak(utterance);
  };

  /* ---------------- UNLOCK AUDIO ---------------- */
  const unlockAudio = () => {
    if (audioUnlocked) return;

    const u = new SpeechSynthesisUtterance(" ");
    window.speechSynthesis.speak(u);

    setAudioUnlocked(true);
    speak("Hello, how can I help you Today?");
  };

  /* ---------------- SPEECH RECOGNITION ---------------- */
  useEffect(() => {
    if (!userData?.assistantName) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = true;

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
        console.log(transcript);
      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {  
        await handleGeminiCall(transcript);
      }
    };

    recognition.onend = () => {
      if (!window.speechSynthesis.speaking) recognition.start();
    };

    recognition.start();

    return () => recognition.stop();
  }, [userData]);

  /* ---------------- DELETE HISTORY ---------------- */
  const deleteHistory = async (index) => {
    try {
      const res = await axios.delete(
        `https://backend-ai-virtual-assistance.onrender.com/api/user/history/${index}`,
        { withCredentials: true }
      );
      toast.success(res.data.msg);
      dispatch(setUserData(res.data.user));
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-t from-black to-[#0a0a32] flex flex-col items-center justify-center text-center">
      <h1 className="text-white m-2">Please Include the AI name <b className="text-green-700">'{userData?.assistantName}'</b> in every voice command</h1>
      {/* Assistant */}
      <div className="flex flex-col items-center pt-6">
        <img
          src={userData?.assistantImage}
          className="w-[220px] h-[350px] rounded-2xl object-cover"
          alt=""
        />
        <h1 className="text-white text-xl mt-2">
          Hi, I'm <b>{userData?.assistantName}</b>, Your AI Assistant
        </h1>
      </div>

      {/* Voice Button */}
      <img
        onClick={unlockAudio}
        src={gif ? aiGif : userGif}
        className="w-32 h-32 cursor-pointer"
        alt=""
        title={audioUnlocked ? "Listening..." : "Click to activate voice"}
      />
         {!audioUnlocked && (
         <p className="text-gray-400 text-sm mt-2">
           Click the button above to activate voice assistance.
         </p>
         )}

      {/* MOBILE MENU */}
      <IoMdMenu
        onClick={() => setMobileMenu(true)}
        className="absolute top-4 right-6 text-white text-2xl lg:hidden"
      />

      {mobileMenu && (
        <div className="pt-12 lg:hidden fixed top-0 right-0 w-full max-w-[400px] h-screen bg-black/30 backdrop-blur flex flex-col p-4 gap-4">
          <RxCross2
            onClick={() => setMobileMenu(false)}
            className="text-white text-2xl self-end absolute top-2 left-4"
          />

          <button onClick={logoutUser} className="bg-blue-900 px-4 py-1 mt-4  rounded text-white">
            Logout
          </button>

          <button onClick={() => navigate("/assis-img")} className="bg-blue-900 px-4 py-1 rounded text-white">
            Customize Assistant
          </button>

          <div className="overflow-y-auto mt-4">
            {userData?.history?.map((h, i) => (
              <div key={i} className="flex gap-2 text-white">
                <span>{i + 1}.</span>
                <p className={`${trunk && "truncate"}`}>{h}</p>
                <RxCross1 onClick={() => deleteHistory(i)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DESKTOP HISTORY */}
      <IoMdMenu
        onClick={() => setDesktopHistory(true)}
        className="absolute top-4 left-6 text-white text-2xl hidden lg:block"
      />

      {desktopHistory && (
        <div className="fixed top-0 left-0 w-[400px] h-full bg-black/30 backdrop-blur p-4">
          <RxCross2
            onClick={() => setDesktopHistory(false)}
            className="text-white text-2xl"
          />

          {userData?.history?.map((h, i) => (
            <div key={i} className="flex gap-2 text-white mt-2">
              <span>{i + 1}.</span>
              <p className={`${trunk && "truncate"}`}>{h}</p>
              <RxCross1 onClick={() => deleteHistory(i)} />
            </div>
          ))}
        </div>
      )}

      {/* we use hidden to hide our button on the small display because we cannot do sm:hidden and lg:flex is use to display on the large device */}
      <div className="hidden absolute lg:flex flex-col items-center gap-4 top-4 right-2"> 
        <button onClick={logoutUser}
          className="bg-blue-900 px-4 py-1 rounded-2xl text-white " >Logout
        </button>
        
        <button onClick={()=> navigate("/assis-img")}
          className="bg-blue-900 px-2 py-1 rounded-2xl text-white">Customize your Assistant
        </button>
      </div>

      {/* Response */}
      {responseText && (
        <p className="text-white mt-6 text-center w-[80%]">
          {responseText}
        </p>
      )}
    </main>
  );
}

export default Home;
