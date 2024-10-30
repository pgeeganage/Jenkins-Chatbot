// const axios = require('axios');
//
// // Jenkins API configuration
// const JENKINS_URL = 'https://dev-jenkins.aws.wiley.com'; // Replace with your Jenkins URL
// const SYSTEM_CODE =  'CCP' // 'your-system-code'; // Replace with your project's System Code
// const JOB_NAME =  'ces-enrichment-audit-ui' //'your-job_name'; // Replace with your job name
// const API_TOKEN =  '11d5a45bc8147a9aba64c511cad3f88421' // 'your-api-token'; // Jenkins API token
// const USERNAME =  'pgeeganage@wiley.com' // 'your-jenkins-username'; // Jenkins username
//
// // Fetch the latest build status
// const getBuildStatus = async () => {
//     // const url = `${JENKINS_URL}/job/${SYSTEM_CODE}/job/build/job/${JOB_NAME}/lastBuild/api/json`;
//     const url = `${JENKINS_URL}/job/${JOB_NAME}/lastBuild/api/json`;
//     const auth = { username: USERNAME, password: API_TOKEN };
//
//     try {
//         const response = await axios.get(url, { auth });
//         const { result, id, duration } = response.data;
//         return {
//             status: result,
//             buildId: id,
//             duration: (duration / 1000).toFixed(2) // Convert to seconds
//         };
//     } catch (error) {
//         throw new Error(`Error fetching build status: ${error.message}`);
//     }
// };
//
// // Fetch the logs of a build
// const getBuildLogs = async (buildId) => {
//     const url = `${JENKINS_URL}/job/${JOB_NAME}/${buildId}/consoleText`;
//     const auth = { username: USERNAME, password: API_TOKEN };
//
//     try {
//         const response = await axios.get(url, { auth });
//         return response.data;
//     } catch (error) {
//         throw new Error(`Error fetching build logs: ${error.message}`);
//     }
// };
//
// module.exports = {
//     getBuildStatus,
//     getBuildLogs
// };
