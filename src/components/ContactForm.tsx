import { useState } from "react";
import type { FormEvent } from "react";

type UIText = {
	emailLabel: string;
	subjectLabel: string;
	messageLabel: string;
	captchaLabel: (a: number, b: number) => string;
	send: string;
	sending: string;
	success: string;
	error: string;
	captchaWrong: string;
};

type Status = "idle" | "sending" | "success" | "error" | "captcha";

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const newChallenge = () => ({ a: randomInt(1, 9), b: randomInt(1, 9) });

export function ContactForm({ ui }: { ui: UIText }) {
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [honeypot, setHoneypot] = useState(""); // must stay empty; real visitors never see this field
	const [captchaAnswer, setCaptchaAnswer] = useState("");
	const [challenge, setChallenge] = useState(newChallenge);
	const [status, setStatus] = useState<Status>("idle");

	const resetForm = () => {
		setEmail("");
		setSubject("");
		setMessage("");
		setCaptchaAnswer("");
		setChallenge(newChallenge());
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

		if (Number(captchaAnswer) !== challenge.a + challenge.b) {
			setStatus("captcha");
			setCaptchaAnswer("");
			setChallenge(newChallenge());
			return;
		}

		setStatus("sending");
		try {
			const res = await fetch("/api/message", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, subject, message }),
			});
			if (!res.ok) throw new Error(String(res.status));
			setStatus("success");
			resetForm();
		} catch {
			setStatus("error");
			setChallenge(newChallenge());
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
				<textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
			</label>

			<label className="contact_field contact_field--captcha">
				<span>{ui.captchaLabel(challenge.a, challenge.b)}</span>
				<input
					type="number"
					required
					value={captchaAnswer}
					onChange={(e) => setCaptchaAnswer(e.target.value)}
				/>
			</label>

			<button type="submit" className="contact_submit" disabled={status === "sending"}>
				{status === "sending" ? ui.sending : ui.send}
			</button>

			{status === "success" && <p className="contact_status contact_status--ok">{ui.success}</p>}
			{status === "captcha" && <p className="contact_status contact_status--err">{ui.captchaWrong}</p>}
			{status === "error" && <p className="contact_status contact_status--err">{ui.error}</p>}
		</form>
	);
}
