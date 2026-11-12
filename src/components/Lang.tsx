import { useEffect, useState } from "react";
import type { Lang } from "./Glossary";

const SWITCH_LABEL: Record<Lang, string> = {
	en: "Switch to French",
	fr: "Passer en anglais",
};

// French by default; the choice is remembered for the next visit.
export function useLang(): [Lang, (lang: Lang) => void] {
	const [lang, setLang] = useState<Lang>(() => {
		try {
			const saved = localStorage.getItem("lang");
			if (saved === "en" || saved === "fr") return saved;
		} catch {}
		return "fr";
	});

	// Keep <html lang> in sync and remember the choice.
	useEffect(() => {
		document.documentElement.lang = lang;
		try { localStorage.setItem("lang", lang); } catch {}
	}, [lang]);

	return [lang, setLang];
}

export function LangToggle({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
	return (
		<button
			type="button"
			className="lang_toggle"
			onClick={() => onChange(lang === "en" ? "fr" : "en")}
			aria-label={SWITCH_LABEL[lang]}
		>
			<span className={lang === "en" ? "lang_on" : ""}>EN</span>
			<span aria-hidden="true">/</span>
			<span className={lang === "fr" ? "lang_on" : ""}>FR</span>
		</button>
	);
}
