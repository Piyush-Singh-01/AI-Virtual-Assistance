const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{  // cb means callback
        cb(null, "./public")     // create a file in the backend which name is public
    },
    filename:(req,file,cb)=>{
        cb(null, file.originalname)
    }
})

const upload = multer({storage});

module.exports = upload;