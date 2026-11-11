import { useEffect, useRef, useState } from "react";
import type { Lang, Localized } from "./Glossary";
import { renderTerms } from "./Term";

export type ProjectWindowData = {
	label: string;
	state: "finished" | "wip";
	status: "open" | "closed";
	description: Localized;
	learned: Localized;
	logo: string; // path to the project's logo/image
	href: string; // repository link
};

type UIText = {
	learned: string;
	viewRepo: string;
	close: string;
	states: Record<"finished" | "wip", string>;
	statuses: Record<"open" | "closed", string>;
};

export function ProjectWindow({
	project,
	lang,
	ui,
	onClose,
}: {
	project: ProjectWindowData;
	lang: Lang;
	ui: UIText;
	onClose: () => void;
}) {
	const closeRef = useRef<HTMLButtonElement>(null);
	const [logoFailed, setLogoFailed] = useState(false);

	// Keyboard: focus the close button on open, Escape closes it.
	useEffect(() => {
		closeRef.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [onClose]);

	// Lock the page behind the window: nothing scrolls while it's open.
	useEffect(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, []);

	return (
		<div
			className="project_overlay"
			// clicking the backdrop (not the window itself) closes it
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="project_window" role="dialog" aria-modal="true" aria-label={project.label}>
				<div className="project_window_bar">
					<span className="project_window_title">{project.label}</span>
					<button
						ref={closeRef}
						type="button"
						className="project_window_close"
						onClick={onClose}
						aria-label={ui.close}
					>
						×
					</button>
				</div>

				<div className="project_window_body">
					{!logoFailed && (
						<div className="project_window_logo">
							<img src={project.logo} alt="" onError={() => setLogoFailed(true)} />
						</div>
					)}

					<div className={`project_window_info ${logoFailed ? "project_window_info--full" : ""}`}>
						<div className="project_window_meta">
							<span
								className={`project_state ${
									project.state === "finished" ? "project_state--done" : "project_state--wip"
								}`}
							>
								{ui.states[project.state]}
							</span>
							<span className="link_url">{ui.statuses[project.status]}</span>
						</div>

						<p className="project_window_desc">{renderTerms(project.description[lang])}</p>

						<h3 className="project_window_subtitle">{ui.learned}</h3>
						<p className="project_window_desc">{renderTerms(project.learned[lang])}</p>

						<a
							className="project_window_repo"
							href={project.href}
							target="_blank"
							rel="noopener noreferrer"
						>
							{ui.viewRepo}
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
