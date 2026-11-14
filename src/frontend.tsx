/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Boot } from "./components/Boot";
import { PreBoot } from "./components/PreBoot";
import { Portfolio } from "./components/Portfolio";
import { LangToggle, useLang } from "./components/Lang";
import { AnimToggle, useAnimations } from "./components/AnimToggle";
import { Tutorial } from "./components/Tutorial";
import "./index.css";

const elem = document.getElementById("root")!;

// The Monaspace fonts are only used by the portfolio itself, so without this the browser would
// start downloading them when the page appears: the lines would fall in with a fallback font,
// then re-wrap and jump once the real font arrives. Loading them now (during the power-on
// screen and the boot) means the page is shown with its final fonts. Capped at 2 s so a slow
// network never blocks the page.
const FONTS = [
	"monaspaceArgon-Light",
	"monaspaceArgon-Medium",
	"monaspaceArgon-SemiBold",
	"monaspaceArgon-SemiWideBold",
	"monaspaceArgon-Bold",
];
const fontsReady: Promise<unknown> = Promise.race([
	Promise.all(FONTS.map((f) => document.fonts.load(`1em ${f}`))).catch(() => {}),
	new Promise((resolve) => setTimeout(resolve, 2000)),
]);

type Stage = "off" | "booting" | "on";

function App() {
	const [anim, setAnim] = useAnimations();
	// Animations off: no power-on screen, no boot, straight to the page.
	const [stage, setStage] = useState<Stage>(() => (anim ? "off" : "on"));
	const [lang, setLang] = useLang();

	// The page only appears once its fonts are loaded (see fontsReady above).
	const showPage = () => void fontsReady.then(() => setStage("on"));

	// Turning them off on the power-on screen goes straight to the page too.
	const changeAnim = (on: boolean) => {
		setAnim(on);
		if (!on && stage === "off") showPage();
	};

	return (
		<>
			{stage === "off" && <PreBoot lang={lang} onPowerOn={() => setStage("booting")} />}
			{stage === "booting" && <Boot lang={lang} onDone={showPage} />}
			{stage === "on" && <Portfolio lang={lang} animated={anim} />}
			{/* first visit only: offers a tour once the boot is over */}
			{/* with the intro animation, the box waits for the lines to finish falling */}
			{stage === "on" && <Tutorial lang={lang} delay={anim ? 2800 : 800} />}

			{/* shown everywhere except on the kernel log screen */}
			{stage !== "booting" && (
				<>
					<LangToggle lang={lang} onChange={setLang} />
					<AnimToggle lang={lang} on={anim} onChange={changeAnim} />
				</>
			)}
		</>
	);
}

const app = (
	<StrictMode>
		<App />
	</StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
// import.meta.hot only exists in development: reading it unguarded would crash a production build.
if (import.meta.hot) {
	(import.meta.hot.data.root ??= createRoot(elem)).render(app);
} else {
	createRoot(elem).render(app);
}
