const User = require("../model/User-Model.js");
const uploadOnCloudinary = require("../utils/uploadOnCloudinary.js");
const geminiResponse = require("../services/Gemini.js");

const getCurrentUser = async(req, res)=>{
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        if(!user){
            return res.status(404).json({msg: "User not found"});
        }
        return res.status(200).json(user);
    } catch (error) {
        console.log("Error in User-Controller getCurrentUser:", error);
        return res.status(500).json({msg: "Get current user error"});
    }
}

const updateAssistant = async(req, res)=>{
    try {
        const {assistantName, imageUrl} = req.body;
        const existingUser = await User.findById(req.userId);
        if(!existingUser){
            return res.status(404).json({msg: "User not found"});
        }

        let assistantImage = existingUser.assistantImage;

        if (req.file) {
            assistantImage = await uploadOnCloudinary(req.file.path);
        } else if (imageUrl) {
            assistantImage = imageUrl;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                assistantName: assistantName || existingUser.assistantName,
                assistantImage
            },
            { new: true }
        ).select("-password");

        return res.status(200).json(user);
    } catch (error) {
        console.error("update Assistant Error:", error);
        return res.status(500).json({msg: "Update Assistant Error", error: error.message});
    }
}

const askToAssistant = async(req, res)=>{
    try {
        const {command} = req.body;
        if(!command || !command.trim()){
            return res.status(400).json({
                action: "ASK_CLARIFICATION", 
                question: "What can I help you with?"
            });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Save command in history
        user.history.push(command.trim());
        await user.save();

        const userName = user.username;
        const assistantName = user.assistantName || "Assistant";
        const result = await geminiResponse(command, assistantName, userName);
        const gemResult = JSON.parse(result);

        // Include userHistory in response so frontend updates in real time
        return res.status(200).json({
            ...gemResult,
            userHistory: user.history
        });
    } catch (error) {
        console.error("DETAILED ERROR in askToAssistant:", error);
        return res.status(500).json({
            action: "UNKNOWN",
            message: error.message, 
        });
    }
}

const deleteHistory = async(req, res)=>{
    try {
       const index = parseInt(req.params.index, 10);
       const user = await User.findById(req.userId);
       if(!user){
           return res.status(404).json({msg: "User not Found"});
       }

       if (index >= 0 && index < user.history.length) {
           user.history.splice(index, 1);
           await user.save();
       }

       const userWithoutPassword = user.toObject();
       delete userWithoutPassword.password;
       return res.status(200).json({msg: "History deleted", user: userWithoutPassword});
    } catch (error) {
       console.log("error in deleteHistory", error);
       return res.status(500).json({msg: "Something went wrong"});
    }
}

module.exports = {getCurrentUser, updateAssistant, askToAssistant, deleteHistory};