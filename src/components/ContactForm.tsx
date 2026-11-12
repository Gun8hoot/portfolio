import { useState } from "react";
import type { FormEvent } from "react";

type UIText = {
	emailLabel: string;
	subjectLabel: string;
	messageLabel: string;
	captchaLabel: (a: number, b: number, op: string) => string;
	captchaLabelTech: (service: string) => string;
	switchToTechnical: string;
	switchToMath: string;
	send: string;
	sending: string;
	success: string;
	error: string;
	invalid: string;
	captchaWrong: string;
};

type Status = "idle" | "sending" | "success" | "error" | "invalid" | "captcha";
type CaptchaMode = "math" | "technical";

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

type MathChallenge = { a: number; b: number; op: "+" | "−" | "×" };

// Random operation and wider, operation-appropriate ranges — plain single-digit
// addition is too easy to brute-force or guess.
const newMathChallenge = (): MathChallenge => {
	const op = (["+", "−", "×"] as const)[randomInt(0, 2)];
	if (op === "+") return { a: randomInt(1, 25), b: randomInt(1, 25), op };
	if (op === "−") {
		const a = randomInt(5, 30);
		return { a, b: randomInt(1, a), op }; // keep the result non-negative
	}
	return { a: randomInt(2, 9), b: randomInt(2, 9), op }; // × kept small for easy mental math
};

const mathAnswer = ({ a, b, op }: MathChallenge) => (op === "+" ? a + b : op === "−" ? a - b : a * b);

type TechChallenge = { service: string; port: number };

// A handful of ports a cybersecurity-focused visitor (or you) would just know —
// doubles as a second line of bot defense that's harder to script around.
const TECH_QUESTIONS: TechChallenge[] = [
	{ service: "SSH", port: 22 },
	{ service: "DNS", port: 53 },
	{ service: "HTTP", port: 80 },
	{ service: "HTTPS", port: 443 },
	{ service: "FTP", port: 21 },
	{ service: "Telnet", port: 23 },
	{ service: "SMTP", port: 25 },
	{ service: "Nessus", port: 8834 },
	{ service: "RDP", port: 3389 },
	{ service: "SMB", port: 445 },
];

const newTechChallenge = (): TechChallenge => TECH_QUESTIONS[randomInt(0, TECH_QUESTIONS.length - 1)];

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

export function ContactForm({ ui }: { ui: UIText }) {
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [honeypot, setHoneypot] = useState(""); // must stay empty; real visitors never see this field
	const [captchaAnswer, setCaptchaAnswer] = useState("");
	const [captchaMode, setCaptchaMode] = useState<CaptchaMode>("math");
	// Separate state per mode: switching modes and switching back must show the
	// same math challenge as before, not a freshly rolled one.
	const [mathChallenge, setMathChallenge] = useState(newMathChallenge);
	const [techChallenge, setTechChallenge] = useState(newTechChallenge);
	const [status, setStatus] = useState<Status>("idle");

	const toggleCaptchaMode = () => {
		setCaptchaMode((m) => (m === "math" ? "technical" : "math"));
		setCaptchaAnswer(""); // the old answer no longer matches the other mode's question
	};

	const resetForm = () => {
		setEmail("");
		setSubject("");
		setMessage("");
		setCaptchaAnswer("");
		setCaptchaMode("math");
		setMathChallenge(newMathChallenge());
		setTechChallenge(newTechChallenge());
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

		const expected = captchaMode === "math" ? mathAnswer(mathChallenge) : techChallenge.port;
		if (Number(captchaAnswer) !== expected) {
			setStatus("captcha");
			setCaptchaAnswer("");
			// Only the mode actually in use gets a fresh challenge; the other mode's
			// stored one is untouched, since it was never shown or answered.
			if (captchaMode === "math") setMathChallenge(newMathChallenge());
			else setTechChallenge(newTechChallenge());
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
				}),
			});

			if (res.status === 200) {
				setStatus("success");
				resetForm();
			} else if (res.status === 400) {
				// Invalid body — don't drop the typed message, just the captcha challenge.
				setStatus("invalid");
				setCaptchaAnswer("");
				if (captchaMode === "math") setMathChallenge(newMathChallenge());
				else setTechChallenge(newTechChallenge());
			} else {
				// 500 or anything else unexpected: a generic failure, no details on why.
				setStatus("error");
				setCaptchaAnswer("");
				if (captchaMode === "math") setMathChallenge(newMathChallenge());
				else setTechChallenge(newTechChallenge());
			}
		} catch {
			// Network/CORS failure before even reaching the API.
			setStatus("error");
			setCaptchaAnswer("");
			if (captchaMode === "math") setMathChallenge(newMathChallenge());
			else setTechChallenge(newTechChallenge());
		}
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

			<label className="contact_field contact_field--captcha">
				<span>
					{captchaMode === "math"
						? ui.captchaLabel(mathChallenge.a, mathChallenge.b, mathChallenge.op)
						: ui.captchaLabelTech(techChallenge.service)}
				</span>
				<input
					type="number"
					required
					value={captchaAnswer}
					onChange={(e) => setCaptchaAnswer(e.target.value)}
				/>
			</label>
			<button type="button" className="contact_captcha_switch" onClick={toggleCaptchaMode}>
				{captchaMode === "math" ? ui.switchToTechnical : ui.switchToMath}
			</button>

			<button type="submit" className="contact_submit" disabled={status === "sending"}>
				{status === "sending" ? ui.sending : ui.send}
			</button>

			{status === "success" && <p className="contact_status contact_status--ok">{ui.success}</p>}
			{status === "captcha" && <p className="contact_status contact_status--err">{ui.captchaWrong}</p>}
			{status === "invalid" && <p className="contact_status contact_status--err">{ui.invalid}</p>}
			{status === "error" && <p className="contact_status contact_status--err">{ui.error}</p>}
		</form>
	);
}
