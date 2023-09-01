// load environment variables
if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const { error } = require('console');
// import
const express = require("express");
const fs = require("fs");
const axios = require('axios');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Destination folder for uploaded files

// create express app
const app = express();

// To have app receiving Json request
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// run server on port
const port = process.env.PORT || 3000; // Default to port 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Controller
app.get('/read-json', async (req, res) => {
    const filePath = 'test.json'; // Replace with the actual file path

    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const jsonObject = JSON.parse(jsonData);
        const jsonStatus = { status: [] };
        const jsonResponse = { response: [] };

        const axiosRequests = jsonObject.request.map(async (task) => {
            try {
                if (task.method === "POST") {
                    const response = await axios.post(process.env.BURP_API_URL + task.endpoint, task.parameters);
                    jsonStatus.status.push(response.status);
                    jsonResponse.response.push(response.data);
                } else if (task.method === "GET") {
                    const response = await axios.get(process.env.BURP_API_URL + task.endpoint, task.parameters );
                    jsonStatus.status.push(response.status);
                    jsonResponse.response.push(response.data);
                } else {
                    throw new Error("Invalid request");
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });

        await Promise.all(axiosRequests);

        res.json({ message: 'All JSON request processed successfully.', status: jsonStatus ,data: jsonResponse });
    } catch (error) {
        res.status(500).json({ error: 'Error reading or parsing the JSON file.' });
    }
});

app.post('/upload-json', upload.single('jsonFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = req.file.path;

    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const jsonObject = JSON.parse(jsonData);
        const jsonStatus = { status: [] };
        const jsonResponse = { response: [] };

        const axiosRequests = jsonObject.request.map(async (task) => {
            try {
                if (task.method === "POST") {
                    const response = await axios.post(process.env.BURP_API_URL + task.endpoint, task.parameters);
                    jsonStatus.status.push(response.status);
                    jsonResponse.response.push(response.data);
                } else if (task.method === "GET") {
                    const response = await axios.get(process.env.BURP_API_URL + task.endpoint, task.parameters );
                    jsonStatus.status.push(response.status);
                    jsonResponse.response.push(response.data);
                } else {
                    throw new Error("Invalid request");
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });

        await Promise.all(axiosRequests);

        res.json({ message: 'JSON file uploaded and processed successfully.', status: jsonStatus, data: jsonResponse });
    } catch (error) {
        res.status(500).json({ error: 'Error reading or parsing the uploaded JSON file.' });
    }
});
