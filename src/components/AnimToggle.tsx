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

const TEXT: Record<Lang, { label: string; on: string; off: string; aria: string }> = {
	en: { label: "animations:", on: "on", off: "off", aria: "Intro animations" },
	fr: { label: "animations :", on: "oui", off: "non", aria: "Animations d'introduction" },
};

// Small, grey and almost transparent until hovered (see .anim_toggle in index.css).
export function AnimToggle({ lang, on, onChange }: { lang: Lang; on: boolean; onChange: (on: boolean) => void }) {
	const t = TEXT[lang];
	return (
		<button
			type="button"
			role="switch"
			aria-checked={on}
			aria-label={t.aria}
			className="anim_toggle"
			onClick={() => onChange(!on)}
		>
			{t.label} {on ? t.on : t.off}
		</button>
	);
}
