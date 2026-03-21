const User = require("../User-Model.js");
const uploadOnCloudinary = require("../utils/uploadOnCloudinary.js");
const geminiResponse = require("../Gemini.js")
const ollamaResponse = require("../ollamaResponse");

const getCurrentUser = async(req, res)=>{
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password") // when we don't want to pass the password
        if(!user){
            return res.status(400).json({msg: "User not found"});
        }
        return res.status(200).json(user);
    } catch (error) {
        console.log("Error in User-Controller", error);
        return res.status(500).json({msg: "Get current user error"});
    }
}

const updateAssistant = async(req, res)=>{
    try {
        const {assistantName, imageUrl} = req.body;
        let assistantImage;
        if(req.file){
            assistantImage = await uploadOnCloudinary(req.file.path);
        }else{
            assistantImage = imageUrl;
        }
        const user = await User.findByIdAndUpdate(req.userId,
            {assistantName,assistantImage},
            {new:true}).select("-password");

            return res.status(200).json(user);

    } catch (error) {
        return res.status(400).json({msg: "update Assistant Error"});
        
    }
}

const askToAssistant = async(req, res)=>{
    try {
        console.log("BODY:", req.body); // 👈 debug

        if (!req.body || !req.body.command) {
        return res.status(400).json({
            message: "Command is required"
        });
        }
        const {command} = req.body;
        if(!command){
            return res.status(400).json({action: "ASK_CLARIFICATION", question: "What can I help you with?"});
        }
        const user = await User.findById(req.userId);
         if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
         user.history.push(command);
         await user.save();
        const userName = user.username;
        const assistantName = user.assistantName;
        const result = await geminiResponse(command, assistantName, userName);
        // const result = await ollamaResponse(command, assistantName, userName);
        const gemResult = JSON.parse(result);
        return res.status(200).json(gemResult);
    }catch (error) {
       console.error("DETAILED ERROR:", error); // This will tell you if it's a parsing error or a network error
       return res.status(500).json({
        action: "UNKNOWN",
        message: error.message, 
    });
  }
}

const deleteHistory = async(req, res)=>{
    try {
       const index = req.params.index;
       const user = await User.findById(req.userId);
       if(!user){
        return res.status(404).json({msg: "User not Found"});
       }
       user.history.splice(index, 1);
       await user.save();
       return res.status(200).json({msg: "History deleted", user});
    } catch (error) {
        console.log("error in deleteHistory",error);
        return res.status(500).json({msg: "Some went wrong"});
    }
     
}

module.exports = {getCurrentUser, updateAssistant, askToAssistant,deleteHistory};