import { useEffect, useLayoutEffect, useState } from "react";
import "../index.css";
import type { Lang, Localized } from "./Glossary";
import { Term, TermProvider, renderTerms } from "./Term";
import { ProjectWindow } from "./ProjectWindow";
import { ContactForm } from "./ContactForm";

// Each picture must be imported, not just referenced by path: Bun's bundler only
// discovers and serves an asset when it sees a real `import`, the same way it
// discovers index.css's fonts through `url(...)`. A plain string path here
// (e.g. picture: "../assets/logos/midona.svg") will 404, even if the file exists.
import midonaPicture from "../assets/images/logo/midona.svg";
// TODO: as you add the other picture files under src/assets/logos/, import each
// one the same way, e.g.:
// import inceptionPicture from "../assets/logos/inception.svg";

type Profile = { label: string; href: string };
export type Project = {
	label: string;
	state: "finished" | "wip";
	status: "open" | "closed"; // open or closed source
	stack: string[]; // languages/tools used, shown as a grey field next to state/status
	shortDescription: Localized; // ~2 lines, shown under the project on the frontpage
	description: Localized; // longer and more precise, shown in the project window
	learned: Localized; // what you learned building it, shown in the project window
	picture: string; // path to the project's picture/image, shown in the project window
	href: string;
};
type SkillGroup = { label: Localized; items: string[] };
type Hackathon = {
	name: string;
	organizer: string;
	date: string; // start date as YYYY-MM-DD, shown in the visitor's language
	duration: Localized;
	location: Localized;
	position: Localized;
	link: string;
	description: Localized;
};

// Every text that is not project or skill data.
const UI = {
	en: {
		titles: { description: "whoami", skills: "skills", projects: "projects", hackathons: "hackathons", links: "links", contact: "contact" },
		intro: `Hi, I'm Nathan "Gun8hoot" Clavel, a student at 42 Le Havre (France), aspiring to build a career in cybersecurity.`,
		description: "I enjoy coding, reverse engineering and penetration testing, and I'm just as drawn to closely related fields like cryptography, system administration and networking.",
		like2work: "I like working on:",
		likes: [
			"Low-level development in C and C++",
			"Software reverse engineering with Ghidra, Radare2 and JADX",
			"System administration on Linux",
			"Penetration testing",
		],
		searching: "I'm currently looking for an internship or apprenticeship in cybersecurity, system administration or DevOps/DevSecOps, between Paris and Le Havre.",
		ssh: "A terminal version of this portfolio is available. To access it, log in using: ssh portfolio@nathan.clavel.sh",
		states: { finished: "Finished", wip: "In progress" },
		statuses: { open: "Open source", closed: "Closed source" },
		hackathon: { organizer: "organized by", date: "date", duration: "duration", location: "location" },
		project: { description: "description", learned: "what I learned", viewRepo: "Go to repository", close: "Close" },
		contact: {
			emailLabel: "Email",
			subjectLabel: "Subject",
			messageLabel: "Message",
			captchaLabel: (a: number, b: number) => `Quick check: what is ${a} + ${b}?`,
			send: "Send",
			sending: "Sending…",
			success: "Message sent — thanks, I'll get back to you soon!",
			error: "Something went wrong, please try again later.",
			captchaWrong: "That's not quite right — try the new one below.",
			invalid: "Please check the fields and try again.",
		},
	},
	fr: {
		titles: { description: "whoami", skills: "compétences", projects: "projets", hackathons: "hackathons", links: "liens", contact: "contact" },
		intro: `Bonjour, je suis Nathan « Gun8hoot » Clavel, étudiant à 42 Le Havre (France), avec pour ambition de faire carrière dans la cybersécurité.`,
		description: "J'aime coder, faire de la rétro-ingénierie et du pentest, et je m'intéresse tout autant à des domaines proches comme la cryptographie, l'administration système et les réseaux.",
		like2work: "J'aime travailler sur :",
		likes: [
			"Du développement bas niveau en C et C++",
			"De la rétro-ingénierie logicielle avec Ghidra, Radare2 ou JADX",
			"De l'administration système sur les plateformes Linux",
			"Du pentest",
		],
		ssh: "Une version « terminal » de ce portfolio est disponible. Pour y accéder, connectez-vous à l'aide de : ssh portfolio@nathan.clavel.sh",
		searching: "Je suis actuellement à la recherche d'un stage ou d'une alternance en cybersécurité, administration système ou DevOps/DevSecOps, entre Paris et Le Havre.", // TO CREATE REDIRECTION
		states: { finished: "Terminé", wip: "En cours" },
		statuses: { open: "Open source", closed: "Code fermé" },
		hackathon: { organizer: "organisé par", date: "date", duration: "durée", location: "lieu" },
		project: { description: "description", learned: "ce que j'ai appris", viewRepo: "Voir le dépôt", close: "Fermer" },
		contact: {
			emailLabel: "Email",
			subjectLabel: "Sujet",
			messageLabel: "Message",
			captchaLabel: (a: number, b: number) => `Vérification rapide : combien font ${a} + ${b} ?`,
			send: "Envoyer",
			sending: "Envoi…",
			success: "Message envoyé — merci, je reviens vers vous bientôt !",
			error: "Une erreur est survenue, réessayez plus tard.",
			captchaWrong: "Ce n'est pas la bonne réponse — réessayez avec celle-ci.",
			invalid: "Merci de vérifier les champs et de réessayer.",
		},
	},
};

