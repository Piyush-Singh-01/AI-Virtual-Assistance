import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserData } from '../redux/imageSlice';
import { toast } from 'react-toastify';
import api from "../api/axios";

function SelectName() {
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const userData = useSelector((store) => store.image.userData);
   const selectedImage = useSelector((store) => store.image.selectedImage);
   const backendImage = useSelector((store) => store.image.backendImage);
   const [assistantName, setAssistantName] = useState(userData?.assistantName || "");
   const [loading, setLoading] = useState(false);

   const handleUpdateAssistant = async () => {
      if (!assistantName.trim()) {
         toast.warning("Please enter an assistant name");
         return;
      }

      setLoading(true);
      try {
         const formData = new FormData();
         formData.append("assistantName", assistantName.trim());

         if (backendImage) {
            formData.append("assistantImage", backendImage);
         } else if (selectedImage && selectedImage !== "input") {
            try {
               // Fetch local asset and convert to blob for Cloudinary upload
               const response = await fetch(selectedImage);
               const blob = await response.blob();
               formData.append("assistantImage", blob, "assistant.jpg");
            } catch {
               formData.append("imageUrl", selectedImage);
            }
         }

         const result = await api.post("/user/update", formData);
         dispatch(setUserData(result.data));
         toast.success("Assistant saved successfully!");
         navigate('/');
      } catch (error) {
         console.error("Error in Assistant Name:", error);
         toast.error(error.response?.data?.msg || "Failed to update assistant");
      } finally {
         setLoading(false);
      }
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      handleUpdateAssistant();
   };

   return (
      <div className='min-h-screen bg-gradient-to-t from-[black] to-[#0f0f83] flex justify-center items-center p-6'>
         <form onSubmit={handleSubmit} className='flex flex-col items-center justify-center gap-6 px-2 text-center w-full max-w-[600px]'>
            <h1 className='text-white text-2xl'>Enter Your <span className='text-cyan-200'>Assistant Name</span></h1>
            <input 
               onChange={(e) => setAssistantName(e.target.value)} 
               name="assistantName"
               value={assistantName} 
               className='w-full border-2 rounded-4xl border-white py-2 px-4 text-white outline-none'
               placeholder='eg: jarvis'
               autoFocus
            />

            {assistantName.trim() && (
               <button 
                  type='submit' 
                  disabled={loading}
                  className='text-black text-sm font-medium px-6 py-2 rounded-3xl bg-white cursor-pointer hover:bg-white/80 transition-all disabled:opacity-50'
               >
                  {loading ? "Creating Assistant..." : "Finally Create Your Assistant"}
               </button>
            )}
         </form>
      </div>
   );
}

export default SelectName;
