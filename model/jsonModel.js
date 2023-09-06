const fs = require("fs");
const axios = require('axios');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

async function processJSONFile(filePath) {
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const jsonObject = JSON.parse(jsonData);
        const jsonStatus = { status: [] };
        const jsonResponse = { response: [] };

        const axiosRequests = jsonObject.request.map(async (task) => {
            try {
                if (task.method === "POST") {
                    const response = await axios.post(process.env.BURP_API_URL + task.endpoint, task.parameters);
                    checkScanningStatus(process.env.BURP_API_URL + task.endpoint + "/" + response.headers.location, response.headers.location);
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
                throw error;
            }
        });

        await Promise.all(axiosRequests);

        return { status: jsonStatus, data: jsonResponse };
    } catch (error) {
        throw new Error('Error reading or parsing the JSON file.');
    }
}

async function checkScanningStatus(url, taskId) {
    const cronSchedule = '*/1 * * * *';

    const scheduledJob = cron.schedule(cronSchedule, () => makeApiCall(url, scheduledJob, taskId));

    console.log('API for Task ' + taskId + ' call scheduled. Running every 1 minute.');
}

async function makeApiCall(url, scheduledJob, taskId) {
    try {
        const response = await axios.get(url);
        console.log('API Response for Task ' + taskId +':', response.data.scan_status);

        if (response.data.scan_status === 'succeeded' || response.data.scan_status === 'failed') {
            console.log('Received "succeeded" or "failed" response. Stopping API for Task ' + taskId + ' calls.');
            sendNotificationEmail(response.data, taskId);
            scheduledJob.stop(); 
        }

    } catch (error) {
        console.error('API for Task ' + taskId + ' Error:', error.message);
    }
}

async function sendNotificationEmail(scanResults, taskId) {
    const url = 'https://api.brevo.com/v3/smtp/email';

    const headers = {
      'User-Agent': 'curl/7.77.0',
      'Accept': 'application/json',
      'Api-Key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    };
    
    console.log(scanResults);
    const scanResultsString = JSON.stringify(scanResults);

    const data = {
      sender: {
        name: 'Rheza Sender',
        email: 'rerheza@gmail.com',
      },
      to: [
        {
          email: 'rhezaec@gmail.com',
          name: 'Rheza Receiver',
        },
      ],
      subject: 'Burp Rest Scan Result',
      htmlContent: `<html><head></head><body>
      <p>Hello,</p>This is your burp rest scan result for task ${taskId}.</p>
      <p>${scanResultsString}</p>
      </body></html>`,
    };
    
    axios.post(url, data, { headers })
      .then(response => {
        console.log('Response Status Code:', response.status);
        console.log('Response Data:', response.data);
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
}

module.exports = {
    processJSONFile,
};