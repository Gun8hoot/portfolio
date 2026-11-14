import { useEffect, useRef } from "react";

// A bigger view of a project's picture, opened from the ProjectWindow.
// It sits on top of the ProjectWindow, so closing it must leave that one open.
export function PictureWindow({
	src,
	title,
	closeLabel,
	onClose,
}: {
	src: string;
	title: string;
	closeLabel: string;
	onClose: () => void;
}) {
	const closeRef = useRef<HTMLButtonElement>(null);
	// Latest onClose, so the effect below runs only once (see ProjectWindow.tsx).
	const onCloseRef = useRef(onClose);
	useEffect(() => {
		onCloseRef.current = onClose;
	});

	useEffect(() => {
		closeRef.current?.focus();
		// Capture phase on window: runs before the ProjectWindow's own Escape handler
		// (on document), and stopping it there means Escape closes only this window.
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				onCloseRef.current();
			}
		};
		window.addEventListener("keydown", onKey, true);
		return () => window.removeEventListener("keydown", onKey, true);
	}, []);

	return (
		<div
			className="picture_overlay"
			// clicking the backdrop (not the window itself) closes it
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="picture_window" role="dialog" aria-modal="true" aria-label={title}>
				<div className="picture_window_bar">
					<span className="project_window_title">{title}</span>
					<button
						ref={closeRef}
						type="button"
						className="picture_window_close"
						onClick={onClose}
						aria-label={closeLabel}
					>
						×
					</button>
				</div>
				<div className="picture_window_body">
					<img src={src} alt="" />
				</div>
			</div>
		</div>
	);
}