const PROFILES: Profile[] = [
	{ label: "LinkedIn", href: "https://www.linkedin.com/in/clavel-nathan" },
	{ label: "GitHub", href: "https://github.com/Gun8hoot" },
	{ label: "Root-Me", href: "https://www.root-me.org/Gun8hoot" },
	{ label: "HackTheBox", href: "https://app.hackthebox.com/public/users/1595967" },
	{ label: "TryHackMe", href: "https://tryhackme.com/p/Gun8hoot" },
	{ label: "CryptoHack", href: "https://cryptohack.org/user/Gun8hoot/" },
	{ label: "Email", href: "mailto:nclavel@proton.me" },
];

// TODO: the remaining `picture` fields below are still plain string placeholders — they will
// 404 (and fall back to the full-width text layout) until you add the file under
// src/assets/logos/ AND `import` it at the top of this file like midonaPicture above.
const PROJECTS: Project[] = [
	{
		label: "Midona", state: "wip", status: "open",
		stack: ["C++", "ASM", "GNU Make"],
		shortDescription: {
			en: "A runtime crypter for ELF binaries, compressing with LZ4 and encrypting with AES-256 before execution.",
			fr: "Un crypter runtime pour binaires ELF, compressé avec LZ4 et chiffré en AES-256 avant exécution.",
		},
		description: {
			en: "Midona protects ELF executables by compressing them with the LZ4 algorithm and encrypting the resulting payload with AES-256. At runtime, the loader decrypts and decompresses the binary directly in memory, never writing the clear executable to disk, which makes static analysis of the protected program far harder.",
			fr: "Midona protège des exécutables ELF en les compressant avec l'algorithme LZ4 puis en chiffrant la charge utile résultante en AES-256. Au moment de l'exécution, le loader déchiffre et décompresse le binaire directement en mémoire, sans jamais écrire l'exécutable en clair sur le disque, ce qui complique nettement l'analyse statique du programme protégé.",
		},
		learned: {
			en: "I got to see up close how an ELF binary is put together. Implementing LZ4 and AES-256 myself also made those algorithms finally click.",
			fr: "J'ai pu voir de près comment un binaire ELF est construit. Implémenter moi-même LZ4 et AES-256 m'a aussi permis de vraiment comprendre ces algorithmes.",
		},
		picture: midonaPicture,
		href: "https://github.com/Gun8hoot/Midona",
	},
	{
		// Assumption: marked "wip" since a homelab is an ongoing, continuously evolving setup
		// rather than something that's ever really "finished" — change if you'd rather call it done.
		label: "Homelab", state: "wip", status: "open",
		stack: ["Docker", "Linux", "Proxmox"],
		shortDescription: {
			en: "A two-node homelab for self-hosting and malware analysis: a Raspberry Pi running Docker services, and a Proxmox server for isolated analysis.",
			fr: "Un homelab à deux nœuds pour l'auto-hébergement et l'analyse de malwares : un Raspberry Pi avec des services Docker, et un serveur Proxmox pour l'analyse isolée.",
		},
		description: {
			en: "My homelab runs on two nodes with very different jobs. A Raspberry Pi running Alpine Linux hosts a set of self-hosted services in Docker: NGINX, Pi-hole for network-wide ad blocking, Jellyfin for media, Uptime Kuma for monitoring, and Forgejo as a self-hosted Git server. Alongside it, a Proxmox server is dedicated to safely analyzing malware samples inside isolated REMnux and Debian virtual machines, kept fully separated from the rest of the network.",
			fr: "Mon homelab tourne sur deux nœuds aux rôles bien distincts. Un Raspberry Pi sous Alpine Linux héberge un ensemble de services auto-hébergés via Docker : NGINX, Pi-hole pour le blocage de publicités à l'échelle du réseau, Jellyfin pour les médias, Uptime Kuma pour le monitoring, et Forgejo comme serveur Git auto-hébergé. À côté, un serveur Proxmox est dédié à l'analyse sécurisée d'échantillons de malwares, dans des machines virtuelles REMnux et Debian isolées, complètement séparées du reste du réseau.",
		},
		learned: {
			en: "I learned how to actually self-host and maintain a handful of real services with Docker on a small machine like a Raspberry Pi, and, more importantly, how to properly isolate a dedicated malware-analysis environment with Proxmox so it can't touch the rest of the network.",
			fr: "J'ai appris à auto-héberger et maintenir pour de vrai plusieurs services avec Docker sur une petite machine comme un Raspberry Pi, et surtout à isoler correctement un environnement dédié à l'analyse de malwares avec Proxmox, pour qu'il ne puisse pas toucher au reste du réseau.",
		},
		picture: "./assets/logos/homelab.svg",
		href: "https://github.com/gun8hoot/homelab",
	},
	{
		label: "Inception", state: "finished", status: "open",
		stack: ["Docker", "Shell", "GNU Make"],
		shortDescription: {
			en: "A Docker-based infrastructure for the 42 core curriculum: WordPress, NGINX and MariaDB, each in its own container.",
			fr: "Une infrastructure Docker pour le tronc commun de 42 : WordPress, NGINX et MariaDB, chacun dans son propre conteneur.",
		},
		description: {
			en: "Inception is a solo 42 project where the whole infrastructure is built from scratch with Docker and Docker Compose: a custom NGINX image acting as a TLS-terminating reverse proxy, a WordPress site running on PHP-FPM, and a MariaDB database, each in its own container built from a hand-written Dockerfile rather than a pre-built image, connected through a dedicated Docker network and persisted with volumes.",
			fr: "Inception est un projet solo de 42 où toute l'infrastructure est construite de zéro avec Docker et Docker Compose : une image NGINX personnalisée faisant office de reverse proxy avec terminaison TLS, un site WordPress tournant sur PHP-FPM, et une base de données MariaDB, chacun dans son propre conteneur construit à partir d'un Dockerfile écrit à la main plutôt qu'une image préfabriquée, reliés par un réseau Docker dédié et persistés via des volumes.",
		},
		learned: {
			en: "My first real hands-on project with Docker, building several containers from scratch. Also my first time really using NGINX, MariaDB and WordPress.",
			fr: "Mon premier vrai projet pratique avec Docker, à construire plusieurs conteneurs de zéro. Aussi ma première vraie utilisation de NGINX, MariaDB et WordPress.",
		},
		picture: "./assets/logos/inception.svg",
		href: "https://github.com/Gun8hoot/42-Common-Core/tree/main/inception",
	},
	{
		label: "ft_transcendence", state: "finished", status: "open",
		stack: ["HTML", "CSS", "JavaScript", "TypeScript", "Shell", "Docker", "GNU Make"],
		shortDescription: {
			en: "The final 42 Common Core project: a multiplayer slither.io-style snake game with an MS-DOS/Windows 98 look.",
			fr: "Le projet final du tronc commun de 42 : un jeu de serpent multijoueur façon slither.io, à l'esthétique MS-DOS/Windows 98.",
		},
		description: {
			en: "ft_transcendence is the final 42 Common Core group project: a web application with a frontend, a backend and a database, each containerized separately behind an NGINX reverse proxy. Our team built a multiplayer take on slither.io with an MS-DOS/Windows 98 theme: players steer a snake that grows by eating food and dies when it hits the map border or another snake, with no fixed end, you play until you die or close the window. It runs on a TailwindCSS frontend, an ExpressJS backend split into microservices (auth, API, internal JWT validation), MongoDB for storage, and WebSockets for real-time play and chat, with spectator mode, selectable skins and per-player match history.",
			fr: "ft_transcendence est le projet de groupe final du tronc commun de 42 : une application web avec un frontend, un backend et une base de données, chacun conteneurisé séparément derrière un reverse proxy NGINX. Notre équipe a réalisé une version multijoueur de slither.io à l'esthétique MS-DOS/Windows 98 : les joueurs dirigent un serpent qui grandit en mangeant et meurt en touchant le bord de la carte ou un autre serpent, sans fin fixe, on joue jusqu'à la mort ou la fermeture de la fenêtre. Le tout tourne sur un frontend TailwindCSS, un backend ExpressJS découpé en microservices (authentification, API, validation JWT interne), MongoDB pour le stockage, et des WebSockets pour le jeu et le chat en temps réel, avec un mode spectateur, des skins sélectionnables et un historique de match par joueur.",
		},
		learned: {
			en: "I learned how to design and secure an API for real, and how to build a secure infrastructure around it, splitting the frontend, backend and database into separate containers behind a reverse proxy. It's also the project that felt closest to an actual production app, out of everything I've built so far.",
			fr: "J'ai appris à concevoir et sécuriser une API pour de vrai, ainsi qu'à construire une infrastructure sécurisée autour, en séparant le frontend, le backend et la base de données dans des conteneurs distincts derrière un reverse proxy. C'est aussi le projet qui s'est le plus rapproché d'une véritable application en production, parmi tout ce que j'ai fait.",
		},
		picture: "./assets/logos/ft_transcendence.svg",
		href: "https://github.com/banne227/ft_transcendence/",
	},
	{
		label: "CTRL-TUI", state: "wip", status: "open",
		stack: ["C++", "GNU Make"],
		shortDescription: {
			en: "A text user interface library built from scratch in C++, with no external dependency like ncurses.",
			fr: "Une bibliothèque d'interface texte construite de zéro en C++, sans dépendance externe comme ncurses.",
		},
		description: {
			en: "CTRL-TUI is a text user interface (TUI) toolkit written entirely in C++ without relying on an existing library such as ncurses. It handles raw terminal input, screen buffering and redraw, and widget layout itself, giving full control over how the interface renders and reacts to input.",
			fr: "CTRL-TUI est une bibliothèque d'interface utilisateur en mode texte (TUI) écrite entièrement en C++, sans s'appuyer sur une bibliothèque existante comme ncurses. Elle gère elle-même la lecture brute des entrées du terminal, la mise en mémoire tampon et le réaffichage de l'écran, ainsi que la disposition des widgets, offrant un contrôle total sur le rendu de l'interface et sa réaction aux entrées.",
		},
		learned: {
			en: "My first real project in C++, and a good excuse to dig into how a terminal actually works under the hood — input handling, rendering, escape sequences, that sort of thing.",
			fr: "Mon premier vrai projet en C++, et une bonne occasion de creuser le fonctionnement d'un terminal en interne — gestion des entrées, rendu, séquences d'échappement, ce genre de choses.",
		},
		picture: "./assets/logos/ctrl-tui.svg",
		href: "https://github.com/Gun8hoot/CTRL-TUI",
	},
	{
		label: "Cube3D", state: "finished", status: "open",
		stack: ["C", "GNU Make"],
		shortDescription: {
			en: "A 42 core curriculum game in C that renders a pseudo-3D maze in real time using raycasting.",
			fr: "Un jeu du tronc commun de 42 en C qui affiche un labyrinthe en pseudo-3D en temps réel grâce au raycasting.",
		},
		description: {
			en: "Cube3D is a group project from the 42 core curriculum where we wrote, in C, a raycasting engine inspired by early first-person games like Wolfenstein 3D. It casts one ray per screen column to find the nearest wall, then projects textured wall slices to render a navigable pseudo-3D maze from parsed map files, with real-time movement and rotation.",
			fr: "Cube3D est un projet de groupe du tronc commun de 42 où nous avons écrit, en C, un moteur de raycasting inspiré des premiers jeux en vue subjective comme Wolfenstein 3D. Il lance un rayon par colonne d'écran pour trouver le mur le plus proche, puis projette des tranches de mur texturées pour afficher un labyrinthe pseudo-3D navigable à partir de fichiers de carte, avec déplacement et rotation en temps réel.",
		},
		learned: {
			en: "I worked on pretty much every part of the engine, from map parsing to performance optimization. It gave me a much broader view of what a small game engine actually needs.",
			fr: "J'ai touché à presque toutes les parties du moteur, du parsing de carte à l'optimisation des performances. Ça m'a donné une vision bien plus large de ce que demande un petit moteur de jeu.",
		},
		picture: "./assets/logos/cube3d.svg",
		href: "https://github.com/Gun8hoot/Cube3D",
	},
	{
		label: "Minishell", state: "finished", status: "open",
		stack: ["C", "GNU Make"],
		shortDescription: {
			en: "A group project rebuilding, in C, an interactive shell with parsing, pipes and redirections like Bash.",
			fr: "Un projet de groupe recréant, en C, un shell interactif avec parsing, pipes et redirections comme Bash.",
		},
		description: {
			en: "Minishell is a group project from the 42 core curriculum where we rebuilt, in C, an interactive command interpreter close to Bash's core behaviour: a lexer and parser for the command line, execution of built-in and external commands, pipes between processes, input/output redirections, environment variable handling and signal management, all without relying on an existing shell implementation.",
			fr: "Minishell est un projet de groupe du tronc commun de 42 où nous avons recréé, en C, un interpréteur de commandes interactif proche du comportement de base de Bash : un lexer et un parser pour la ligne de commande, l'exécution de commandes internes et externes, des pipes entre processus, la gestion des redirections d'entrée/sortie, des variables d'environnement et des signaux, le tout sans s'appuyer sur une implémentation de shell existante.",
		},
		learned: {
			en: "Understanding how a shell like Bash really works internally. It also pushed my C skills quite a bit further.",
			fr: "Comprendre comment un shell comme Bash fonctionne vraiment en interne. Ça a aussi fait progresser mon niveau en C.",
		},
		picture: "./assets/logos/minishell.svg",
		href: "https://github.com/thlibers/minishell",
	},
	{
		label: "PyFTPAnon", state: "finished", status: "open",
		stack: ["Python"],
		shortDescription: {
			en: "A Python scanner that checks whether an FTP server allows anonymous, account-free logins.",
			fr: "Un scanner Python qui vérifie si un serveur FTP autorise les connexions anonymes sans compte.",
		},
		description: {
			en: "PyFTPAnon is a small scanner written in Python that connects to a given FTP server and attempts to log in with the anonymous account to check whether it is enabled. It reports whether anonymous access is possible and, if so, what the account can reach, helping spot a common FTP misconfiguration quickly.",
			fr: "PyFTPAnon est un petit scanner écrit en Python qui se connecte à un serveur FTP donné et tente de s'y connecter avec le compte anonymous pour vérifier s'il est activé. Il indique si l'accès anonyme est possible et, le cas échéant, ce que ce compte permet d'atteindre, afin de repérer rapidement une mauvaise configuration FTP courante.",
		},
		learned: {
			en: "A simple project, but it taught me how FTP actually works, and it's also where I picked up the basics of Python.",
			fr: "Un projet simple, mais qui m'a appris le fonctionnement du protocole FTP, et qui m'a aussi servi à apprendre les bases de Python.",
		},
		picture: "./assets/logos/pyftpanon.svg",
		href: "https://github.com/Gun8hoot/PyFTPAnon",
	},
	{
		label: "WWipp", state: "wip", status: "open",
		stack: ["C", "GNU Make"],
		shortDescription: {
			en: "A Linux wiper written in C that walks a filesystem and securely erases every file it finds.",
			fr: "Un wiper Linux écrit en C qui parcourt un système de fichiers et efface chaque fichier de façon sécurisée.",
		},
		description: {
			en: "WWipp is a wiper for Linux written in C. It walks the filesystem from a given path, and for every file it finds, overwrites its content before deleting it, so the data cannot be trivially recovered afterwards. It was built to understand how this class of destructive tooling works and what makes file recovery hard or easy after deletion.",
			fr: "WWipp est un wiper pour Linux écrit en C. Il parcourt le système de fichiers à partir d'un chemin donné et, pour chaque fichier trouvé, écrase son contenu avant de le supprimer, afin que les données ne puissent pas être récupérées trivialement. Il a été conçu pour comprendre le fonctionnement de ce type d'outil destructeur et ce qui rend la récupération de fichiers plus ou moins facile après suppression.",
		},
		learned: {
			en: "I learned how files are really managed on disk, and what it actually takes to erase them securely.",
			fr: "J'ai appris comment les fichiers sont vraiment gérés sur le disque, et ce qu'implique un effacement réellement sécurisé.",
		},
		picture: "./assets/logos/wwipp.svg",
		href: "https://github.com/Gun8hoot/WWipp",
	},
	{
		label: "ft_irc", state: "wip", status: "open",
		stack: ["C++", "GNU Make"],
		shortDescription: {
			en: "A group project building an IRC server in C++, handling channels, messaging and operators.",
			fr: "Un projet de groupe qui construit un serveur IRC en C++, gérant salons, messages et opérateurs.",
		},
		description: {
			en: "ft_irc is a group project from the 42 core curriculum where we implemented an IRC server in C++ following the core of the IRC protocol: client authentication, nicknames, joining and managing channels, private and channel messaging, and operator commands such as kicking, inviting or setting topics and modes, all handled over non-blocking sockets for multiple simultaneous clients.",
			fr: "ft_irc est un projet de groupe du tronc commun de 42 où nous avons implémenté un serveur IRC en C++ suivant le cœur du protocole IRC : authentification des clients, pseudonymes, création et gestion de salons, messages privés et de salon, ainsi que des commandes d'opérateur comme l'exclusion, l'invitation ou la gestion des topics et modes, le tout géré via des sockets non bloquantes pour plusieurs clients simultanés.",
		},
		learned: {
			en: "I learned the IRC protocol inside out, and got a much better grasp of Unix sockets along the way.",
			fr: "J'ai appris le protocole IRC de fond en comble, et bien mieux compris les sockets Unix au passage.",
		},
		picture: "./assets/logos/ft_irc.svg",
		href: "https://github.com/thlibers/irc",
	},
	{
		label: "Portfolio", state: "finished", status: "open",
		stack: ["TypeScript", "CSS", "HTML"],
		shortDescription: {
			en: "The terminal-themed website you are currently on, built with React and served with Bun.",
			fr: "Le site au thème terminal sur lequel vous êtes, construit avec React et servi avec Bun.",
		},
		description: {
			en: "This portfolio is the website you are currently browsing: a single-page React application styled like a terminal and a markdown document, served by a lightweight Bun server. It includes a fake boot sequence, a bilingual interface, glossary tooltips on technical terms, and this very project window.",
			fr: "Ce portfolio est le site que vous êtes en train de parcourir : une application React monopage au style terminal et document markdown, servie par un serveur Bun léger. Il comprend une fausse séquence de démarrage, une interface bilingue, des info-bulles de glossaire sur les termes techniques, et cette fenêtre de projet elle-même.",
		},
		learned: {
			en: "I'm not a web developer, so I leaned on AI for a good chunk of the frontend here, things like React, I'll say it plainly to save time. What I did genuinely learn is running a Linux server in real production conditions: this is the first machine I've set up to stay up 24/7, which meant locking it down properly, Cloudflare in front of it and a hardened SSH setup included.",
			fr: "Je ne suis pas développeur web, donc je me suis appuyé sur l'IA pour une bonne partie du frontend ici, React par exemple, je le dis simplement, pour gagner du temps. Ce que j'ai vraiment appris, en revanche, c'est à faire tourner un serveur Linux en conditions réelles de production : c'est la première machine que je configure pour qu'elle tourne 24h/24, ce qui impliquait de la sécuriser sérieusement, avec Cloudflare devant et une configuration SSH durcie.",
		},
		picture: "./assets/logos/portfolio.svg",
		href: "https://github.com/Gun8hoot/portfolio",
	},
];

