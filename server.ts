import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./server/app";

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("[Backend-Server] Registering Vite development middleware (SPA Mode)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Backend-Server] Serving production static build...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Backend-Server] Running smoothly on port ${PORT}`);
  });
}

// Make sure express is imported if used in static files route (though app already has it, we use express.static here)
import express from "express";

startServer();

