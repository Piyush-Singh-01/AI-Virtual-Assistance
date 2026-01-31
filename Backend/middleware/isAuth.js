const jwt =  require("jsonwebtoken");

const isAuth = async(req, res, next)=>{
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(400).json({msg: "Token not found"});
        }
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = verifyToken.userId;  // i am adding userId in the request, and putting value in the req.userId which i get from the token
        next();
    } catch (error) {
        console.log("Error in isAuth file", error);
        return res.status(401).json({msg: "Error in verifying token"}) // 401 unauthorized -> no token, 403 Forbidden -> invalid/expired token
    }
}

module.exports =  isAuth;


// import jwt from "jsonwebtoken";

// const isAuth = (req, res, next) => {
//   try {
//     const token = req.cookies?.token;

//     if (!token) {
//       return res.status(401).json({ msg: "Authentication token missing" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (!decoded?.userId) {
//       return res.status(403).json({ msg: "Invalid token payload" });
//     }

//     req.userId = decoded.userId;
//     next();
//   } catch (error) {
//     console.error("JWT Auth Error:", error.message);

//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({ msg: "Token expired" });
//     }

//     return res.status(403).json({ msg: "Invalid token" });
//   }
// };

// export default isAuth;
