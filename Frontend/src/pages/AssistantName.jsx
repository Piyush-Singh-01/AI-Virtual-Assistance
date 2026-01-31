import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setBackendImage, setUserData} from '../redux/imageSlice';
import axios from 'axios';

function SelectName() {
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const userData = useSelector((store)=> store.image.userData);
   const selectedImage = useSelector((store) => store.image.selectedImage);
   const backendImage = useSelector((store) => store.image.backendImage);
   const [assistantName, setAssistantName] = useState(userData?.selectedName || "");

   const handleUpdateAssistant = async()=>{
       try {
         let formData = new FormData();
         formData.append("assistantName", assistantName);
         if(backendImage){
            formData.append("assistantImage", backendImage) //user uploaded a custom image, send it as "assistantImage", multer will put it in req.file
         }else if(selectedImage){  
            formData.append("imageUrl", selectedImage); // user selected predefined image, selectedImage is a URL/local asset, 
         }

         const result = await axios.post("http://localhost:8000/api/user/update", formData ,{withCredentials:true})
         console.log(result.data);
         dispatch(setUserData(result.data))
      } catch (error) {
         console.log("error in Assistant Name", error);
       }
   }
  return (
     <div className='min-h-screen bg-gradient-to-t  from-[black] to-[#0f0f83] flex justify-center items-center p-6'>
        <form className='flex flex-col items-center justify-center gap-6 px-2 text-center w-full max-w-[600px] '>
           <h1 className=' text-white text-2xl '>Enter Your <span className='text-cyan-200'>Assistant Name</span></h1>
           <input onChange={(e)=>setAssistantName(e.target.value)} name="assistantName"
            value={assistantName} className='w-full border-2 rounded-4xl border-white py-2 px-4 text-white'
             placeholder='eg: jarvis'/>

          {assistantName &&
           <button type='button' onClick={()=> {navigate('/'); handleUpdateAssistant() } } className='text-black text-xm font-medium px-4 py-1 rounded-3xl bg-white cursor-pointer
            hover:bg-white/80'>Finally Create Your Assistant</button>
          }
        </form>
     </div>
  )
}

export default SelectName