import serverless from "serverless-http";
import app from "../../server/app.js";

const expressHandler = serverless(app);

export default async (request, context) => {
  // Netlify keeps secrets server-side; mirror them for the existing Express app.
  process.env.MONGO_URI = Netlify.env.get("MONGO_URI") || process.env.MONGO_URI;
  process.env.OPENAI_API_KEY =
    Netlify.env.get("OPENAI_API_KEY") || process.env.OPENAI_API_KEY;

  return expressHandler(request, context);
};

export const config = {
  path: "/api/*",
};
