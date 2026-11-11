
import { serve } from "bun";
import index from "./index.html";

// The error pages live next to this file: ./errors/404.html, ./errors/403.html, ...
const ERRORS_DIR = `${import.meta.dir}/errors`;

// Sends errors/<status>.html with the matching HTTP status code.
async function errorPage(status: number, headers: HeadersInit = {}) {
	const file = Bun.file(`${ERRORS_DIR}/${status}.html`);
	if (!(await file.exists())) return new Response(String(status), { status, headers });
	return new Response(file, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

const server = serve({
	routes: {
		"/": index,                       // the portfolio (do NOT keep a "/*": index catch-all)
		"/teapot": () => errorPage(418),  // easter egg
	},

	// Everything that matches no route above ends up here.
	async fetch(req) {
		// Only reading is supported on this site.
		if (req.method !== "GET" && req.method !== "HEAD") {
			return errorPage(405, { Allow: "GET, HEAD" });
		}

		if (req.url.length > 2048) return errorPage(414);

		let path: string;
		try {
			path = decodeURIComponent(new URL(req.url).pathname);
		} catch {
			return errorPage(400); // malformed %-encoding in the address
		}

		// .env, .git, ... never exist here, and it's nobody's business.
		if (path.split("/").some((part) => part.startsWith("."))) return errorPage(403);

		return errorPage(404);
	},

	development: process.env.NODE_ENV !== "production" && { hmr: true, console: true },
});

console.log(`🚀 Server running at ${server.url}`);

// In your own code, other codes work the same way:
//   return errorPage(401, { "WWW-Authenticate": 'Basic realm="private"' });
//   return errorPage(429, { "Retry-After": "60" });
//   return errorPage(410); // page removed on purpose
