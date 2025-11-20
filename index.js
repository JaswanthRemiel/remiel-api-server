import { generateRoast } from "./projects/roasthub/roasthub.js";

const routes = {
  "/roasthub/generate": {
    POST: generateRoast,
  },
};

export default async ({ req, res, log, error }) => {
  try {
    const path = req.path || "/";
    const method = req.method;

    log(`${method} ${path}`);

    const origin = req.headers["origin"] || req.headers["Origin"] || "";
    const allowedDomainRegex = /^https?:\/\/([a-z0-9-]+\.)?remiel\.work$/i;

    const isAllowed = allowedDomainRegex.test(origin) || !origin;

    // Set CORS headers - Appwrite requires setting headers object directly
    const corsHeaders = {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (isAllowed && origin) {
      corsHeaders["Access-Control-Allow-Origin"] = origin;
      corsHeaders["Access-Control-Allow-Credentials"] = "true";
    } else if (isAllowed) {
      corsHeaders["Access-Control-Allow-Origin"] = "*";
    } else if (origin) {
      // Unauthorized origin
      corsHeaders["Access-Control-Allow-Origin"] = "https://remiel.work";
    }

    // Handle preflight OPTIONS request
    if (method === "OPTIONS") {
      return res.text("", 204, corsHeaders);
    }

    // Block unauthorized origins for actual requests
    if (!isAllowed && origin) {
      log(`Blocked request from unauthorized origin: ${origin}`);
      return res.json({ error: "Unauthorized origin" }, 403, corsHeaders);
    }

    const route = routes[path];
    if (!route || !route[method]) {
      return res.json(
        { error: `Route ${method} ${path} not found` },
        404,
        corsHeaders
      );
    }

    const mockReq = {
      body: typeof req.body === "string" ? JSON.parse(req.body) : req.body,
      headers: req.headers,
      method: req.method,
      path: req.path,
    };

    let responseData = null;
    let statusCode = 200;

    const mockRes = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
          },
        };
      },
      json: (data) => {
        responseData = data;
      },
    };

    await route[method](mockReq, mockRes);

    return res.json(responseData || {}, statusCode, corsHeaders);
  } catch (err) {
    error(`Error: ${err.message}`);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    return res.json(
      { error: err.message || "Internal server error" },
      500,
      corsHeaders
    );
  }
};
