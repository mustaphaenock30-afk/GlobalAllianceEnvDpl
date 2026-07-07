import "./lib/error-capture";
import fs from "node:fs";
import path from "node:path";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      if (pathname.startsWith("/images/")) {
        let filename = pathname.substring("/images/".length);
        try {
          filename = decodeURIComponent(filename);
        } catch (e) {
          // Ignore decoding error
        }

        if (filename && !filename.includes("..")) {
          const localPaths = [
            path.resolve(process.cwd(), ".output/public/images", filename),
            path.resolve(process.cwd(), "public/images", filename),
          ];

          let existsLocally = false;
          for (const p of localPaths) {
            if (fs.existsSync(p)) {
              existsLocally = true;
              break;
            }
          }

          if (!existsLocally) {
            console.log(
              `[Server] Image ${filename} is missing locally. Attempting recovery from Supabase Storage...`,
            );
            try {
              const { supabaseAdmin } = await import("./integrations/supabase/client.server");
              const { data: blob, error } = await supabaseAdmin.storage
                .from("synced-images")
                .download(filename);

              if (error) {
                console.error(`[Server] Failed to download ${filename} from Supabase:`, error);
              } else if (blob) {
                const arrayBuffer = await blob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Cache it locally so subsequent requests serve instantly
                for (const dirName of ["public/images", ".output/public/images"]) {
                  const targetDir = path.resolve(process.cwd(), dirName);
                  if (fs.existsSync(targetDir) || dirName === "public/images") {
                    fs.mkdirSync(targetDir, { recursive: true });
                    const filePath = path.join(targetDir, filename);
                    fs.writeFileSync(filePath, buffer);
                  }
                }
                console.log(
                  `[Server] Successfully recovered ${filename} from Supabase and cached locally.`,
                );

                const mimeType = filename.toLowerCase().endsWith(".png")
                  ? "image/png"
                  : filename.toLowerCase().endsWith(".gif")
                    ? "image/gif"
                    : filename.toLowerCase().endsWith(".svg")
                      ? "image/svg+xml"
                      : "image/jpeg";

                return new Response(buffer, {
                  headers: {
                    "Content-Type": mimeType,
                    "Cache-Control": "public, max-age=31536000, immutable",
                  },
                });
              }
            } catch (recoveryErr) {
              console.error(`[Server] Recovery error for ${filename}:`, recoveryErr);
            }
          }
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
