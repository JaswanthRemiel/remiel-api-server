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

    res.headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (method === "OPTIONS") {
      return res.send("", 204);
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

    const mockRes = {
      status: (code) => ({
        json: (data) => res.json(data, code),
      }),
      json: (data) => res.json(data),
    };

    await route[method](mockReq, mockRes);
  } catch (err) {
    error(`Error: ${err.message}`);
    return res.json({ error: err.message || "Internal server error" }, 500);
  }
};
