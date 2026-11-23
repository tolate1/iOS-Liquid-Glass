import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, extname, sep } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const allowed = ["examples", "dist"].map((path) => resolve(root, path) + sep);
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

export function createDemoServer() {
  return createServer(async (request, response) => {
    try {
      const { pathname } = new URL(request.url, "http://localhost");
      const name = pathname === "/" ? "/examples/gallery/index.html" : decodeURIComponent(pathname);
      const path = resolve(root, "." + name);
      const type = mime[extname(path)];
      if (!type || !allowed.some((prefix) => path.startsWith(prefix)) || !(await stat(path)).isFile()) {
        response.writeHead(404).end("Not found");
        return;
      }
      response.writeHead(200, { "Content-Type": type + "; charset=utf-8" });
      createReadStream(path).on("error", () => response.destroy()).pipe(response);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4173);
  createDemoServer().listen(port, "127.0.0.1", () => console.log(`Gallery at http://127.0.0.1:${port}`));
}
