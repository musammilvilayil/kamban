import serverless from "serverless-http";
import app from "../../server/app.js";

// serverless-http expects Netlify's Lambda-style event/context handler.
// Environment variables are injected by Netlify before the function runs.
export const handler = serverless(app);
