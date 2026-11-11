
// Lets TypeScript understand `import logo from "../assets/logos/midona.svg"`.
// If `bun-types` already declares this for you, this file is harmless to keep
// (TS just ignores the duplicate) — but if you get an error like
// "Cannot find module '...svg' or its corresponding type declarations",
// drop this file anywhere under src/ (e.g. src/types/images.d.ts).

declare module "*.svg" {
	const src: string;
	export default src;
}

declare module "*.png" {
	const src: string;
	export default src;
}
