const express = require('express');
const {getCurrentUser,updateAssistant, askToAssistant,deleteHistory} = require('../controller/User-Controller');
const  isAuth = require('../middleware/isAuth');
const upload = require('../middleware/multer');

const route = express.Router();

route.get('/currentUser', isAuth, getCurrentUser);
route.post('/update', isAuth, upload.single("assistantImage"), updateAssistant);
route.post("/getData",isAuth, askToAssistant);
route.delete("/history/:index",isAuth, deleteHistory);

module.exports = route;