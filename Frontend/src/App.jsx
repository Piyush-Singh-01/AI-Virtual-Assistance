import { useEffect, useState } from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import AssistantImage from './pages/AssistantImage'
import AssistantName from './pages/AssistantName'
import axios from 'axios'
import Home from './pages/Home'
import { useDispatch, useSelector } from 'react-redux'
import {setUserData} from "./redux/imageSlice";
import NotFound from './pages/ErrorPage'

function App() {
    const userData = useSelector((store)=> store.image.userData);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const currentUser = async()=>{
       try {
          const result = await axios.get("https://backend-ai-virtual-assistance.onrender.com/api/user/currentUser",
            {withCredentials: true}
          )
          dispatch(setUserData(result.data));
          console.log(result.data);
        } catch (error) {
          console.log("error in getting current data",error);
       }finally{
         setLoading(false);
       }
    }
    useEffect(()=>{
       currentUser();
    },[])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }
  return (
    <>
      <Routes>
          <Route path="/" element={userData ? <Home /> : <Navigate to="/login" />}/>
          <Route path="/login" element={!userData ? <Login /> : <Navigate to="/" />}/>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/assis-img" element={userData? <AssistantImage />: <Navigate to="/login"/>}/>
          <Route path="/assis-name" element={userData? <AssistantName />: <Navigate to="/login"/>}/>
          <Route path="*" element={<NotFound />} />
     </Routes>
    </>
  )
}

export default App
