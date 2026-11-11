import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { GLOSSARY } from "./Glossary";
import type { Lang } from "./Glossary";

// How long the pointer must rest on a word before its card appears (ms).
export const HOVER_DELAY = 300;
// How long the card stays after the pointer leaves, so you can move onto it and click (ms).
const CLOSE_DELAY = 200;

const CARD_ID = "term_card";
const GAP = 14; // px between the pointer and the card (keep in sync with .term_card in index.css)

type Tip = { term: string; label: string; x: number; y: number }; // label: the text as written on the page

type TipApi = {
	current: string | null;
	open: (term: string, label: string, x: number, y: number) => void;
	close: (term?: string) => void; // immediately
	toggle: (term: string, label: string, x: number, y: number) => void;
	hold: () => void; // cancel a pending close
	leave: (term: string) => void; // close after CLOSE_DELAY
};

const TipContext = createContext<TipApi>({
	current: null,
	open() {},
	close() {},
	toggle() {},
	hold() {},
	leave() {},
});

const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, "");

/* ---------- the floating card (a link to the project page) ---------- */
function TermCard({ tip, lang }: { tip: Tip; lang: Lang }) {
	const api = useContext(TipContext);
	const ref = useRef<HTMLAnchorElement>(null);
	const [below, setBelow] = useState(false);
	const entry = GLOSSARY[tip.term];

	// Not enough room above the pointer: show the card below it instead.
	useLayoutEffect(() => {
		if (ref.current) setBelow(tip.y - ref.current.offsetHeight - GAP < 8);
	}, [tip.term, tip.y, lang]);

	return (
		<a
			ref={ref}
			id={CARD_ID}
			className={`term_card ${below ? "term_card--below" : ""}`}
			href={entry.url}
			target="_blank"
			rel="noopener noreferrer"
			tabIndex={-1} // keyboard users press Enter on the word instead
			// --half is the half width of the card: keeps it inside the screen on narrow phones
			style={{ left: `clamp(var(--half), ${tip.x}px, calc(100vw - var(--half)))`, top: tip.y }}
			// clicking the card must not take the focus away from the word (that would close the card)
			onMouseDown={(e) => e.preventDefault()}
			onPointerEnter={(e) => {
				if (e.pointerType !== "touch") api.hold();
			}}
			onPointerLeave={(e) => {
				if (e.pointerType !== "touch") api.leave(tip.term);
			}}
		>
			<div className="term_card_name">{tip.label}</div>
			<div>{entry[lang]}</div>
			<div className="term_card_link">{hostOf(entry.url)}</div>
		</a>
	);
}

/* ---------- provider: owns the one card shown at a time ---------- */
export function TermProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
	const [tip, setTip] = useState<Tip | null>(null);
	const closeTimer = useRef(0);
	const current = tip?.term ?? null;

	useEffect(() => () => window.clearTimeout(closeTimer.current), []);

	const api = useMemo<TipApi>(() => ({
		current,
		open: (term, label, x, y) => {
			window.clearTimeout(closeTimer.current);
			setTip({ term, label, x, y });
		},
		close: (term) => setTip((c) => (term === undefined || c?.term === term ? null : c)),
		toggle: (term, label, x, y) => setTip((c) => (c?.term === term ? null : { term, label, x, y })),
		hold: () => window.clearTimeout(closeTimer.current),
		leave: (term) => {
			window.clearTimeout(closeTimer.current);
			closeTimer.current = window.setTimeout(
				() => setTip((c) => (c?.term === term ? null : c)),
				CLOSE_DELAY,
			);
		},
	}), [current]);

	// While a card is open: tap elsewhere, scroll, resize or press Escape to dismiss it.
	useEffect(() => {
		if (!tip) return;
		const close = () => setTip(null);
		const onDown = (e: PointerEvent) => {
			if (!(e.target as Element).closest("[data-term], .term_card")) close();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") close();
		};
		document.addEventListener("pointerdown", onDown);
		document.addEventListener("keydown", onKey);
		window.addEventListener("scroll", close, { passive: true });
		window.addEventListener("resize", close);
		return () => {
			document.removeEventListener("pointerdown", onDown);
			document.removeEventListener("keydown", onKey);
			window.removeEventListener("scroll", close);
			window.removeEventListener("resize", close);
		};
	}, [tip]);

	return (
		<TipContext.Provider value={api}>
			{children}
			{tip && <TermCard tip={tip} lang={lang} />}
		</TipContext.Provider>
	);
}

