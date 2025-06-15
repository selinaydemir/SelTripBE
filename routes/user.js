const express = require("express");
const router = express.Router();
const upload = require('../middleware/upload');


const {
  uploadPhoto
} = require("../controllers/userController"); 

router.post("/uploadPhoto", upload.single('photo'), uploadPhoto);


module.exports = router;
