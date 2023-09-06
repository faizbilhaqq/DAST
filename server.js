// load environment variables
if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

// import
const express = require("express");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Destination folder for uploaded files

// create express app
const app = express();

// To have app receiving Json request
app.use(express.json());

// Serve static files
app.use(express.static('view'));

// Controller
const { uploadJSON } = require('./controller/jsonController');
const { userLogin } = require('./controller/userController');

app.post('/upload-json', upload.single('jsonFile'), uploadJSON);

// run server on port
const port = process.env.PORT || 3000; // Default to port 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


