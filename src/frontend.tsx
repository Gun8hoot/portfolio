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
import { Tutorial } from "./components/Tutorial";

const elem = document.getElementById("root")!;

type Stage = "off" | "booting" | "on";

function App() {
	const [stage, setStage] = useState<Stage>("off");
	const [lang, setLang] = useLang();

	return (
		<>
			{stage === "off" && <PreBoot lang={lang} onPowerOn={() => setStage("booting")} />}
			{stage === "booting" && <Boot lang={lang} onDone={() => setStage("on")} />}
			{stage === "on" && <Portfolio lang={lang} />}
			{/* first visit only: offers a tour once the boot is over */}
			{stage === "on" && <Tutorial lang={lang} />}

			{/* shown everywhere except on the kernel log screen */}
			{stage !== "booting" && <LangToggle lang={lang} onChange={setLang} />}
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
