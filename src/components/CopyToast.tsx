import { useEffect, useRef, useState } from "react";
import type { Lang } from "./Glossary";

// How long the toast stays before it closes itself (ms). The progress bar drains over
// the same duration, so it always finishes exactly when the toast disappears.
export const COPY_TOAST_DURATION = 5000;

const TEXT: Record<Lang, { copied: string; close: string }> = {
	en: { copied: "Email copied to clipboard", close: "Dismiss" },
	fr: { copied: "E-mail copié dans le presse-papiers", close: "Fermer" },
};

export type CopyToastHandle = {
	// Shows the toast (or restarts its countdown if it's already shown).
	show: () => void;
};

export function useCopyToast() {
	// A growing key remounts the toast's progress bar, so clicking again while it's still
	// open restarts the countdown from the top instead of letting the old timer close it early.
	const [toast, setToast] = useState<number | null>(null);
	const show = () => setToast((k) => (k ?? 0) + 1);
	const hide = () => setToast(null);
	return { toast, show, hide };
}

export function CopyToast({ lang, toastKey, onClose }: { lang: Lang; toastKey: number; onClose: () => void }) {
	const t = TEXT[lang];
	const closeRef = useRef(onClose);
	useEffect(() => {
		closeRef.current = onClose;
	});

	useEffect(() => {
		const timer = window.setTimeout(() => closeRef.current(), COPY_TOAST_DURATION);
		return () => window.clearTimeout(timer);
	}, [toastKey]);

	return (
		<div className="copy_toast" role="status" aria-live="polite">
			<div className="copy_toast_row">
				<span className="copy_toast_text">{t.copied}</span>
				<button type="button" className="copy_toast_close" onClick={onClose} aria-label={t.close}>
					×
				</button>
			</div>
			{/* key remounts the bar so the shrink animation restarts from full width every time */}
			<div className="copy_toast_bar" key={toastKey}>
				<div className="copy_toast_bar_fill" style={{ animationDuration: `${COPY_TOAST_DURATION}ms` }} />
			</div>
		</div>
	);
}
