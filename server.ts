import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxt9uNCBR-f_Bic5HqRGqNtFoEgfqhGwfYsGVDFgpolkziJZP3ar_DBM7uRryWaWzQamQ/exec";

// 1. Google Apps Script Proxy Endpoint
app.post("/api/appscript", async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.json({ success: true, data });
    } catch {
      // If Apps Script returns raw text
      res.json({ success: true, data: text });
    }
  } catch (error: any) {
    console.error("Apps Script proxy error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to communicate with Google Apps Script",
    });
  }
});

// Serve frontend assets & mount Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
