import type { Lang } from "./Glossary";

const TEXT: Record<Lang, string> = {
	en: "Power on",
	fr: "Allumer",
};

export function PreBoot({ lang, onPowerOn }: { lang: Lang; onPowerOn: () => void }) {
	return (
		<div className="preboot">
			<button type="button" className="power_button" onClick={onPowerOn}>
				{TEXT[lang]}
			</button>
		</div>
	);
}