/* ---------- a word that has an explanation ---------- */
// name: the glossary entry. label: the text as written on the page (it can be an alias).
export function Term({ name, label, children }: { name: string; label?: string; children: ReactNode }) {
	const tip = useContext(TipContext);
	const timer = useRef(0);
	const pos = useRef({ x: 0, y: 0 });
	const touch = useRef(false);

	useEffect(() => () => window.clearTimeout(timer.current), []);

	// Unknown word: render it as plain text.
	if (!Object.prototype.hasOwnProperty.call(GLOSSARY, name)) return <>{children}</>;

	const shown = label ?? name;

	return (
		<span
			className="term"
			data-term
			tabIndex={0}
			aria-describedby={tip.current === name ? CARD_ID : undefined}
			onPointerDown={(e) => {
				touch.current = e.pointerType === "touch";
			}}
			// mouse / pen: the pointer must rest on the word for HOVER_DELAY
			onPointerEnter={(e) => {
				if (e.pointerType === "touch") return;
				tip.hold();
				pos.current = { x: e.clientX, y: e.clientY };
				window.clearTimeout(timer.current);
				timer.current = window.setTimeout(() => tip.open(name, shown, pos.current.x, pos.current.y), HOVER_DELAY);
			}}
			onPointerMove={(e) => {
				if (e.pointerType !== "touch") pos.current = { x: e.clientX, y: e.clientY };
			}}
			onPointerLeave={(e) => {
				if (e.pointerType === "touch") return;
				window.clearTimeout(timer.current);
				tip.leave(name);
			}}
			// touch: tap the word to show the card, then tap the card to open the page
			onClick={(e) => {
				if (touch.current) tip.toggle(name, shown, e.clientX, e.clientY);
			}}
			// keyboard: the card shows on focus (Tab), Enter opens the page, Escape hides the card
			onFocus={(e) => {
				if (!e.currentTarget.matches(":focus-visible")) return;
				const r = e.currentTarget.getBoundingClientRect();
				tip.open(name, shown, r.left + r.width / 2, r.top);
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter") window.open(GLOSSARY[name].url, "_blank", "noopener,noreferrer");
			}}
			onBlur={() => tip.close(name)}
		>
			{children}
		</span>
	);
}

// Every spelling that gets a card (entry key or alias) -> the entry it belongs to.
const LOOKUP = new Map<string, string>();
for (const [key, entry] of Object.entries(GLOSSARY)) {
	LOOKUP.set(key, key);
	for (const alias of entry.aliases ?? []) LOOKUP.set(alias, key);
}

// Longest first, so that "C++" wins over "C".
const NAMES = [...LOOKUP.keys()].sort((a, b) => b.length - a.length);
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A word counts when it is not glued to other letters, digits, "_", "+" or "-"
// (so "Git" is not found in "GitHub", nor "TUI" in "CTRL-TUI"). The character before
// the word is captured instead of using a lookbehind, which older Safari doesn't support.
const FINDER = new RegExp(`(^|[^\\w+-])(${NAMES.map(escapeRegExp).join("|")})(?![\\w+-])`, "g");

// Finds every glossary word in a text and wraps it in a <Term>.
export function renderTerms(text: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	let last = 0;
	for (const m of text.matchAll(FINDER)) {
		const start = m.index! + m[1].length;
		nodes.push(text.slice(last, start));
		nodes.push(<Term key={start} name={LOOKUP.get(m[2])!} label={m[2]}>{m[2]}</Term>);
		last = start + m[2].length;
	}
	nodes.push(text.slice(last));
	return nodes;
}