// TODO: replace this example with your real hackathons. An empty list hides the section.
const HACKATHONS: Hackathon[] = [
	{
		name: "42 x DINUM",
		organizer: "42",
		date: "2025-09-14",
		duration: { en: "5 days", fr: "5 jours" },
		location: { en: "Isle of Oléron, France", fr: "Île d'Oléron, France" },
		position: { en: "", fr: "" },
		link: "https://github.com/liliane0128/PassOn_Dinum",
		description:
		{
			en: "In this hackathon organized by 42 and DINUM, we coded ",
			fr: "Dans ce hackathon organisé par 42 et la DINUM, nous avons codé "
		},
	},
];

// "2025-03-14" -> "March 14, 2025" / "14 mars 2025"
const formatDate = (iso: string, lang: Lang) =>
	new Date(iso).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Group labels are kept short on purpose: they sit in a 12ch column.
const SKILLS: SkillGroup[] = [
	{ label: { en: "languages", fr: "langages" }, items: ["C", "C++", "JS", "TS", "Shell", "Python", "GNU Make", "ASM x86-x64"] },
	{ label: { en: "reversing", fr: "reverse" }, items: ["Ghidra", "Radare2", "JADX"] },
	{ label: { en: "systems", fr: "systèmes" }, items: ["Linux", "Docker", "Git", "AppArmor"] },
	{ label: { en: "services", fr: "services" }, items: ["NGINX"] },
	{ label: { en: "security", fr: "sécurité" }, items: ["Hashcat", "Burp Suite"] },
	{ label: { en: "network", fr: "réseaux"}, items: ["Wireshark", "nmap"]},
];

