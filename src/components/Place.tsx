import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";
import type { Lang } from "./Glossary";
import { PLACES, osmUrl } from "./Places";

// Same feel as the glossary cards (see Term.tsx), kept separate to avoid a circular import.
const HOVER_DELAY = 300; // how long the pointer must rest on the word before the map opens (ms)
const CLOSE_DELAY = 200; // how long the map stays after the pointer leaves, so you can move onto it (ms)
const CARD_ID = "place_card";
const GAP = 14; // px between the pointer and the card (keep in sync with .place_card in index.css)

const CLOSE_LABEL: Record<Lang, string> = { en: "Close", fr: "Fermer" };

type Tip = { place: string; x: number; y: number };

type PlaceApi = {
	current: string | null;
	open: (place: string, x: number, y: number) => void;
	close: (place?: string) => void; // immediately
	toggle: (place: string, x: number, y: number) => void;
	hold: () => void; // cancel a pending close
	leave: (place: string) => void; // close after CLOSE_DELAY
};

const PlaceContext = createContext<PlaceApi>({
	current: null,
	open() {},
	close() {},
	toggle() {},
	hold() {},
	leave() {},
});

/* ---------- the map itself (Leaflet is loaded the first time a map opens) ---------- */
function PlaceMap({ place }: { place: string }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const { lat, lon, zoom } = PLACES[place];
		let cancelled = false;
		let map: import("leaflet").Map | undefined;

		import("leaflet").then((mod) => {
			const L: typeof import("leaflet") = (mod as any).default ?? mod;
			if (cancelled || !ref.current) return;

			// Scroll wheel, pinch, double click, +/- buttons and keyboard zoom are all on by default.
			map = L.map(ref.current, { center: [lat, lon], zoom, minZoom: 3, maxZoom: 18 });

			L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
				maxZoom: 19,
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
			}).addTo(map);

			// The red dot with a ping around it (styled in index.css).
			L.marker([lat, lon], {
				icon: L.divIcon({
					className: "place_marker",
					html: '<span class="place_ping"></span><span class="place_dot"></span>',
					iconSize: [24, 24],
					iconAnchor: [12, 12],
				}),
				interactive: false,
				keyboard: false,
			}).addTo(map);
		});

		return () => {
			cancelled = true;
			map?.remove();
		};
	}, [place]);

	return <div ref={ref} className="place_map" />;
}

/* ---------- the floating map window ---------- */
function PlaceCard({ tip, lang }: { tip: Tip; lang: Lang }) {
	const api = useContext(PlaceContext);
	const ref = useRef<HTMLDivElement>(null);
	const [below, setBelow] = useState(false);
	const entry = PLACES[tip.place];

	// Not enough room above the pointer: show the window below it instead (if there is more room there).
	useLayoutEffect(() => {
		if (!ref.current) return;
		const h = ref.current.offsetHeight;
		const roomAbove = tip.y - h - GAP;
		const roomBelow = window.innerHeight - tip.y - h - 18;
		setBelow(roomAbove < 8 && roomBelow > roomAbove);
	}, [tip.place, tip.y]);

	return (
		<div
			ref={ref}
			id={CARD_ID}
			className={`place_card ${below ? "place_card--below" : ""}`}
			role="dialog"
			aria-label={entry.label[lang]}
			// --half is the half width of the window: keeps it inside the screen on narrow phones
			style={{ left: `clamp(var(--half), ${tip.x}px, calc(100vw - var(--half)))`, top: tip.y }}
			// clicking the window must not take the focus away from the word (that would close it)
			onMouseDown={(e) => e.preventDefault()}
			onPointerEnter={(e) => {
				if (e.pointerType !== "touch") api.hold();
			}}
			onPointerLeave={(e) => {
				if (e.pointerType === "touch") return;
				if (e.buttons === 0) {
					api.leave(tip.place);
				} else {
					// Dragging the map and the pointer left the window: close once the button is released.
					window.addEventListener("pointerup", () => api.leave(tip.place), { once: true });
				}
			}}
		>
			<div className="place_card_bar">
				<span className="place_card_title">{entry.label[lang]}</span>
				<button
					type="button"
					className="place_card_close"
					onClick={() => api.close()}
					aria-label={CLOSE_LABEL[lang]}
				>
					×
				</button>
			</div>
			<PlaceMap place={tip.place} />
		</div>
	);
}

