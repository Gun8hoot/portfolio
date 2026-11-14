import { useEffect, useRef, useState } from "react";
import type { Lang } from "./Glossary";

// Shown once, on the very first visit: marked as seen as soon as it appears,
// so it never comes back, whether the visitor closes it, skips it or finishes it.
const STORAGE_KEY = "tutorial_seen";
// Lets the portfolio finish sliding in (600 ms) before the box shows up.
const SHOW_DELAY = 800;
// Space kept between the bottom of the box and the highlighted element (px).
const MARGIN = 24;
// Distance of the box from the top of the screen, in rem (see .tutorial in index.css).
const BOX_TOP_REM = 4;

const alreadySeen = () => {
	try {
		return localStorage.getItem(STORAGE_KEY) !== null;
	} catch {
		return false;
	}
};

type Step = {
	target: string; // CSS selector of the element that gets highlighted
	// Several elements match (e.g. every glossary word): take the first one that is low
	// enough on the page to end up fully visible under the box once scrolled to.
	lowEnough?: boolean;
	title: Record<Lang, string>;
	text: Record<Lang, string>;
};

const STEPS: Step[] = [
	{
		target: ".lang_toggle",
		title: { en: "Language", fr: "Langue" },
		text: {
			en: "Use the EN / FR button at the top right to switch between English and French. Your choice is remembered.",
			fr: "Le bouton EN / FR en haut à droite permet de passer du français à l'anglais, et inversement. Votre choix est mémorisé.",
		},
	},
	{
		target: ".anim_toggle",
		title: { en: "Animations", fr: "Animations" },
		text: {
			en: "Not a fan of the intro animations? Click the animations button at the top left to turn them off, or back on. Your choice is remembered.",
			fr: "Les animations d'introduction ne vous plaisent pas ? Cliquez sur le bouton « animations » en haut à gauche pour les désactiver, ou les réactiver. Votre choix est mémorisé.",
		},
	},
	{
		target: ".term",
		lowEnough: true,
		title: { en: "Technical words", fr: "Mots techniques" },
		text: {
			en: "Hover an underlined word (or tap it on a phone) to get a short definition and a link to learn more. Place names open a map.",
			fr: "Survolez un mot souligné (ou touchez-le sur mobile) pour afficher une courte définition et un lien pour en savoir plus. Les noms de lieux ouvrent une carte.",
		},
	},
	{
		target: "ul.project > li",
		title: { en: "Projects", fr: "Projets" },
		text: {
			en: "Click a project to open a window with a more detailed description and what I learned by doing it. Click its image to enlarge it.",
			fr: "Cliquez sur un projet pour ouvrir une fenêtre avec une description plus détaillée et ce que j'ai appris en le réalisant. Cliquez sur son image pour l'agrandir.",
		},
	},
	{
		target: ".contact_form",
		title: { en: "Contact", fr: "Contact" },
		text: {
			en: "Want to get in touch? Just fill in the contact form at the bottom of the page: it is the easiest way to reach me.",
			fr: "Envie de me contacter ? Remplissez simplement le formulaire en bas de la page : c'est le moyen le plus simple de me joindre.",
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
		askText: "Première visite ? Voulez-vous une petite visite guidée du site ?",
		start: "Commencer",
		decline: "Non merci",
		close: "Fermer le tutoriel",
		previous: "Précédent",
		next: "Suivant",
		done: "Terminer",
	},
};

type Phase = "hidden" | "ask" | "tour";

export function Tutorial({ lang, delay = SHOW_DELAY }: { lang: Lang; delay?: number }) {
	// Decided once, when the component first renders (it only mounts after the boot).
	const [eligible] = useState(() => !alreadySeen());
	const [showAfter] = useState(delay); // read once: the delay depends on how the page appeared
	const [phase, setPhase] = useState<Phase>("hidden");
	const [index, setIndex] = useState(0);
	const boxRef = useRef<HTMLElement>(null);
	const scrolledFor = useRef(-1); // the step the page was last scrolled for
	const targetRef = useRef<HTMLElement | null>(null); // the element highlighted by the current step
	const [placement, setPlacement] = useState<"top" | "bottom">("top");
	const ui = UI[lang];

	// First visit: wait for the portfolio to appear, then show the question.
	useEffect(() => {
		if (!eligible) return;
		const timer = window.setTimeout(() => {
			try {
				localStorage.setItem(STORAGE_KEY, "1");
			} catch {}
			setPhase("ask");
		}, showAfter);
		return () => window.clearTimeout(timer);
	}, [eligible, showAfter]);

	// Highlight the element the current step talks about, and (only when the step changes)
	// scroll the page so that this element sits just under the box, never hidden behind it.
	// Also runs when the language changes, since the words on the page are re-rendered.
	useEffect(() => {
		if (phase !== "tour") return;
		const step = STEPS[index];
		const boxBottom = boxRef.current?.getBoundingClientRect().bottom ?? 0;
		const found = [...document.querySelectorAll<HTMLElement>(step.target)];
		const el = step.lowEnough
			? (found.find((e) => e.getBoundingClientRect().top + window.scrollY >= boxBottom + MARGIN) ??
				found[found.length - 1])
			: found[0];
		if (!el) return;

		el.classList.add("tutorial_target");
		targetRef.current = el;

		if (scrolledFor.current !== index) {
			scrolledFor.current = index;
			const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
			if (step.target === ".lang_toggle" || step.target === ".anim_toggle") {
				window.scrollTo({ top: 0, behavior });
			} else {
				const top = el.getBoundingClientRect().top + window.scrollY - (boxBottom + MARGIN);
				window.scrollTo({ top: Math.max(0, top), behavior });
			}
		}

		return () => {
			el.classList.remove("tutorial_target");
			if (targetRef.current === el) targetRef.current = null;
		};
	}, [phase, index, lang]);

	// Safety net, whatever the screen or browser does with the scroll: once the page has settled,
	// if the highlighted element is hidden behind the box, the box moves to the bottom of the screen
	// (and comes back to the top as soon as the element is clear of it).
	useEffect(() => {
		if (phase !== "tour") return;
		let timer = 0;
		const evaluate = () => {
			const box = boxRef.current;
			const el = targetRef.current;
			if (!box || !el) return;
			const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
			const pad = MARGIN / 2;
			const t = el.getBoundingClientRect();
			const w = box.offsetWidth;
			const h = box.offsetHeight;
			const hits = (top: number) =>
				t.right > rem - pad && t.left < rem + w + pad && t.bottom > top - pad && t.top < top + h + pad;
			if (!hits(BOX_TOP_REM * rem)) setPlacement("top");
			else if (!hits(window.innerHeight - rem - h)) setPlacement("bottom");
		};
		const schedule = () => {
			window.clearTimeout(timer);
			timer = window.setTimeout(evaluate, 150); // after the (smooth) scrolling has stopped
		};
		schedule();
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);
		return () => {
			window.clearTimeout(timer);
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
		};
	}, [phase, index, lang]);

	if (phase === "hidden") return null;

	const close = () => setPhase("hidden");
	const step = STEPS[index];
	const last = index === STEPS.length - 1;

	return (
		<aside
			ref={boxRef}
			className={`tutorial ${placement === "bottom" ? "tutorial--bottom" : ""}`}
			role="region"
			aria-label={ui.region}
		>
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
