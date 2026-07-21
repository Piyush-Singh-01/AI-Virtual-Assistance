const User = require("../User-Model");
const bcrypt = require("bcryptjs");
const genToken = require("../Token");

const SignUp = async(req, res)=>{
    try {
        const {username, email, password} = req.body;
        const userExist = await User.findOne({email});
        if(userExist){
            return res.status(400).json({msg: "User already exist. Please Try with another email"});
        }
        if(password.length < 6){
            return res.status(400).json({msg: "Password must be at least 6 character"})
        }
        const hash_password = await bcrypt.hash(password, 10);
        const userCreated = await User.create({username, email, password: hash_password});
        
        const token = await genToken(userCreated._id);
        res.cookie("token", token,{
            secure: false,
            sameSite: "lax",
            maxAge: 7*24*60*60*1000,
            httpOnly: true
        });
        return res.status(200).json({
            msg: "User Registered Successfully",
            success: true,
            user: {
            _id: userCreated._id,
            username: userCreated.username,
            email: userCreated.email,
         }, 
        })

    } catch (error) {
        res.status(500).send({msg: "SignUp Server error"});
        console.log("Error from Signup",error);
    }   
}

const Login = async(req,res)=>{
    try {
        const {email, password} = req.body;

        const userExist = await User.findOne({email});
        if(!userExist){
            return res.status(400).send({msg: "Invalid email or password"})
        }

        const isMatch = await bcrypt.compare(password, userExist.password);
        
        if(isMatch){
            const token = await genToken(userExist._id);
            res.cookie("token", token,{
                secure: false,
                sameSite: "lax",
                maxAge: 7*24*60*60*1000,
                httpOnly: true
            });
         
        const user = await User.findById(userExist._id).select("-password");
        return res.status(200).json({msg: "Login successfully",user});
     }
        return res.status(400).json({msg: "Invalid Email or Password"});

    } catch (error) {
        console.log("Error from login", error);
        return res.status(500).json({msg: "Invalid email or password"});
    }
}

const Logout = async(req, res)=>{
    try {
        res.clearCookie("token");
        return res.status(200).json({msg: "Logout Successfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: "Logout error"})
    }
}

module.exports = {SignUp, Login, Logout};
