import { useState } from "react";
import type { Lang } from "./Glossary";

const STORAGE_KEY = "animations"; // "on" | "off"

// The intro animations (boot, screen tear, falling lines): on by default, unless the system asks
// for reduced motion. The visitor's own choice is remembered for the next visit.
export function useAnimations(): [boolean, (on: boolean) => void] {
	const [on, setOn] = useState<boolean>(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved === "on") return true;
			if (saved === "off") return false;
		} catch {}
		return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	});

	// Only a real choice is stored, so the system setting keeps applying until the visitor decides.
	const set = (value: boolean) => {
		setOn(value);
		try {
			localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
		} catch {}
	};

	return [on, set];
}

// "intro" says what it is about: the power-on screen, the boot and the page entrance, not the
// blinking cursor. The full explanation is in the tooltip and the accessible name.
const TEXT: Record<Lang, { label: string; aria: string }> = {
	en: { label: "intro", aria: "Intro animations: power-on screen, boot and page entrance" },
	fr: { label: "intro", aria: "Animations d'intro : écran d'allumage, démarrage et entrée de la page" },
};

// Small, grey and almost transparent until hovered (see .anim_toggle in index.css).
// Both states are shown, like the EN / FR button, and the current one is highlighted.
export function AnimToggle({ lang, on, onChange }: { lang: Lang; on: boolean; onChange: (on: boolean) => void }) {
	const t = TEXT[lang];
	return (
		<button
			type="button"
			role="switch"
			aria-checked={on}
			aria-label={t.aria}
			title={t.aria}
			className="anim_toggle"
			onClick={() => onChange(!on)}
		>
			<span>{t.label}</span>
			<span className={on ? "anim_on" : ""}>ON</span>
			<span aria-hidden="true">/</span>
			<span className={on ? "" : "anim_on"}>OFF</span>
		</button>
	);
}
