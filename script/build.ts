import * as esbuild from "esbuild";
import { execSync } from "child_process";

async function build() {
  console.log("Building client...");
  execSync("npx vite build", { stdio: "inherit" });

  console.log("Building server...");
  await esbuild.build({
    entryPoints: ["server/index.ts"],
    outfile: "dist/index.cjs",
    platform: "node",
    format: "cjs",
    bundle: true,
    minify: true,
    external: ["pg-native", "lightningcss", "fsevents"],
    alias: {
      "@shared": "./shared",
    },
  });

  console.log("Build complete!");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
