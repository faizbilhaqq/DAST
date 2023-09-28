const fs = require("fs");
const axios = require('axios');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

class InvalidURLsError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidURLsError';
    }
}

async function processJSONFile(filePath, email) {
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const jsonObject = JSON.parse(jsonData);
        const jsonStatus = { status: [] };
        const jsonResponse = { response: [] };

        const urlValues = [];
        findUrls(jsonObject, urlValues);

        if (validateUrls(urlValues)) {
            throw new InvalidURLsError('URLs starting with "{{url}}" found in the JSON data. Please fill with the correct host.');
        }

        let jsonRequest = {
            "method": "POST",
            "endpoint": "/scan",
            "parameters": {"urls": urlValues} 
        };

        const axiosRequest = async () => {
            try {
                const response = await axios.post(process.env.BURP_API_URL + jsonRequest.endpoint, jsonRequest.parameters);
                checkScanningStatus(process.env.BURP_API_URL + jsonRequest.endpoint + "/" + response.headers.location, response.headers.location, email);
                jsonStatus.status.push(response.status);
                jsonResponse.response.push(response.data);
            } catch (error) {
                throw error;
            }
        };

        await axiosRequest();

        return { status: jsonStatus, data: jsonResponse };

    } catch (error) {
        if (error instanceof InvalidURLsError) {
            throw error; 
        } else {
            throw new Error('Error reading or parsing JSON file.');
        }
    }
}

function findUrls(obj, urlValues) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (key === "url") {
                urlValues.push(value.raw);
            } else if (typeof value === "object") {
                findUrls(value, urlValues); 
            }
        }
    }
}

function validateUrls(urlValues) {
    for (const url of urlValues) {
        if (!url.startsWith('{{url}}')) {
            return false;
        }
    }

    return true;
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
      'Api-Key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    };
    
    const scanResultsString = JSON.stringify(scanResults);
    const listItems = generateListItems(scanResults.issue_events);

    const emailContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Scan Results</title>
            <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
                margin: 0;
                padding: 0;
            }
            header {
                background-color: #333;
                color: white;
                text-align: center;
                padding: 20px 0;
            }
            h1 {
                font-size: 24px;
            }
            .section {
                background-color: #fff;
                margin: 20px;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
            }
            .severity {
                font-weight: bold;
                color: #d9534f; /* Red for high severity */
            }
            .url {
                color: #007bff;
                text-decoration: none;
            }
            .url:hover {
                text-decoration: underline;
            }
            .medium-severity {
                color: #f0ad4e; /* Orange for medium severity */
            }
            .low-severity {
                color: #5bc0de; /* Blue for low severity */
            }
            .high-severity-bg {
                background-color: #f2dede; /* Light red background for high severity */
            }
            .medium-severity-bg {
                background-color: #fcf8e3; /* Light yellow background for medium severity */
            }
            .low-severity-bg {
                background-color: #d9edf7; /* Light blue background for low severity */
            }
            </style>
        </head>
        <body>
        <header>
        <h1>Penetration Testing Report</h1>
    </header>

    <div class="section low-severity-bg"  >
        <h2>Issue 1: Vulnerability Description</h2>
        <p class="severity">Severity: </p>
        <p>Name: </p>
        <p>Description: </p>
        <p>Affected Point: </p>
        <p>Remediation: </p>
        <p>Affected URL: <a class="url" href="https://www.example.com/vulnerable-page">https://www.example.com/vulnerable-page</a></p>
       
        
    </div>
        </body>
        </html>
    `;


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
      htmlContent: emailContent 
    }
    
    axios.post(url, data, { headers })
      .then(response => {
        console.log('Response Status Code:', response.status);
        console.log('Response Data:', response.data);
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
}

function generateListItems(issueEvents) {
    return issueEvents.map(item => `
        <tr>
            <td class="left" >Name<br> Description <br> Severity <br>Remediation  <br> Affected Point  </td>
            <td class="right" >${item.issue.name} <br>${item.issue.issue_background} <br>${item.issue.severity} <br> ${item.issue.remediation_background} <br> ${item.issue.origin} ${item.issue.path} </td>
        </tr>
    `).join('');
}

module.exports = {
    processJSONFile,
};