// "https://www.github.com/Gun8hoot/" -> "github.com/Gun8hoot"
// "mailto:contact@nathan.clavel.sh"  -> "contact@nathan.clavel.sh"
const shortUrl = (href: string) =>
	href.replace(/^https?:\/\/(www\.)?/, "").replace(/^mailto:/, "").replace(/\/$/, "");

export function Portfolio({ lang }: { lang: Lang })
{
	const t = UI[lang];
	const [openProject, setOpenProject] = useState<Project | null>(null);
	const [brokenPictures, setBrokenPictures] = useState<Set<string>>(new Set());

	// The boothist screen leaves the page scrolled to the bottom: start at the top.
	useLayoutEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	// Preload every project's picture as soon as the page loads, so by the time
	// someone actually opens a window we already know which pictures are broken
	// and ProjectWindow can pick the right layout on its first paint — rather
	// than starting with the picture column and only discovering it's missing
	// (via the <img>'s onError) after the window has already been shown.
	useEffect(() => {
		for (const project of PROJECTS) {
			const img = new Image();
			img.onerror = () => setBrokenPictures((prev) => new Set(prev).add(project.picture));
			img.src = project.picture;
		}
	}, []);

	return (
		<TermProvider lang={lang}>
			<main className="portfolio">
				<h1 className="name">
					Nathan "Gun8hoot" Clavel<span className="cursor" aria-hidden="true">█</span>
				</h1>

				<h2 className="section_title">{t.titles.description}</h2>
				<div className="description">
					<p>{renderTerms(t.intro)}</p>
					<p>{renderTerms(t.description)}</p>
					<p>{renderTerms(t.like2work)}</p>
					<ul>
						{t.likes.map((like) => (
							<li key={like}>{renderTerms(like)}</li>
						))}
					</ul>
					<p>{renderTerms(t.searching)}</p>
					{/*<p>{renderTerms(t.ssh)}</p>*/}
				</div>

				<h2 className="section_title">{t.titles.skills}</h2>
				<ul className="skills">
					{SKILLS.map(({ label, items }) => (
						<li className="skill_row" key={label.en}>
							<span className="skill_group">{label[lang]}</span>
							<ul className="skill_items">
								{items.map((item) => (
									<li key={item}><Term name={item}>{item}</Term></li>
								))}
							</ul>
						</li>
					))}
				</ul>

				<h2 className="section_title">{t.titles.projects}</h2>
				<ul className="project">
					{PROJECTS.map((project) => {
						const { label, state, status, stack, shortDescription } = project;
						return (
							<li key={label}>
								{/* clicking a project opens the ProjectWindow instead of navigating away */}
								<button type="button" className="link" onClick={() => setOpenProject(project)}>
									<span className="link_name">{label}</span>
									<span className={`project_state ${state === "finished" ? "project_state--done" : "project_state--wip"}`}>{t.states[state]}</span>
									<span className="link_url">{t.statuses[status]}</span>
								</button>
								<p className="project_stack">{stack.join(", ")}</p>
								{shortDescription[lang] && <p className="project_desc">{renderTerms(shortDescription[lang])}</p>}
							</li>
						);
					})}
				</ul>

				{openProject && (
					<ProjectWindow
						key={openProject.label}
						project={openProject}
						lang={lang}
						pictureBroken={brokenPictures.has(openProject.picture)}
						ui={{
							description: t.project.description,
							learned: t.project.learned,
							viewRepo: t.project.viewRepo,
							close: t.project.close,
							states: t.states,
							statuses: t.statuses,
						}}
						onClose={() => setOpenProject(null)}
					/>
				)}

				{HACKATHONS.length > 0 && (
					<>
						<h2 className="section_title">{t.titles.hackathons}</h2>
						<ul className="hackathons">
							{HACKATHONS.map(({ name, organizer, date, duration, location, position, link, description }) => (
								<li key={`${name}-${date}`}>
									<a className="link" href={link} target="_blank" rel="noopener noreferrer">
										<span className="link_name">{name}</span>
										<span className="hack_position">{position[lang]}</span>
										<span className="link_url">{shortUrl(link)}</span>
									</a>
									<dl className="hack_meta">
										<div><dt>{t.hackathon.organizer}</dt><dd>{organizer}</dd></div>
										<div><dt>{t.hackathon.date}</dt><dd>{formatDate(date, lang)}</dd></div>
										<div><dt>{t.hackathon.duration}</dt><dd>{duration[lang]}</dd></div>
										<div><dt>{t.hackathon.location}</dt><dd>{location[lang]}</dd></div>
									</dl>
								</li>
							))}
						</ul>
					</>
				)}

				<h2 className="section_title">{t.titles.links}</h2>
				<ul className="social">
					{PROFILES.map(({ label, href }) => (
						<li key={label}>
							<a className="link" href={href} target="_blank" rel="noopener noreferrer">
								<span className="link_name">{label}</span>
								<span className="link_url">{shortUrl(href)}</span>
							</a>
						</li>
					))}
				</ul>

				<h2 className="section_title">{t.titles.contact}</h2>
				<ContactForm ui={t.contact} />
			</main>
		</TermProvider>
	);
}
