require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const AuthRouter = require("./route/Auth-Route");
const UserRouter = require("./route/User-Route");
const DBConnection = require("./config/DBConnection");
const cors = require('cors');

const app = express();

app.use(cors({
    origin: "https://ai-virtual-assistance-five.vercel.app",
    
    // origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", AuthRouter);
app.use("/api/user", UserRouter);


const PORT = process.env.PORT || 3000;

DBConnection()
   .then(()=>{
      app.listen(PORT, ()=>{
        console.log(`server is running on the port ${PORT}`);
    })
 })
