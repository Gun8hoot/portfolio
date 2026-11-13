import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Lang } from "./Glossary";

// Cloudflare Turnstile. The site key is public by design (the secret key stays on the API).
// Create the widget in the Cloudflare dashboard (Turnstile) and allow this site's hostname there.
// For local development, Cloudflare's test key "1x00000000000000000000AA" always passes.
//
// The key comes from BUN_PUBLIC_TURNSTILE_SITE_KEY (real environment variable first, then .env),
// which Bun writes into the code when it bundles the page. This needs two things:
//   - bunfig.toml:  [serve.static]  env = "BUN_PUBLIC_*"
//   - the literal text `process.env.BUN_PUBLIC_TURNSTILE_SITE_KEY` below (no destructuring, no process.env[name])
// When the variable doesn't exist, Bun leaves `process` in the code and the browser throws a
// ReferenceError: the try/catch turns that into an empty key instead of a crashed page.
const TURNSTILE_SITE_KEY = (() => {
	try {
		return process.env.BUN_PUBLIC_TURNSTILE_SITE_KEY ?? "";
	} catch {
		return "";
	}
})();
if (!TURNSTILE_SITE_KEY) console.error("BUN_PUBLIC_TURNSTILE_SITE_KEY is not set: the contact form cannot be verified.");
const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
	render: (container: HTMLElement, options: Record<string, unknown>) => string;
	reset: (widgetId?: string) => void;
	remove: (widgetId?: string) => void;
};

declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

// The script is added to the page once, the first time a form needs it.
let turnstileScript: Promise<void> | null = null;
const loadTurnstile = () =>
	(turnstileScript ??= new Promise<void>((resolve, reject) => {
		if (window.turnstile) return resolve();
		const script = document.createElement("script");
		script.src = TURNSTILE_SCRIPT;
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => {
			turnstileScript = null; // blocked or offline: allow a retry on the next render
			reject(new Error("Turnstile failed to load"));
		};
		document.head.appendChild(script);
	}));

type UIText = {
	emailLabel: string;
	subjectLabel: string;
	messageLabel: string;
	send: string;
	sending: string;
	success: string;
	error: string;
	invalid: string;
	captchaMissing: string; // the verification isn't done yet
	captchaFailed: string; // the API refused the verification
	captchaUnavailable: string; // the Cloudflare script could not be loaded
};

type Status = "idle" | "sending" | "success" | "error" | "invalid" | "captcha" | "captchaFailed";

// Everything below runs on each field right before it's sent — it never touches
// what the visitor sees typed in the form, only what goes over the wire.
// Strips control characters (keeping real newlines in the message), escapes
// HTML so a message can't inject markup/formatting wherever it ends up
// rendered downstream, and breaks mass-mention triggers like "@room".
const stripControlChars = (s: string) => s.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "");

const escapeHtml = (s: string) =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

const neutralizeMentions = (s: string) => s.replace(/@room/gi, "@\u200Broom");

const sanitize = (value: string, maxLength: number) =>
	escapeHtml(neutralizeMentions(stripControlChars(value.trim()))).slice(0, maxLength);

export function ContactForm({ ui, lang }: { ui: UIText; lang: Lang }) {
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [honeypot, setHoneypot] = useState(""); // must stay empty; real visitors never see this field
	const [status, setStatus] = useState<Status>("idle");

	// Turnstile: the widget gives a token once the visitor passes; the API checks it with Cloudflare.
	const widgetRef = useRef<HTMLDivElement>(null);
	const widgetId = useRef<string>();
	const [token, setToken] = useState("");
	const [widgetBlocked, setWidgetBlocked] = useState(false);

	// Rendered again when the language changes, so the widget's own text follows the page.
	useEffect(() => {
		let cancelled = false;
		setToken("");
		loadTurnstile()
			.then(() => {
				if (cancelled || !widgetRef.current || !window.turnstile) return;
				setWidgetBlocked(false);
				widgetId.current = window.turnstile.render(widgetRef.current, {
					sitekey: TURNSTILE_SITE_KEY,
					theme: "dark",
					language: lang,
					callback: (t: string) => setToken(t),
					"expired-callback": () => setToken(""),
					"error-callback": () => setToken(""),
				});
			})
			.catch(() => {
				if (!cancelled) setWidgetBlocked(true);
			});

		return () => {
			cancelled = true;
			if (widgetId.current !== undefined) {
				window.turnstile?.remove(widgetId.current);
				widgetId.current = undefined;
			}
		};
	}, [lang]);

	// A token works only once: after every attempt, the visitor gets a fresh check.
	const resetCaptcha = () => {
		setToken("");
		if (widgetId.current !== undefined) window.turnstile?.reset(widgetId.current);
	};

	const resetForm = () => {
		setEmail("");
		setSubject("");
		setMessage("");
	};

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();

		// A bot filled the field real visitors can't see: pretend it worked and drop it,
		// so the bot doesn't learn it was caught and try again smarter.
		if (honeypot) {
			setStatus("success");
			resetForm();
			return;
		}

		if (!token) {
			setStatus("captcha");
			return;
		}

		setStatus("sending");
		try {
			const res = await fetch("https://gun8hoot.me/api/sendMessage", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: sanitize(email, 254),
					subject: sanitize(subject, 150),
					message: sanitize(message, 5000),
					turnstileToken: token,
				}),
			});

			if (res.status === 200) {
				setStatus("success");
				resetForm();
			} else if (res.status === 400) {
				// Invalid body — don't drop the typed message.
				setStatus("invalid");
			} else if (res.status === 403) {
				// Cloudflare refused the verification.
				setStatus("captchaFailed");
			} else {
				// 500 or anything else unexpected: a generic failure, no details on why.
				setStatus("error");
			}
		} catch {
			// Network/CORS failure before even reaching the API.
			setStatus("error");
		}
		resetCaptcha();
	};

	return (
		<form className="contact_form" onSubmit={onSubmit} noValidate={false}>
			{/* Honeypot: hidden from sighted and keyboard users, left empty by them, often filled by bots. */}
			<label className="contact_honeypot" aria-hidden="true">
				Leave this field empty
				<input
					type="text"
					name="website"
					tabIndex={-1}
					autoComplete="off"
					value={honeypot}
					onChange={(e) => setHoneypot(e.target.value)}
				/>
			</label>

			<label className="contact_field">
				<span>{ui.emailLabel}</span>
				<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
			</label>

			<label className="contact_field">
				<span>{ui.subjectLabel}</span>
				<input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} />
			</label>

			<label className="contact_field">
				<span>{ui.messageLabel}</span>
				<textarea
					required
					rows={5}
					maxLength={5000}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
			</label>

			{/* Cloudflare Turnstile draws itself here (fixed height: the form must not jump when it loads) */}
			<div ref={widgetRef} className="contact_turnstile" />
			{widgetBlocked && <p className="contact_status contact_status--err">{ui.captchaUnavailable}</p>}

			<button type="submit" className="contact_submit" disabled={status === "sending"}>
				{status === "sending" ? ui.sending : ui.send}
			</button>

			{status === "success" && <p className="contact_status contact_status--ok">{ui.success}</p>}
			{status === "captcha" && <p className="contact_status contact_status--err">{ui.captchaMissing}</p>}
			{status === "captchaFailed" && <p className="contact_status contact_status--err">{ui.captchaFailed}</p>}
			{status === "invalid" && <p className="contact_status contact_status--err">{ui.invalid}</p>}
			{status === "error" && <p className="contact_status contact_status--err">{ui.error}</p>}
		</form>
	);
}
