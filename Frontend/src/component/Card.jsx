import { useDispatch, useSelector } from "react-redux";
import { setBackendImage, setFrontendImage, setSelectedImage } from "../redux/imageSlice";

function Card({image}) {
   const dispatch = useDispatch();
    const selectedImage = useSelector((store) => store.image.selectedImage);
  
  return (
    <div 
    onClick={()=>{
      dispatch(setSelectedImage(image))
      setBackendImage(null);
      setFrontendImage(null);
    }}
     className={`w-[170px] h-[250px] hover:border-3
      ${selectedImage === image? "border-4 border-white shadow-2xl shadow-white scale-105": null}
       hover:border-white hover:scale-105 rounded-2xl cursor-pointer hover:shadow-2xl 
        hover:shadow-blue-400 bg-blue-400 overflow-hidden`}>
        <img className="h-full w-full object-cover " src={image} alt='Assistant-Image'/>
    </div>
  )
}

export default Card