/* ---------- provider: owns the one map window shown at a time ---------- */
export function PlaceProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
	const [tip, setTip] = useState<Tip | null>(null);
	const closeTimer = useRef(0);
	const current = tip?.place ?? null;

	useEffect(() => () => window.clearTimeout(closeTimer.current), []);

	const api = useMemo<PlaceApi>(() => ({
		current,
		open: (place, x, y) => {
			window.clearTimeout(closeTimer.current);
			setTip({ place, x, y });
		},
		close: (place) => setTip((c) => (place === undefined || c?.place === place ? null : c)),
		toggle: (place, x, y) => setTip((c) => (c?.place === place ? null : { place, x, y })),
		hold: () => window.clearTimeout(closeTimer.current),
		leave: (place) => {
			window.clearTimeout(closeTimer.current);
			closeTimer.current = window.setTimeout(
				() => setTip((c) => (c?.place === place ? null : c)),
				CLOSE_DELAY,
			);
		},
	}), [current]);

	// While a map is open: tap elsewhere, scroll the page, resize or press Escape to dismiss it.
	// (Zooming the map with the wheel does not scroll the page, so it does not close it.)
	useEffect(() => {
		if (!tip) return;
		const close = () => setTip(null);
		const onDown = (e: PointerEvent) => {
			if (!(e.target as Element).closest("[data-place], .place_card")) close();
		};
		// Capture phase: Escape closes only the map and leaves a project window behind it open.
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				close();
			}
		};
		document.addEventListener("pointerdown", onDown);
		window.addEventListener("keydown", onKey, true);
		window.addEventListener("scroll", close, { passive: true });
		window.addEventListener("resize", close);
		return () => {
			document.removeEventListener("pointerdown", onDown);
			window.removeEventListener("keydown", onKey, true);
			window.removeEventListener("scroll", close);
			window.removeEventListener("resize", close);
		};
	}, [tip]);

	return (
		<PlaceContext.Provider value={api}>
			{children}
			{tip && <PlaceCard tip={tip} lang={lang} />}
		</PlaceContext.Provider>
	);
}

/* ---------- a word that is a location ---------- */
// name: the entry in PLACES. children: the text as written on the page (it can be an alias).
export function Place({ name, children }: { name: string; children: ReactNode }) {
	const tip = useContext(PlaceContext);
	const timer = useRef(0);
	const pos = useRef({ x: 0, y: 0 });
	const touch = useRef(false);

	useEffect(() => () => window.clearTimeout(timer.current), []);

	// Unknown place: render it as plain text.
	if (!Object.prototype.hasOwnProperty.call(PLACES, name)) return <>{children}</>;

	return (
		<span
			className="place"
			data-place
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
				timer.current = window.setTimeout(() => tip.open(name, pos.current.x, pos.current.y), HOVER_DELAY);
			}}
			onPointerMove={(e) => {
				if (e.pointerType !== "touch") pos.current = { x: e.clientX, y: e.clientY };
			}}
			onPointerLeave={(e) => {
				if (e.pointerType === "touch") return;
				window.clearTimeout(timer.current);
				tip.leave(name);
			}}
			// touch: tap the word to show the map, tap it again (or anywhere else) to hide it
			onClick={(e) => {
				if (touch.current) tip.toggle(name, e.clientX, e.clientY);
			}}
			// keyboard: the map shows on focus (Tab), Enter opens openstreetmap.org, Escape hides the map
			onFocus={(e) => {
				if (!e.currentTarget.matches(":focus-visible")) return;
				const r = e.currentTarget.getBoundingClientRect();
				tip.open(name, r.left + r.width / 2, r.top);
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter") window.open(osmUrl(PLACES[name]), "_blank", "noopener,noreferrer");
			}}
			onBlur={() => tip.close(name)}
		>
			{children}
		</span>
	);
}
