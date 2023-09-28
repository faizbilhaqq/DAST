// jsonController.js
const { processJSONFile } = require('../model/jsonModel');
const { processURL } = require('../model/urlModel');

async function uploadJSON(req, res) {
    let arg = null;
    let isFile = true;

    if (!req.file) {
        arg = req.body.URL;
        isFile = false;
    } else {
        arg = req.file.path;
    }

    const email = req.body.email;

    try {
        if (isFile) {
            const result = await processJSONFile(arg, email);
            res.json({ message: 'JSON file uploaded and processed successfully.', ...result });
        } else {
            const result = await processURL(arg, email);
            res.json({ message: 'URL uploaded and processed successfully.', ...result });            
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    uploadJSON,
};
