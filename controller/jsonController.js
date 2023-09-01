// jsonController.js
const { processJSONFile } = require('../model/jsonModel');

async function uploadJSON(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = req.file.path;

    try {
        const result = await processJSONFile(filePath);
        res.json({ message: 'JSON file uploaded and processed successfully.', ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    uploadJSON,
};
