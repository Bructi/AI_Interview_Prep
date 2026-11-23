// Vercel serverless entry point for the Express backend
// Exports the Express app as a serverless handler

const server = require('../server');

// Export the Express app for Vercel serverless functions
module.exports = server;
