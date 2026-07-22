import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../redux/imageSlice";
import { toast } from "react-toastify";
import userGif from "../assets/user.gif";
import aiGif from "../assets/ai.gif";
import { useEffect, useRef, useState } from "react";
import { IoMdMenu } from "react-icons/io";
import { RxCross2, RxCross1 } from "react-icons/rx";
import api from "../api/axios";


function Home() {
  const [responseText, setResponseText] = useState("");
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [gif, setGif] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [desktopHistory, setDesktopHistory] = useState(false);
  const [trunk, setTrunk] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [websiteModal, setWebsiteModal] = useState({
          open: false,
          title: "",
          message: "",
          url: "",
          buttonText: "",
          icon: "🌐",
        });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((store) => store.image.userData);

  const recognitionRef = useRef(null);

  //  LOGOUT 
  const logoutUser = async () => {
    try {
      await api.post("/auth/logout",{});
      dispatch(setUserData(null));
      toast.success("Logout Successfully");
      navigate("/login");
    } catch {
      toast.error("Logout error");
    }
  };

  
const closeWebsiteModal = () => {
  setWebsiteModal({
    open: false,
    title: "",
    message: "",
    url: "",
    buttonText: "",
    icon: "🌐",
  });
};

  const openWebsiteModal = ({
    title,
    message,
    url,
    buttonText,
    icon = "🌐",
  }) => {
    setWebsiteModal({
      open: true,
      title,
      message,
      url,
      buttonText,
      icon,
    });
  };

const executeWebsiteAction = () => {
  if (!websiteModal.url) return;

  window.open(
    websiteModal.url,
    "_blank",
    "noopener,noreferrer"
  );

  closeWebsiteModal();
};

//  ACTION HANDLER 
const handleAction = (data) => {
  if (!data || !data.action) {
    speak("Sorry, I did not understand that.");
    return;
  }

  switch (data.action) {
 case "OPEN_URL":
  if (data.url) {
    speak("I found the website.");

    openWebsiteModal({
      title: "Open Website",
      message: "Jarvis found the requested website.\nDo you want to open it in a new tab?",
      url: data.url,
      buttonText: "Open Website",
      icon: "🌐",
    });
  }
  break;

case "SEARCH_GOOGLE":
  if (data.query) {

    speak(`Searching Google for ${data.query}`);

    openWebsiteModal({
      title: "Google Search",
      message: `Search Google for "${data.query}"?`,
      url: `https://www.google.com/search?q=${encodeURIComponent(
        data.query
      )}`,
      buttonText: "Search Google",
      icon: "🔍",
    });

  }
  break;

case "SEARCH_YOUTUBE":
  if (data.query) {

    speak(`Searching YouTube for ${data.query}`);

    openWebsiteModal({
      title: "YouTube",
      message: `Search YouTube for "${data.query}"?`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        data.query
      )}`,
      buttonText: "Open YouTube",
      icon: "📺",
    });

  }
  break;

case "PLAY_SONG_YOUTUBE":
  if (data.song) {

    speak(`Playing ${data.song}`);

    openWebsiteModal({
      title: "Play Song",
      message: `Play "${data.song}" on YouTube?`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        data.song
      )}`,
      buttonText: "Play Song",
      icon: "🎵",
    });

  }
  break;

case "OPEN_INSTAGRAM":

  speak("Opening Instagram");

  openWebsiteModal({
    title: "Instagram",
    message: "Open Instagram in a new tab?",
    url: "https://www.instagram.com",
    buttonText: "Open Instagram",
    icon: "📷",
  });

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

  //  API CALL 
  const handleGeminiCall = async (command) => {
    try {
      const res = await api.post(
        "/user/getData",
        { command },
        { withCredentials: true }
      );
      console.log("Frontend 2", res);
      await handleAction(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  //  SPEAK 
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

  // UNLOCK AUDIO 
  const unlockAudio = () => {
    if (audioUnlocked) return;

    const u = new SpeechSynthesisUtterance(" ");
    window.speechSynthesis.speak(u);

    setAudioUnlocked(true);
    speak("Hello, how can I help you Today?");
  };

  //  SPEECH RECOGNITION 
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

  // DELETE HISTORY 
  const deleteHistory = async (index) => {
    try {
      const res = await api.delete(`/user/history/${index}`);
      
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

    {
      websiteModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1030] shadow-2xl overflow-hidden">

            <div className="p-8 text-center">

              <div className="text-6xl mb-4">
                {websiteModal.icon}
              </div>

              <h2 className="text-2xl font-bold text-white">
                {websiteModal.title}
              </h2>

              <p className="text-gray-400 mt-4 leading-7 whitespace-pre-line">
                {websiteModal.message}
              </p>

            </div>

            <div className="flex border-t border-white/10">

              <button
                onClick={closeWebsiteModal}
                className="flex-1 py-4 text-gray-300 hover:bg-white/5 transition"
              >
                Cancel
              </button>

              <button
                onClick={executeWebsiteAction}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
              >
                {websiteModal.buttonText}
              </button>

            </div>

          </div>

        </div>
      )
    }
         {!audioUnlocked && (
         <p className="text-gray-400 text-sm mt-2">
           Click the button above to activate voice assistance.
         </p>
         )}

      {/* MOBILE MENU */}
      <IoMdMenu
        onClick={() => setMobileMenu(true)}
        className="absolute top-4 right-6 text-white text-2xl lg:hidden cursor-pointer"
      />

      {mobileMenu && (
        <div className="lg:hidden fixed top-0 right-0 z-50 w-full max-w-[320px] h-screen bg-[#0a0a32]/90 backdrop-blur-xl border-l border-white/10 flex flex-col p-6 shadow-2xl transition-transform duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white tracking-wide">Menu</h2>
            <button 
              onClick={() => setMobileMenu(false)}
              className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
            >
              <RxCross2 size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            <button onClick={() => setConfirmAction({ type: 'customize' })} className="bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2.5 rounded-xl text-white font-medium shadow-lg shadow-blue-900/20">
              Customize Assistant
            </button>
            <button onClick={() => setConfirmAction({ type: 'logout' })} className="bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all px-4 py-2.5 rounded-xl font-medium">
              Logout
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Voice History</h3>
              <button onClick={() => setTrunk(!trunk)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                {trunk ? "Show All" : "Truncate"}
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar pb-4">
              {userData?.history?.length > 0 ? (
                userData.history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <span className="flex items-center justify-center min-w-[26px] h-[26px] bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className={`text-sm text-gray-200 ${trunk ? "truncate" : ""} flex-1`} title={h}>
                        {h}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteHistory(i)}
                      className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-colors"
                      title="Delete"
                    >
                      <RxCross1 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm bg-white/5 rounded-2xl border border-white/5 border-dashed">
                  <p>No history available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP HISTORY */}
      <IoMdMenu
        onClick={() => setDesktopHistory(true)}
        className="absolute top-4 left-6 text-white text-2xl hidden lg:block cursor-pointer hover:text-blue-400 transition-colors"
      />

      {desktopHistory && (
        <div className="fixed top-0 left-0 z-50 w-[400px] h-screen bg-[#0a0a32]/90 backdrop-blur-xl border-r border-white/10 p-6 shadow-2xl flex flex-col transition-transform duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-wide">Voice History</h2>
              <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full text-white">{userData?.history?.length || 0}</span>
            </div>
            <button 
              onClick={() => setDesktopHistory(false)}
              className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
            >
              <RxCross2 size={20} />
            </button>
          </div>

          <div className="flex justify-end mb-2">
             <button onClick={() => setTrunk(!trunk)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                {trunk ? "Show Full Text" : "Truncate Text"}
             </button>
          </div>

          <div className="overflow-y-auto flex-1 space-y-2.5 pr-2 custom-scrollbar pb-6">
            {userData?.history?.length > 0 ? (
              userData.history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden flex-1">
                    <span className="flex items-center justify-center min-w-[28px] h-[28px] bg-blue-500/20 border border-blue-500/20 text-blue-300 rounded-full text-xs font-bold shadow-inner">
                      {i + 1}
                    </span>
                    <p
                      className={`text-[15px] text-gray-200 ${
                        trunk ? "truncate" : ""
                      } flex-1`}
                      title={h}
                    >
                      {h}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteHistory(i)}
                    className="text-gray-500 hover:text-red-400 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-400/10"
                    title="Delete record"
                  >
                    <RxCross1 size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed mt-4">
                <p>No voice history available.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* we use hidden to hide our button on the small display because we cannot do sm:hidden and lg:flex is use to display on the large device */}
      <div className="hidden absolute lg:flex flex-col items-center gap-4 top-4 right-6"> 
        <button onClick={() => setConfirmAction({ type: 'logout' })}
          className="bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-gray-300 hover:text-red-400 transition-all px-6 py-2 rounded-xl text-sm font-medium w-full" >Logout
        </button>
        
        <button onClick={() => setConfirmAction({ type: 'customize' })}
          className="bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 px-6 py-2 rounded-xl text-white text-sm font-medium w-full">Customize Assistant
        </button>
      </div>

      {/* Response */}
      {responseText && (
        <p className="text-white mt-6 text-center w-[80%]">
          {responseText}
        </p>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a32] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              {confirmAction.type === "logout" ? "Confirm Logout" : "Customize Assistant"}
            </h3>
            <p className="text-gray-400 mb-6 text-sm">
              {confirmAction.type === "logout" 
                ? "Are you sure you want to logout from your account?" 
                : "Are you sure you want to navigate to the customization page?"}
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setConfirmAction(null)} 
                className="px-6 py-2 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmAction.type === "logout") {
                    logoutUser();
                  } else {
                    navigate("/assis-img");
                  }
                  setConfirmAction(null);
                }} 
                className={`px-6 py-2 rounded-xl text-white shadow-lg transition-colors font-medium ${
                  confirmAction.type === "logout" 
                    ? "bg-red-600 hover:bg-red-500 shadow-red-900/20" 
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;
