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
                /* Add CSS styles here */
                .scanResults{
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }
        
                .container{
                    text-align: center;
                }
        
                .content{
                    display: inline-block;
                    margin: 0 auto;
                    
                }
        
                .scanId{
                    width: 200px;
                    height: 100px;
                    background-color:blue;
                    border-radius: 10px;
                    border-width: 3px;
                    border-color: black;
                    border-style:solid;
                    display: block;
        
                }
        
                .scanStatus{
                    width: 250px;
                    height: 100px;
                    background-color:rgb(18, 160, 5);
                    border-radius: 10px;
                    border-width: 3px;
                    border-color: black;
                    border-style:solid;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
        
                .scanId h1{
                    color: white;
                    display: block;
                    margin-top: 7px;
                    font-size: 50px;
                   
                }
        
                .scanId p{
                    margin-top: 7px;
                    margin-bottom: 0;
                    color: white;
                }
        
                .scanStatus h1{
                    color: white;
                   
                }
                th {
        
                    background-color:rgb(0, 153, 255);
                    color: white;
                  
                    padding: 10px;
                }
                table{
                    
                    border-radius: 50px;
                    border-color: black;
                    border-collapse: collapse;
                    border: none;
                    
                }
        
                td{
                    text-align: left;
                    padding: 10px;
                    
                }
        
                .right {
                    text-align: center;
                    background-color:#cecdcd;
                    font-weight: bold;
                    font-size: 20px;
                }
        
                .left{
                    color: rgb(1, 115, 168);
                    font-size: 20px;
                    background-color: #FFF3DA;
        
                }
        
                
                table {
                    width:70%;
                    margin: auto;
                    margin-top: 20px;
        
                    
                }
        
                table, tr, td, th {
                    border: none;
                }
            </style>
        </head>
        <body>
    <div class="container">
        <div class="content">
            <h1>Scan Results</h1>
            <div class="scanResults">
                
                <div class="scanId">
                   <p style="font-size: 18px;" > <b>task id: ${taskId}</b> </p>
                   /* Put dynamic data of task id here */
                    <h1>50 </h1>
                </div>
                <div class="scanStatus">
                    <h1>${scanResults.scan_status}</h1>
                </div>
            </div>


            <table>
                <caption>
                    <h2 style="margin-bottom: 5px;" >Daftar temuan</h2>
                </caption>
                <tr>
                    <th>Description</th>
                    <th>Results</th>
                </tr>
                ${listItems}
            </table>
        </div>

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