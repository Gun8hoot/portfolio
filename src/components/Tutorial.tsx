import { useEffect, useState } from "react";
import type { Lang } from "./Glossary";

// Shown once, on the very first visit: marked as seen as soon as it appears,
// so it never comes back, whether the visitor closes it, skips it or finishes it.
const STORAGE_KEY = "tutorial_seen";
// Lets the portfolio finish sliding in (600 ms) before the box shows up.
const SHOW_DELAY = 800;

const alreadySeen = () => {
	try {
		return localStorage.getItem(STORAGE_KEY) !== null;
	} catch {
		return false;
	}
};

type Step = {
	target: string; // CSS selector of the element that gets highlighted
	title: Record<Lang, string>;
	text: Record<Lang, string>;
};

const STEPS: Step[] = [
	{
		target: ".lang_toggle",
		title: { en: "Language", fr: "Langue" },
		text: {
			en: "Use the EN / FR button at the top right to switch between English and French. Your choice is remembered.",
			fr: "Le bouton EN / FR en haut à droite permet de passer du français à l'anglais. Votre choix est mémorisé.",
		},
	},
	{
		target: ".term",
		title: { en: "Technical words", fr: "Mots techniques" },
		text: {
			en: "Hover an underlined word (or tap it on a phone) to get a short definition and a link to learn more. Place names open a map.",
			fr: "Survolez un mot souligné (ou touchez-le sur téléphone) pour afficher une courte définition et un lien pour en savoir plus. Les noms de lieux ouvrent une carte.",
		},
	},
	{
		target: "ul.project > li",
		title: { en: "Projects", fr: "Projets" },
		text: {
			en: "Click a project to open a window with its description and what I learned. Click its image to enlarge it.",
			fr: "Cliquez sur un projet pour ouvrir une fenêtre avec sa description et ce que j'en ai appris. Cliquez sur son image pour l'agrandir.",
		},
	},
	{
		target: ".contact_form",
		title: { en: "Contact", fr: "Contact" },
		text: {
			en: "The contact form is at the bottom of the page: write to me directly from there.",
			fr: "Le formulaire de contact se trouve en bas de la page : écrivez-moi directement depuis là.",
		},
	},
];

const UI: Record<
	Lang,
	{
		region: string;
		askTitle: string;
		askText: string;
		start: string;
		decline: string;
		close: string;
		previous: string;
		next: string;
		done: string;
	}
> = {
	en: {
		region: "Website tutorial",
		askTitle: "Welcome!",
		askText: "First time here? Want a quick tour of the site?",
		start: "Start the tour",
		decline: "No thanks",
		close: "Close the tutorial",
		previous: "Previous",
		next: "Next",
		done: "Done",
	},
	fr: {
		region: "Tutoriel du site",
		askTitle: "Bienvenue !",
		askText: "Première visite ? Voulez-vous un petit tour du site ?",
		start: "Commencer",
		decline: "Non merci",
		close: "Fermer le tutoriel",
		previous: "Précédent",
		next: "Suivant",
		done: "Terminer",
	},
};

type Phase = "hidden" | "ask" | "tour";

export function Tutorial({ lang }: { lang: Lang }) {
	// Decided once, when the component first renders (it only mounts after the boot).
	const [eligible] = useState(() => !alreadySeen());
	const [phase, setPhase] = useState<Phase>("hidden");
	const [index, setIndex] = useState(0);
	const ui = UI[lang];

	// First visit: wait for the portfolio to appear, then show the question.
	useEffect(() => {
		if (!eligible) return;
		const timer = window.setTimeout(() => {
			try {
				localStorage.setItem(STORAGE_KEY, "1");
			} catch {}
			setPhase("ask");
		}, SHOW_DELAY);
		return () => window.clearTimeout(timer);
	}, [eligible]);

	// Highlight the element the current step talks about.
	// Also runs when the language changes, since the words on the page are re-rendered.
	useEffect(() => {
		if (phase !== "tour") return;
		const el = document.querySelector<HTMLElement>(STEPS[index].target);
		if (!el) return;
		el.classList.add("tutorial_target");
		return () => el.classList.remove("tutorial_target");
	}, [phase, index, lang]);

	// Bring that element into view, only when the step changes.
	useEffect(() => {
		if (phase !== "tour") return;
		const step = STEPS[index];
		const el = document.querySelector<HTMLElement>(step.target);
		if (!el) return;
		const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
		if (step.target === ".lang_toggle") window.scrollTo({ top: 0, behavior });
		else el.scrollIntoView({ block: "center", behavior });
	}, [phase, index]);

	if (phase === "hidden") return null;

	const close = () => setPhase("hidden");
	const step = STEPS[index];
	const last = index === STEPS.length - 1;

	return (
		<aside className="tutorial" role="region" aria-label={ui.region}>
			<div className="tutorial_bar">
				<span className="tutorial_title">{phase === "ask" ? ui.askTitle : step.title[lang]}</span>
				<button type="button" className="tutorial_close" onClick={close} aria-label={ui.close}>
					×
				</button>
			</div>

			<div className="tutorial_body" aria-live="polite">
				{phase === "ask" ? (
					<>
						<p className="tutorial_text">{ui.askText}</p>
						<div className="tutorial_actions">
							<button
								type="button"
								className="tutorial_btn tutorial_btn--main"
								onClick={() => {
									setIndex(0);
									setPhase("tour");
								}}
							>
								{ui.start}
							</button>
							<button type="button" className="tutorial_btn" onClick={close}>
								{ui.decline}
							</button>
						</div>
					</>
				) : (
					<>
						<p className="tutorial_text">{step.text[lang]}</p>
						<div className="tutorial_actions">
							<span className="tutorial_count">
								{index + 1}/{STEPS.length}
							</span>
							<button
								type="button"
								className="tutorial_btn"
								disabled={index === 0}
								onClick={() => setIndex((i) => i - 1)}
							>
								{ui.previous}
							</button>
							<button
								type="button"
								className="tutorial_btn tutorial_btn--main"
								onClick={() => (last ? close() : setIndex((i) => i + 1))}
							>
								{last ? ui.done : ui.next}
							</button>
						</div>
					</>
				)}
			</div>
		</aside>
	);
}
