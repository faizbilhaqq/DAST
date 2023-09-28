const { processURL } = require('../model/urlModel.js');

async function uploadURL(req, res) {
    console.log(req.body);

    const url = req.body.url;
    const email = req.body.email;

    try {
        const result = await processURL(url, email);
        res.json({ message: 'URL uploaded and processed successfully.', ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    uploadURL,
};