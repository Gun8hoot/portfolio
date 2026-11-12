import type { Lang } from "./Glossary";

// Locations that get a map window when hovered (or tapped, or focused) in the text.
// The key and every alias must match the text exactly (case-sensitive), like the glossary.
export type PlaceEntry = {
	lat: number;
	lon: number;
	zoom: number; // zoom level the map opens at (the visitor can zoom from there)
	label: Record<Lang, string>; // title of the map window
	aliases?: string[];
};

export const PLACES: Record<string, PlaceEntry> = {
	"Le Havre": {
		lat: 49.4938,
		lon: 0.1077,
		zoom: 12,
		label: { en: "Le Havre, France", fr: "Le Havre, France" },
	},
	"Paris": {
		lat: 48.8566,
		lon: 2.3522,
		zoom: 11,
		label: { en: "Paris, France", fr: "Paris, France" },
	},
	"Isle of Oléron": {
		aliases: ["Île d'Oléron"],
		lat: 45.92,
		lon: -1.3,
		zoom: 10,
		label: { en: "Isle of Oléron, France", fr: "Île d'Oléron, France" },
	},
};

// Opens the same spot on openstreetmap.org (keyboard: Enter on the word).
export const osmUrl = ({ lat, lon, zoom }: PlaceEntry) =>
	`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`;
