import { createSlice } from "@reduxjs/toolkit";

const imageSlice = createSlice({
    name: "image",
    initialState:{
        backendImage: null,
        frontendImage: null,
        selectedImage: null,
        selectedName: null,
        userData: null,
    },
    reducers:{
        setBackendImage:(state, action)=>{
            state.backendImage = action.payload;
        },
        setFrontendImage:(state, action)=>{
            state.frontendImage = action.payload;
        },
        setSelectedImage:(state, action)=>{
            state.selectedImage = action.payload;
        },
        setSelectedName:(state, action)=>{
            state.selectedName = action.payload;
        },
        setUserData:(state, action)=>{
            state.userData = action.payload;
        },
    }
})

export const {setBackendImage, setFrontendImage, setSelectedImage,setSelectedName, setUserData} = imageSlice.actions;
export default imageSlice.reducer;