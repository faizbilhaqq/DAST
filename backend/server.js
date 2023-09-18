// load environment variables
if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

// import
const express = require("express");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Destination folder for uploaded files
const cors = require('cors'); 

// create express app
const app = express();

app.use(cors());

// To have app receiving Json request
app.use(express.json());

// Serve static files
app.use(express.static('view'));

// Controller
const { uploadJSON, uploadAPICollection } = require('./controller/jsonController');
const { userLogin } = require('./controller/userController');

app.post('/upload-json', upload.single('jsonFile'), uploadJSON);
// app.post('/upload-api-collection', upload.single('jsonFile'), uploadAPICollection);

// run server on port
const port = process.env.PORT || 3000; // Default to port 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


