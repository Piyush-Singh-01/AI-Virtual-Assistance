require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const AuthRouter = require("./route/Auth-Route");
const UserRouter = require("./route/User-Route");
const DBConnection = require("./DBConnection");
const cors = require('cors');

const app = express();

app.use(cors({
    origin: "https://piyush-ai-virtual-assistance.onrender.com",
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
