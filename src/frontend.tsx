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

const elem = document.getElementById("root")!;

type Stage = "off" | "booting" | "on";

function App() {
	const [anim, setAnim] = useAnimations();
	// Animations off: no power-on screen, no boot, straight to the page.
	const [stage, setStage] = useState<Stage>(() => (anim ? "off" : "on"));
	const [lang, setLang] = useLang();

	// Turning them off on the power-on screen goes straight to the page too.
	const changeAnim = (on: boolean) => {
		setAnim(on);
		if (!on && stage === "off") setStage("on");
	};

	return (
		<>
			{stage === "off" && <PreBoot lang={lang} onPowerOn={() => setStage("booting")} />}
			{stage === "booting" && <Boot lang={lang} onDone={() => setStage("on")} />}
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
(import.meta.hot.data.root ??= createRoot(elem)).render(app);
