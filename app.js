
const express = require('express');
const axios = require('axios');
const app = express();
const path = require('path');
require('dotenv').config();

// Jenkins API setup
const JENKINS_URL = process.env.JENKINS_URL;
const JENKINS_USER = process.env.JENKINS_USER;
const JENKINS_API_TOKEN = process.env.JENKINS_API_TOKEN;

// Define a map of log messages to their corresponding print messages
const logMessageMap = {
  "[Pipeline] Start of Pipeline": "Pipeline Started",
  "[Pipeline] stage": "Stage Started",
  "[Pipeline] { (Declarative: Checkout SCM)": "Checkout SCM Stage Started",
  "[Pipeline] checkout": "Checkout Step Executed",
  "[Pipeline] withEnv": "Environment Set",
  "[Pipeline] withCredentials": "Credentials Used",
  "[Pipeline] withSonarQubeEnv": "SonarQube Environment Set",
  "[Pipeline] { (Init)": "Initialization Stage Started",
  "[Pipeline] echo": "Echo Command Executed",
  "[Pipeline] { (Generate Version)": "Version Generation Stage Started",
  "[Pipeline] { (Build an image)": "Image Build Stage Started",
  "[Pipeline] script": "Script Execution Started",
  "[Pipeline] sh": "Shell Command Executed"
};

// Define indicators for success and error
const successIndicators = ["SUCCESS", "Completed successfully"];
const errorIndicators = ["ERROR", "Failed", "Aborted", "Exception"];

const matchedSteps = {};

app.use(express.static(path.join(__dirname, 'public')));

// Simulate AI-based error analysis (mock implementation)
function analyzeLogs(logs) {
  const suggestions = [];

  if (logs.includes('OutOfMemoryError')) {
    suggestions.push('The build failed due to insufficient memory. Try increasing the heap size or optimizing memory usage in your code.');
  }
  if (logs.includes('Permission denied')) {
    suggestions.push('Permission issues detected. Make surcleae Jenkins has the necessary permissions to access files or directories.');
  }
  if (logs.includes('Missing dependency')) {
    suggestions.push('A dependency is missing. Check your build configuration and ensure all necessary dependencies are installed.');
  }
  if (logs.includes('Command not found')) {
    suggestions.push('A required command was not found. Ensure the correct build tools are installed and available in your environment.');
  }
  if (logs.includes('BUILD FAILURE') || logs.includes('FAILURE')) {
    suggestions.push('Build failed due to an unspecified error.');
  }

  if (suggestions.length === 0) {
    suggestions.push('No specific issues detected. Please review the full logs for details.');
  }

  return suggestions.join('\n');
}

// Process chatbot message
app.get('/chatbot/message', async (req, res) => {
  const userMessage = req.query.text;
  let responseMessage = '';

  const split = userMessage.split(' ');
  const jobType = split[0]; // build, deploy
  const command = split[1]; // status, logs
  const systemCode = split[2];
  const jobName = split[3];
  const branchName = split[4];
  const buildNumber = split[5];

  console.log("branchName: " + branchName);
  console.log("buildNumber: " + buildNumber);
  console.log("userMessage.toLowerCase(): " + userMessage.toLowerCase());
  if (userMessage.toLowerCase().startsWith('build') || userMessage.toLowerCase().startsWith('deploy')) {
    const subCommand = userMessage.replace(jobType, '').trim();
    console.log("subCommand: " + subCommand);
    if (subCommand.startsWith('status')) {
      try {

        const buildUrl = jobType === 'build'
            ? (buildNumber
                ? `${JENKINS_URL}/job/${systemCode}/job/build/job/${jobName}/job/${branchName}/${buildNumber}/api/json`
                : `${JENKINS_URL}/job/${systemCode}/job/build/job/${jobName}/job/${branchName}/lastBuild/api/json`)
            : (branchName
                ? `${JENKINS_URL}/job/${systemCode}/job/deploy/job/K8s-deploy-nonprod/${branchName}/api/json`
                : `${JENKINS_URL}/job/${systemCode}/job/deploy/job/K8s-deploy-nonprod/lastBuild/api/json`);

        console.log(buildUrl);
        const buildResponse = await axios.get(buildUrl, {
          auth: {
            username: JENKINS_USER,
            password: JENKINS_API_TOKEN
          }
        });
        const build = buildResponse.data;
        responseMessage = `Job: ${jobName}, Build: ${build.number}, Status: ${build.result}`;
      } catch (error) {
        responseMessage = `Failed to get status for job: ${jobName}. Error: ${error.message}`;
      }
    } else if (subCommand.startsWith('logs')) {
      try {
        // const logUrl = buildNumber
        //     ? `${JENKINS_URL}/job/${systemCode}/job/build/job/${jobName}/job/${branchName}/${buildNumber}/consoleText`
        //     : `${JENKINS_URL}/job/${systemCode}/job/build/job/${jobName}/job/${branchName}/lastBuild/consoleText`;

        const logUrl = jobType === 'build'
            ? (buildNumber
                ? `${JENKINS_URL}/job/${systemCode}/job/build/job/${jobName}/job/${branchName}/${buildNumber}/consoleText`
                : `${JENKINS_URL}/job/${systemCode}/job/build/job/${jobName}/job/${branchName}/lastBuild/consoleText`)
            : (branchName
                ? `${JENKINS_URL}/job/${systemCode}/job/deploy/job/K8s-deploy-nonprod/${branchName}/consoleText`
                : `${JENKINS_URL}/job/${systemCode}/job/deploy/job/K8s-deploy-nonprod/lastBuild/consoleText`);

        console.log(logUrl);
        const logResponse = await axios.get(logUrl, {
          auth: {
            username: JENKINS_USER,
            password: JENKINS_API_TOKEN
          }
        });
        const logData = logResponse.data;
        const logLines = logData.trim().split('\n');
        processLog(logLines);
        let logStepProgress = '';
        if (Object.keys(matchedSteps).length > 0) {
          logStepProgress = "Build Steps:\n";
          for (const [step, status] of Object.entries(matchedSteps)) {
            logStepProgress += `\n${step}: ${status}`;
          }
        } else {
          logStepProgress += "No matched steps found in the log.";
        }
        console.log(logStepProgress)
        const suggestions = analyzeLogs(logData); // Analyze logs for errors and suggestions
        responseMessage = `Logs for ${jobName}:\n\n${logStepProgress}\n\nSuggestions:\n${suggestions}`;
      } catch (error) {
        responseMessage = `Failed to get logs for job: ${jobName}. Error: ${error.message}`;
      }
    }
  } else {
    responseMessage = 'Invalid command. Please use "build/deploy status <systemCode> <jobName> <branchName> [buildNumber]"\n or "build/deploy logs <systemCode> <jobName> <branchName> [buildNumber]".';
  }

  res.json({ response: responseMessage });
});

function processLog(logLines) {
  logLines.forEach(logLine => {
    // Check if the log line matches any defined patterns
    for (const [match, outputMessage] of Object.entries(logMessageMap)) {
      if (logLine.includes(match)) {
        // Default status to success unless error indicators are found
        let status = "Success";

        // Check for error indicators in the log line
        if (errorIndicators.some(indicator => logLine.includes(indicator))) {
          status = "Error";
        }

        // Add the step and its status to matchedSteps
        matchedSteps[outputMessage] = status;
      }
    }
  });
}

// Serve the chatbot interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
