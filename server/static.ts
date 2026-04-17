import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(
    typeof __dirname !== "undefined" ? __dirname : path.dirname(new URL(import.meta.url).pathname),
    "public"
  );
  if (!fs.existsSync(distPath)) {
    return;
  }

  app.use(express.static(distPath));

  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
