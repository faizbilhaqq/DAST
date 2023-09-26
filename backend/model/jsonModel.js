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
      'Api-Key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    };
    
    console.log(scanResults);
    const scanResultsString = JSON.stringify(scanResults);

    const emailContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Scan Results</title>
            <style>
                /* Add CSS styles here */
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                h1 {
                    color: #333;
                }
                dt {
                    font-weight: bold;
                    margin-top: 15px;
                }
                ul {
                    list-style-type: none;
                    padding: 0;
                }
                li {
                    margin-bottom: 10px;
                }
                li strong {
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Scan Results</h1>
                <p>Task id: ${taskId}</p>
                <p >Scan Status: ${scanResults.scan_status}</p>
            
                <dl>
                    <dt>Daftar Temuan</dt>
                    <ul id="temuan-list">
                        ${generateListItems(scanResults.issue_events)}
                    </ul>
                </dl>
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
        <li>
            <strong>Name:</strong> ${item.name}<br>
            <strong>Description:</strong> ${item.issue_background}<br>
            <strong>Severity:</strong> ${item.severity}<br>
            <strong>Remediation:</strong> ${item.remediation_background}<br>
            <strong>Affected Endpoint:</strong> ${item.origin} ${item.path}<br>
        </li>
    `).join('');
}

// async function processAPICollection(filePath, email) {
//     try {
//         const jsonData = fs.readFileSync(filePath, 'utf8');
//         const jsonObject = JSON.parse(jsonData);

//         let jsonRequest = {
//             "request": [
//                 {
//                     "method": "POST",
//                     "endpoint": "/scan",
//                     "parameters": {"urls":[]}
//                 }
//             ]
//         };

//         const requestParsing = jsonObject.item.map(async (task) => {
//             const itemParsing = task.item.map(async (endpoint) => {
//                 try {
//                     console.log(endpoint.name);
//                     console.log(endpoint.request.url.raw);
//                 } catch(error) {
//                     console.log(endpoint.request);
//                 }
//                 //jsonRequest.request[0].parameters.urls.push(endpoint.request.url.raw);
//             });
//         });

//         //console.log(jsonRequest);

//     } catch (error) {
//         console.log(error);
//         throw new Error('Error reading or parsing JSON file.');
//     }
// }

module.exports = {
    processJSONFile,
};