import image1 from "../assets/image1.jpg";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/image3.jpg";
import image4 from "../assets/image4.jpg";
import image5 from "../assets/image5.jpg";
import image6 from "../assets/image6.jpg";
import image7 from "../assets/image7.jpg";
import image8 from "../assets/image8.jpg";
import { LuImagePlus } from "react-icons/lu";
import Card from "../component/Card";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBackendImage, setFrontendImage, setSelectedImage } from "../redux/imageSlice";
import { useNavigate } from "react-router-dom";

function Robot() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const frontendImage = useSelector((store) => store.image.frontendImage);
  const selectedImage = useSelector((store) => store.image.selectedImage);

  const inputImage = useRef();
  const handleImage = (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    // console.log(selectedImage);
    // console.log(file);
      dispatch(setBackendImage(file));
      // setBackendImage(file);
      dispatch(setFrontendImage(URL.createObjectURL(file))) // i am creating a url for the image 
  }
  return (
    <main className="w-full min-h-screen flex flex-col justify-center items-center gap-6 bg-gradient-to-t from-[black] to-[#141472] p-6">
       <h1 className="text-white text-3xl text-center">Select Your <span className="text-cyan-500">Assistant Image</span></h1>
       <div className="w-full lg:w-2/3 md:w-2/3 flex flex-wrap justify-center gap-4 ">
          <Card image={image1}/>
          <Card image={image2}/>
          <Card image={image3}/>
          <Card image={image4}/>
          <Card image={image5}/>
          <Card image={image6}/>
          <Card image={image7}/>
          <Card image={image8}/>
          <div onClick={()=>{
             inputImage.current.click()
             dispatch(setSelectedImage("input"))
          }}
           className= {`w-[170px] bg-blue-950 h-[250px] hover:border-2
             ${selectedImage === "input"? "border-4 border-white shadow-2xl shadow-white scale-105": null}
            hover:border-white hover:scale-105 rounded-2xl
             cursor-pointer hover:shadow-2xl hover:shadow-blue-950
             border-white overflow-hidden flex justify-center items-center text-white text-2xl`}>
            {!frontendImage ? <LuImagePlus />
            :<img src={frontendImage} className="h-full w-full object-cover"/>
            }
            </div>
          <input onChange={handleImage} type="file" accept="image/*" ref={inputImage} hidden/>
       </div>
          {selectedImage && <button onClick={()=> navigate("/assis-name")} className="bg-white px-6 py-2 font-medium rounded-2xl w-fit ">Next</button>}
    </main>
  )
}

export default Robot