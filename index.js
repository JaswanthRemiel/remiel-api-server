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

    if (isAllowed && origin) {
      res.headers = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true",
      };
    } else if (isAllowed) {
      res.headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };
    }

    if (method === "OPTIONS") {
      if (!isAllowed && origin) {
        return res.json({ error: "Unauthorized origin" }, 403);
      }
      return res.send("", 204);
    }

    if (!isAllowed && origin) {
      log(`Blocked request from unauthorized origin: ${origin}`);
      return res.json({ error: "Unauthorized origin" }, 403);
    }

    const route = routes[path];
    if (!route || !route[method]) {
      return res.json({ error: `Route ${method} ${path} not found` }, 404);
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

    return res.json(responseData || {}, statusCode);
  } catch (err) {
    error(`Error: ${err.message}`);
    return res.json({ error: err.message || "Internal server error" }, 500);
  }
};
