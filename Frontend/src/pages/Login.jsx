import {Link, useNavigate} from "react-router-dom";
import image from "../assets/AI-Robot.jpg"
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'
import { useDispatch } from "react-redux";
import {setUserData} from "../redux/imageSlice";

function Login() {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [eye, setEye]  = useState(true);
    const [info, setInfo] = useState({
        email: '',
        password: ''
     })

    const handleInput = (e)=>{
        const {name, value} = e.target;
        setInfo({
            ...info,
            [name]: value
        });
     }
    setLoading(true);
     const handleSubmit = async(e)=>{
         e.preventDefault();
         if (!info.email || !info.password) {
                toast.warning("All Fields are require");
                return;
         }    
        try {
            const res = await axios.post("https://backend-ai-virtual-assistance.onrender.com/api/auth/login",
                info,
                {withCredentials:true}
            );
            if(res.status == 200 ){
                toast.success(res.data.msg || "Login Successful");
                setInfo({email: "", password: ""});
                dispatch(setUserData(res.data.user));
                navigate("/");
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || "Invalid email or password")
            console.log(error)
        }finally{
            setLoading(false);
        }
     }
  return (
    <main className="w-full h-screen flex items-center justify-center"
         style={{
            backgroundImage:`url(${image})`,
            backgroundSize:"cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
         }}   
         >
        <form onSubmit={handleSubmit} className="flex flex-col text-center  bg-white/40 backdrop-blur p-6 rounded-xl gap-4 mx-4 w-full max-w-[600px]">
            <h1 className="text-2xl text-center">Login to <span className="text-blue-600">Virtual Assistant</span></h1>
            <input className="border rounded-2xl p-2 outline-none" type="email" placeholder='Email' name="email" value={info.email} onChange={handleInput}/>
             <div className="relative" >
                <input  className="w-full border rounded-2xl p-2 outline-none" type={(eye? "password": "text")} placeholder='Password' name="password" value={info.password} onChange={handleInput} autoComplete="off"/>
                {eye ?
                  <span onClick={()=> setEye(!eye)} className="absolute right-6 top-3 text-xl cursor-pointer"><FaEyeSlash /></span>     
                  :<span onClick={()=> setEye(!eye)} className="absolute right-6 top-3 text-xl cursor-pointer"><FaRegEye /></span>     
                }
             </div>
            <button type="submit" className="bg-blue-400 px-4 py-2 w-fit mx-auto rounded-xl hover:bg-blue-500 cursor-pointer">{loading? "Loading...": "Login"}</button>
            <h1>Create a new account? <Link className="text-blue-700 hover:underline" to="/signup">SignUp</Link></h1>
        </form>
    </main>
  )
}

export default Login
