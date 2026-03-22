import type { Express } from "express";
import type { Server } from "http";
import type { ViteDevServer } from "vite";
import { logger } from "./logger";

export async function setupVite(server: Server, app: Express) {
  const { createServer: createViteServer } = await import("vite");

  const vite: ViteDevServer = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "spa",
  });

  app.use(vite.middlewares);

  app.use("/{*path}", async (_req, res, next) => {
    try {
      const url = _req.originalUrl;
      const template = await vite.transformIndexHtml(
        url,
        await (await import("fs")).promises.readFile(
          new URL("../client/index.html", import.meta.url).pathname,
          "utf-8"
        )
      );
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  logger.info("Vite dev server initialized");
}
