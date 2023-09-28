// Load environment variables
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Import required modules
const express = require("express");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Destination folder for uploaded files
const cors = require('cors');

// Create an Express app
const app = express();

// Enable CORS
app.use(cors());

// Allow app to receive JSON requests
app.use(express.json());

// Serve static files
app.use(express.static('view'));

// Configure the multer storage destination (optional)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/json') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file format. Please upload a JSON file.'), false);
    }
};

const jsonUpload = multer({ storage, fileFilter }).single('jsonFile');

// Controller for handling JSON uploads
const { uploadJSON } = require('./controller/jsonController');

// Handle JSON file uploads (optional) and JSON data
app.post('/upload-json', (req, res, next) => {
    jsonUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }
        // Continue to handle JSON data (req.body) and uploaded file (req.file) as needed
        uploadJSON(req, res);
    });
});

// Run the server on the specified port
const port = process.env.PORT || 3000; // Default to port 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
