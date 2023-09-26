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
                   <p style="font-size: 18px;" > <b>task id: </b> </p>
                   /* Put dynamic data of task id here */
                    <h1>50 </h1>
                </div>
                <div class="scanStatus">
                    <h1>Succeded </h1>
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
                <tr>
                    <td class="left" >Name<br> Description <br> Severity <br>Remediation  <br> Affected Point  </td>
                    <td class="right" >ini hasil <br>ini hasil <br>ini hasil <br> ini hasil <br>ini hasil </td>
                </tr>
                <tr>
                    <td class="left" >Name<br> Description <br> Severity <br>Remediation  <br> Affected Point  </td>
                    <td class="right" >ini hasil <br>ini hasil <br>ini hasil <br> ini hasil <br>ini hasil </td>
                </tr>
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