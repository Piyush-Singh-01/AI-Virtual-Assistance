import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedImage, setSelectedName, setUserData } from "../redux/imageSlice";
import { toast } from "react-toastify";
import userGif from "../assets/user.gif";
import aiGif from "../assets/ai.gif";
import { useEffect, useRef, useState } from "react";
import { IoMdMenu } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { RxCross1 } from "react-icons/rx";



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
    } catch (error) {
      toast.error("Logout error");
    }
  };

  const handleAction = (data) => {
     if (!data || !data.action) {
        speak("Sorry, I did not understand that.");
        return;
  }

  switch (data.action) {
    /* ---------- OPEN DIRECT URL ---------- */
    case "OPEN_URL":
        if (data.url) {
          speak("Opening the website");
          setTimeout(()=>{
          window.open(data.url, "_blank");
        },500)
      } else {
        speak("I need a valid website link.");
      }
      break;

    /* ---------- YOUTUBE ---------- */
    case "OPEN_YOUTUBE":
        speak("Opening YouTube");
        setTimeout(()=>{
          window.open("https://www.youtube.com", "_blank");
        },500)
      break;

    case "SEARCH_YOUTUBE":
        if (data.query) {
            speak(`Searching ${data.query} on YouTube`);
            setTimeout(()=>{
                window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.query)}`,"_blank");
            },500)
            } else {
                speak("What should I search on YouTube?");
            }
      
      break;

    case "PLAY_SONG_YOUTUBE":
      if (data.song) {
        speak(`Playing ${data.song}`);
        setTimeout(()=>{
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.song)}`,"_blank");
        },500)
      } else {
        speak("Which song should I play?");
      }
      break;

    /* ---------- GOOGLE ---------- */
    case "SEARCH_GOOGLE":
      if (data.query) {
          speak(`Searching ${data.query} on Google`);
          setTimeout(()=>{
            window.open(`https://www.google.com/search?q=${encodeURIComponent(data.query)}`,"_blank");
          },500)
      } else {
        speak("What should I search on Google?");
      }
      break;

    /* ---------- SOCIAL MEDIA ---------- */
    case "OPEN_INSTAGRAM":
        speak("Opening Instagram");
        setTimeout(()=>{
            window.open("https://www.instagram.com", "_blank");
        },500)
      break;

    case "OPEN_FACEBOOK":
        speak("Opening Facebook");
        setTimeout(()=>{
            window.open("https://www.facebook.com", "_blank");
        },500)
      break;

    case "OPEN_TWITTER":
        speak("Opening Twitter");
        setTimeout(()=>{
            window.open("https://twitter.com", "_blank");
        },500)
      break;

    case "OPEN_LINKEDIN":
        speak("Opening LinkedIn");
        setTimeout(()=>{
            window.open("https://www.linkedin.com", "_blank");
        },500)
      break;

    /* ---------- TEXT / ANSWERS ---------- */
    case "ANSWER_QUESTION":
      if (data.answer) {
        setResponseText(data.answer);
        setTimeout(()=>{
            speak(data.answer);
        },500)         
      } else {
        speak("I don't have an answer for that.");
      }
      break;

    case "WRITE_TEXT":
      if (data.text) {
        speak("Here is what I wrote.");
        setTimeout(()=>{
           setResponseText(data.text);
        },500)
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

  const handleGeminiCall = async (command) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/user/getData",
        { command },
        { withCredentials: true }
      );

    //   if (response.data?.answer) {
    //     setResponseText(response.data.answer);
    //     return response.data.answer;
    //   }

    const data = response.data;
    // Let frontend decide what to do
    handleAction(data);

    } catch (error) {
      console.error("Gemini error:", error);
    }
  };

  const speak = (text) => {
    if (!text) return;
    

    window.speechSynthesis.cancel();  // Stop any current speech, if the assistance is already speaking and a new command comes both voices would overlap, so we force stop old speech first.

    const utterance = new SpeechSynthesisUtterance(text);  // Create a "speech object", means this is the sentence the browser should speak
    utterance.lang = "hi-IN"
    utterance.rate = 1;  //normal speed
    utterance.pitch = 1; // normal voice tone
      //  AI started speaking
    utterance.onstart = () => {
      setGif(true);        // show aiGif
      recognitionRef.current?.stop(); // avoid echo
    };

  //  AI finished speaking
    utterance.onend = () => {
      setGif(false);       // show userGif
      recognitionRef.current?.start(); // resume mic
    };
    
    window.speechSynthesis.speak(utterance); // Speak now, means this sentence will make the speak the sound.
  };

  // const speak = (text)=>{
  //    const utterence = new SpeechSynthesisUtterance(text);
  //    utterence.lang = 'hi-IN';
  //    const voices = window.speechSynthesis.getVoices();
  //    const hindiVoice = voices.find(v=> v.lang === 'hi-IN');
  //    if(hindiVoice){
  //     utterence.voice = hindiVoice;
  //    }
  // }

  // Without unlockAudio , Brower blocks sound, No error No warning just silence
  const unlockAudio = () => {
    if (audioUnlocked) return;  // Audio needs to be unlocked only once, means when you have unlocked audio once by any gesture then this line prevent again and again guesture demand for starting speaking;

    const u = new SpeechSynthesisUtterance(" "); // these two lines play a silent sound that's why it tell the brower , keep open the mic for user
    window.speechSynthesis.speak(u);

    setAudioUnlocked(true); // save unlock state, due to this your app know, Speaking is allowed then mic can safely start
    speak(`Hello, How can i help you today`)
  };

  /* ---------------- SPEECH RECOGNITION ---------------- */
  useEffect(() => {
    if (!userData?.assistantName) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;  // Get brower speech-to-text engine

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition(); // this connects to the user's microphone
    recognitionRef.current = recognition; // Store recognition globally, So you can: .stop mic before speaking .restart mic after speaking

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();

      console.log("Heard:", transcript);

      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
          //  recognition.stop(); // stop mic before speaking, This avoids: .Echo .AI hearing itself .Infinite loop

          await handleGeminiCall(transcript);
        //   if (reply) speak(reply);
      }
    };
    recognition.onend = () => {
      // Restart only if not speaking
      if (!window.speechSynthesis.speaking) {
        recognition.start();
      }
    };

    recognition.start();

    return () => {recognition.stop()}; // Mic stops immediately: . when user navigates away, Page changes .Logout happens
  }, []);

  const deleteHistory = async(index)=>{
    try {
        const res = await axios.delete(`https://backend-ai-virtual-assistance.onrender.com/api/user/history/${index}`,{withCredentials:true});
        toast.success(res.data.msg);
        dispatch(setUserData(res.data.user));
    } catch (error) {
        console.log(error);
        toast.error('Failed to delete history');
    } 
  };

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-t from-black to-[#0a0a32] flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center pt-6">
        <img
          className="w-[220px] h-[350px]  object-cover rounded-2xl"
          src={userData?.assistantImage}
          alt="Assistant"/>

        <h1 className="text-white text-xl font-medium">
          I'm {userData?.assistantName}
        </h1>
      </div>

      <img onClick={unlockAudio}
        className="text-2xlw-32 h-32 object-contain cursor-pointer bg-transparent"
        src={gif ? aiGif: userGif}
        alt="Activate assistant" />

       <IoMdMenu onClick={()=> setMobileMenu(true)} className="absolute cursor-pointer text-white text-2xl lg:hidden top-4 right-6" />

      {mobileMenu &&
       <div className="lg:hidden flex flex-col gap:4 absolute top-0 right-0 w-full max-w-[400px] h-screen bg-black/20 backdrop-blur">
         <RxCross2 onClick={()=> setMobileMenu(false)} className="absolute top-2 right-2 text-2xl text-white" />
         <div className="flex flex-col mt-4 ml-4 gap-4">   
          <button onClick={logoutUser}
            className="w-fit bg-blue-900 px-4 py-1 rounded-2xl text-white cursor-pointer" >Logout
          </button>       
          <button onClick={()=> navigate("/assis-img")}
            className="w-fit bg-blue-900 px-2 py-1 rounded-2xl text-white cursor-pointer">Customize your Assistant
          </button>

          <div className="relative w-full h-[60vh] p-4 pb-3 gap-2 flex flex-col mt-10 overflow-y-scroll [&::-webkit-scrollbar]:hidden "> 
            <h1 className="text-gray-200 text-3xl font-medium mb-4 text-center">History</h1>
             {userData?.history?.map((history, index)=>(
              <div key={index} className="flex gap-2 pr-4 relative mt-2 ">
                  <span className="text-xl text-white">{index + 1}.</span>
                  <h1 onClick={()=> setTrunk(!trunk)} className={`text-xl text-gray-300 font-medium ${trunk && "truncate"}`}>{history}</h1>
                  <RxCross1 onClick={()=>deleteHistory(index)}  className="cursor-pointer text-white absolute right-2 top-2" />
              </div>
             ))}
          </div>
       </div>  
    </div>
  }
      <IoMdMenu onClick={()=> setDesktopHistory(true)} className="absolute cursor-pointer text-white text-2xl hidden lg:block top-4 left-6" />
      {desktopHistory &&
       <div className=" flex flex-col gap:4 absolute top-0 left-0 w-full max-w-[500px] min-h-screen bg-black/20 backdrop-blur">
         <RxCross2 onClick={()=> setDesktopHistory(false)} className="absolute top-4 right-8 text-2xl text-white" />
          <div className="w-full h-[80vh] p-4 pb-8 gap-2 flex flex-col mt-10 overflow-y-scroll [&::-webkit-scrollbar]:hidden"> 
            <h1 className="text-gray-200 text-3xl font-medium mb-4 text-center">History</h1>
             {userData?.history?.map((history, index)=>(
              <div key={index} className="flex  gap-2 relative mt-4">
                  <span className="text-xl text-white">{index + 1}.</span>
                  <h1 onClick={()=> setTrunk(!trunk)} className={`text-xl text-gray-300 font-medium ${trunk && "truncate"} `}>{history}</h1>
                  <RxCross1 onClick={()=> deleteHistory(index)} className="text-white absolute right-2 cursor-pointer" />
              </div>
             ))}
          </div>        
       </div>
      }

       {/* we use hidden to hide our button on the small display because we cannot do sm:hidden and lg:flex is use to display on the large device */}
      <div className="hidden absolute lg:flex flex-col items-center gap-4 top-4 right-2"> 
        <button onClick={logoutUser}
          className="bg-blue-900 px-4 py-1 rounded-2xl text-white " >Logout
        </button>
        
        <button onClick={()=> navigate("/assis-img")}
          className="bg-blue-900 px-2 py-1 rounded-2xl text-white">Customize your Assistant
        </button>
      </div>

      {responseText && (
        <p className="text-white text-xl w-[80%] mt-6 mb-6 text-center">{responseText}</p>
      )}
    </main>
  );
}

export default Home;
