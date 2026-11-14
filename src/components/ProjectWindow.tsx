import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Lang, Localized } from "./Glossary";
import { renderTerms } from "./Term";
import { PictureWindow } from "./PictureWindow";

export type ProjectWindowData = {
	label: string;
	state: "finished" | "wip";
	status: "open" | "closed";
	stack: string[]; // languages/tools used, shown as a grey field next to state/status
	description: Localized;
	learned?: Localized; // optional: without it, the window has no "what I learned" part
	picture: string; // path to the project's picture/image
	href: string; // repository link
};

type UIText = {
	description: string;
	learned: string;
	viewRepo: string;
	close: string;
	enlarge: string;
	states: Record<"finished" | "wip", string>;
	statuses: Record<"open" | "closed", string>;
};

export function ProjectWindow({
	project,
	lang,
	ui,
	pictureBroken,
	onClose,
}: {
	project: ProjectWindowData;
	lang: Lang;
	ui: UIText;
	// Known from a preload done earlier (see Portfolio.tsx), so the full-width
	// layout can render on the very first paint instead of being discovered
	// after the fact by the <img>'s onError below — which would mean an
	// already-painted window visibly re-laying itself out a frame later.
	pictureBroken?: boolean;
	onClose: () => void;
}) {
	const closeRef = useRef<HTMLButtonElement>(null);
	const [pictureFailed, setPictureFailed] = useState(() => pictureBroken ?? false);
	const [pictureOpen, setPictureOpen] = useState(false);
	const pictureBtnRef = useRef<HTMLButtonElement>(null);

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
	// Hiding the scrollbar changes the viewport's width, and the window is
	// sized with `min(78rem, 96vw)` — so without compensation, the instant
	// the scrollbar disappears, 96vw recalculates against a wider viewport
	// and the window visibly resizes. Adding back the scrollbar's own width
	// as padding keeps the viewport width identical before and after the
	// lock, so there is nothing left to recalculate (useLayoutEffect still
	// applies this before the first paint, as a second line of defense).
	useLayoutEffect(() => {
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
		const prevOverflow = document.body.style.overflow;
		const prevPaddingRight = document.body.style.paddingRight;
		document.body.style.overflow = "hidden";
		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `${scrollbarWidth}px`;
		}
		return () => {
			document.body.style.overflow = prevOverflow;
			document.body.style.paddingRight = prevPaddingRight;
		};
	}, []);

	return (
		<>
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
					{!pictureFailed && (
						<div className="project_window_picture">
							{/* clicking the picture opens it bigger in a PictureWindow */}
							<button
								ref={pictureBtnRef}
								type="button"
								className="project_window_picture_btn"
								onClick={() => setPictureOpen(true)}
								aria-label={ui.enlarge}
								title={ui.enlarge}
							>
								<img src={project.picture} alt="" onError={() => setPictureFailed(true)} />
							</button>
						</div>
					)}

					<div className={`project_window_info ${pictureFailed ? "project_window_info--full" : ""}`}>
						<div className="project_window_meta">
							<span
								className={`project_state ${
									project.state === "finished" ? "project_state--done" : "project_state--wip"
								}`}
							>
								{ui.states[project.state]}
							</span>
							<span className="link_url project_stack">{project.stack.join(", ")}</span>
							<span className="link_url project_window_status">{ui.statuses[project.status]}</span>
						</div>

						<h3 className="project_window_subtitle">{ui.description}</h3>
						<p className="project_window_desc">{renderTerms(project.description[lang])}</p>

						{project.learned && (
							<>
								<h3 className="project_window_subtitle">{ui.learned}</h3>
								<p className="project_window_desc">{renderTerms(project.learned[lang])}</p>
							</>
						)}

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

		{pictureOpen && !pictureFailed && (
			<PictureWindow
				src={project.picture}
				title={project.label}
				closeLabel={ui.close}
				onClose={() => {
					setPictureOpen(false);
					pictureBtnRef.current?.focus(); // give the focus back to the picture that opened it
				}}
			/>
		)}
		</>
	);
}
