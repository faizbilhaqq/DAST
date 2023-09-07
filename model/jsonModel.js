const fs = require("fs");
const axios = require('axios');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

async function processJSONFile(filePath, email) {
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const jsonObject = JSON.parse(jsonData);
        const jsonStatus = { status: [] };
        const jsonResponse = { response: [] };

        const axiosRequests = jsonObject.request.map(async (task) => {
            try {
                if (task.method === "POST") {
                    const response = await axios.post(process.env.BURP_API_URL + task.endpoint, task.parameters);
                    checkScanningStatus(process.env.BURP_API_URL + task.endpoint + "/" + response.headers.location, response.headers.location, email);
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

async function checkScanningStatus(url, taskId, email) {
    const cronSchedule = '*/1 * * * *';

    const scheduledJob = cron.schedule(cronSchedule, () => makeApiCall(url, scheduledJob, taskId, email));

    console.log('API for Task ' + taskId + ' call scheduled. Running every 1 minute.');
}

async function makeApiCall(url, scheduledJob, taskId, email) {
    try {
        const response = await axios.get(url);
        console.log('API Response for Task ' + taskId +':', response.data.scan_status);

        if (response.data.scan_status === 'succeeded' || response.data.scan_status === 'failed') {
            console.log('Received "succeeded" or "failed" response. Stopping API for Task ' + taskId + ' calls.');
            sendNotificationEmail(response.data, taskId, email);
            scheduledJob.stop(); 
        }

    } catch (error) {
        console.error('API for Task ' + taskId + ' Error:', error.message);
    }
}

async function sendNotificationEmail(scanResults, taskId, email) {
    const url = 'https://api.brevo.com/v3/smtp/email';

    const headers = {
      'User-Agent': 'curl/7.77.0',
      'Accept': 'application/json',
      'Api-Key': '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',
      'Content-Type': 'application/json',
    };
    
    console.log(email);
    console.log(typeof(email));
    const scanResultsString = JSON.stringify(scanResults);

    const data = {
      sender: {
        name: 'Rheza Sender',
        email: 'rerheza@gmail.com',
      },
      to: [
        {
          email: email,
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