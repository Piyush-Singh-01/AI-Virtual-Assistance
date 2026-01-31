const express = require("express");
const { SignUp, Login, Logout } = require("../controller/Auth-Controller");

const router =  express.Router();

router.post("/signup", SignUp);
router.post("/login", Login);
router.post("/logout",Logout);

module.exports = router;