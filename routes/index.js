// const express = require('express');
// const axios = require('axios');
// const app = express();
// const path = require('path');
// require('dotenv').config();
//
// // Jenkins API setup
// const JENKINS_URL = process.env.JENKINS_URL;
// const JENKINS_USER = process.env.JENKINS_USER;
// const JENKINS_API_TOKEN = process.env.JENKINS_API_TOKEN;
//
// app.use(express.static(path.join(__dirname, 'public')));
//
// // Process chatbot message
// app.get('/chatbot/message', async (req, res) => {
//   const userMessage = req.query.text;
//   let responseMessage = '';
//
//   if (userMessage.toLowerCase().startsWith('status')) {
//     const jobName = userMessage.split(' ')[1];
//     try {
//       const buildResponse = await axios.get(`${JENKINS_URL}/job/${jobName}/lastBuild/api/json`, {
//         auth: {
//           username: JENKINS_USER,
//           password: JENKINS_API_TOKEN
//         }
//       });
//       const build = buildResponse.data;
//       responseMessage = `Job: ${jobName}, Build: ${build.number}, Status: ${build.result}`;
//     } catch (error) {
//       responseMessage = `Failed to get status for job: ${jobName}`;
//     }
//   } else if (userMessage.toLowerCase().startsWith('logs')) {
//     const jobName = userMessage.split(' ')[1];
//     try {
//       const logResponse = await axios.get(`${JENKINS_URL}/job/${jobName}/lastBuild/consoleText`, {
//         auth: {
//           username: JENKINS_USER,
//           password: JENKINS_API_TOKEN
//         }
//       });
//       const logData = logResponse.data.split('\n').slice(-10).join('\n'); // Get last 10 lines of log
//       responseMessage = `Logs for ${jobName}:\n${logData}`;
//     } catch (error) {
//       responseMessage = `Failed to get logs for job: ${jobName}`;
//     }
//   } else {
//     responseMessage = 'Invalid command. Please use "status <job_name>" or "logs <job_name>".';
//   }
//
//   res.json({ response: responseMessage });
// });
//
// // Serve the chatbot interface
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });
//
// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
